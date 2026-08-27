import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { FormDataState, FormSubmission } from './src/types';

interface StoreData {
  submissions: FormSubmission[];
  ipCounts: Record<string, number>;
  googleDriveWebhookUrl: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'submissions.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error('Error creating data dir:', err);
  }
}

// Initial store state
let store: StoreData = {
  submissions: [],
  ipCounts: {},
  googleDriveWebhookUrl: process.env.GOOGLE_DRIVE_WEBHOOK_URL || '',
};

// Load saved data if available
if (fs.existsSync(DATA_FILE)) {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    store = {
      submissions: parsed.submissions || [],
      ipCounts: parsed.ipCounts || {},
      googleDriveWebhookUrl: parsed.googleDriveWebhookUrl || process.env.GOOGLE_DRIVE_WEBHOOK_URL || '',
    };
  } catch (err) {
    console.error('Error reading data file:', err);
  }
}

function saveStore() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save store:', err);
  }
}

function getClientIp(req: express.Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  } else if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0].trim();
  }
  return req.socket.remoteAddress || '127.0.0.1';
}

async function forwardToGoogleDriveWebhook(webhookUrl: string, submission: FormSubmission) {
  if (!webhookUrl) return;
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: 'victoria_rose_form_submission',
        timestamp: submission.submittedAt,
        id: submission.id,
        fullName: submission.fullName,
        phoneWhatsapp: submission.phoneWhatsapp,
        education: submission.education,
        salesExperienceYears: submission.salesExperienceYears,
        previousCompanyName: submission.previousCompanyName,
        networkCenters: submission.networkCenters,
        socialProfileUrl: submission.socialProfileUrl,
        totalFollowers: submission.totalFollowers,
        candidateNotes: submission.candidateNotes,
        ip: submission.ip,
      }),
    });
    if (!response.ok) {
      console.warn('Webhook responded with status:', response.status);
    }
  } catch (error) {
    console.error('Failed forwarding to Google Drive webhook:', error);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // --- API Endpoints ---

  // 1. Check IP status
  app.get('/api/ip-status', (req, res) => {
    const ip = getClientIp(req);
    const count = store.ipCounts[ip] || 0;
    const maxAllowed = 3;
    res.json({
      ip,
      submissionsCount: count,
      remainingSubmissions: Math.max(0, maxAllowed - count),
      maxAllowed,
      canSubmit: count < maxAllowed,
    });
  });

  // 2. Submit Form
  app.post('/api/submit', async (req, res) => {
    try {
      const ip = getClientIp(req);
      const currentCount = store.ipCounts[ip] || 0;

      if (currentCount >= 3) {
        return res.status(429).json({
          success: false,
          error: 'سقف مجاز ۳ فورم برای این آدرس اینترنتی تکمیل شده است.',
        });
      }

      const body = req.body as FormDataState;

      // Basic validation
      if (!body.fullName?.trim() || !body.phoneWhatsapp?.trim()) {
        return res.status(400).json({
          success: false,
          error: 'لطفاً نام و شماره واتساپ را وارد نمایید.',
        });
      }

      const submissionId = 'VR-' + Math.random().toString(36).substring(2, 7).toUpperCase();

      const newSubmission: FormSubmission = {
        ...body,
        id: submissionId,
        ip,
        submittedAt: new Date().toISOString(),
      };

      store.submissions.unshift(newSubmission);
      store.ipCounts[ip] = currentCount + 1;
      saveStore();

      // Forward to Google Drive Webhook in background
      if (store.googleDriveWebhookUrl) {
        forwardToGoogleDriveWebhook(store.googleDriveWebhookUrl, newSubmission).catch(console.error);
      }

      return res.json({
        success: true,
        message: 'فورم با موفقیت ثبت شد.',
        submissionId,
        remainingSubmissions: Math.max(0, 3 - store.ipCounts[ip]),
        forwardedToDrive: !!store.googleDriveWebhookUrl,
      });
    } catch (err: any) {
      console.error('Submit error:', err);
      return res.status(500).json({
        success: false,
        error: 'خطا در ثبت اطلاعات در سرور.',
      });
    }
  });

  // 3. Admin: Get all submissions
  app.get('/api/admin/submissions', (req, res) => {
    res.json({
      submissions: store.submissions,
      googleDriveWebhookUrl: store.googleDriveWebhookUrl,
      totalCount: store.submissions.length,
    });
  });

  // 4. Admin: Update Google Drive Webhook
  app.post('/api/admin/webhook', (req, res) => {
    const { webhookUrl } = req.body;
    store.googleDriveWebhookUrl = webhookUrl || '';
    saveStore();
    res.json({ success: true, googleDriveWebhookUrl: store.googleDriveWebhookUrl });
  });

  // 5. Admin: Test Webhook
  app.post('/api/admin/webhook/test', async (req, res) => {
    const { webhookUrl } = req.body;
    if (!webhookUrl) {
      return res.status(400).json({ success: false, error: 'آدرس Webhook وارد نشده است' });
    }

    try {
      const testData: FormSubmission = {
        id: 'TEST-' + Date.now().toString(36).toUpperCase(),
        fullName: 'تست سیستم ویکتوریا روز',
        phoneWhatsapp: '0799999999',
        education: 'لیسانس',
        salesExperienceYears: '3',
        previousCompanyName: 'شرکت نمونه',
        networkCenters: [{ id: '1', name: 'دواخانه تست', address: 'مزار شریف' }],
        socialProfileUrl: 'instagram.com/test',
        totalFollowers: '1200',
        candidateNotes: 'پیام تستی سیستم',
        ip: getClientIp(req),
        submittedAt: new Date().toISOString(),
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'test_connection',
          ...testData,
        }),
      });

      if (response.ok) {
        return res.json({ success: true, message: 'اتصال با موفقیت انجام شد' });
      } else {
        return res.status(400).json({
          success: false,
          error: `پاسخ وب‌هوک وضعیت ناموفق برگرداند: ${response.status}`,
        });
      }
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message || 'خطا در ارتباط با سرور وب‌هوک' });
    }
  });

  // 6. Admin: Delete a submission
  app.delete('/api/admin/submissions/:id', (req, res) => {
    const id = req.params.id;
    store.submissions = store.submissions.filter((s) => s.id !== id);
    saveStore();
    res.json({ success: true });
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
