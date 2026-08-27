import React, { useState, useEffect } from 'react';
import { BrandHeader } from './components/BrandHeader';
import { PersonalInfoSection } from './components/PersonalInfoSection';
import { SalesExperienceSection } from './components/SalesExperienceSection';
import { ContentCameraSection } from './components/ContentCameraSection';
import { StrategyNotesSection } from './components/StrategyNotesSection';
import { SubmissionSuccessModal } from './components/SubmissionSuccessModal';
import { AdminDriveModal } from './components/AdminDriveModal';
import { FormDataState, FormSubmission, IpStatusResponse } from './types';
import { Cloud } from 'lucide-react';

const INITIAL_FORM_DATA: FormDataState = {
  fullName: '',
  phoneWhatsapp: '',
  education: '',
  salesExperienceYears: '',
  previousCompanyName: '',
  networkCenters: [
    { id: '1', name: '', address: '' },
    { id: '2', name: '', address: '' },
    { id: '3', name: '', address: '' },
  ],
  socialProfileUrl: '',
  totalFollowers: '',
  candidateNotes: '',
};

export default function App() {
  const [formData, setFormData] = useState<FormDataState>(() => {
    try {
      const saved = localStorage.getItem('vr_form_draft');
      if (saved) {
        return { ...INITIAL_FORM_DATA, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Could not read draft from localStorage', e);
    }
    return INITIAL_FORM_DATA;
  });

  const [ipStatus, setIpStatus] = useState<IpStatusResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals state
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  // Fetch client IP status on load
  useEffect(() => {
    fetchIpStatus();
  }, []);

  // Save form draft to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('vr_form_draft', JSON.stringify(formData));
    } catch (e) {
      console.warn('Could not save draft to localStorage', e);
    }
  }, [formData]);

  const fetchIpStatus = async () => {
    try {
      const res = await fetch('/api/ip-status');
      if (res.ok) {
        const data = await res.json();
        setIpStatus(data);
      }
    } catch (err) {
      // In static environments like GitHub Pages, fallback to default allow
      setIpStatus({
        ip: 'client',
        submissionsCount: 0,
        remainingSubmissions: 3,
        maxAllowed: 3,
        canSubmit: true,
      });
    }
  };

  const handleFormChange = (fields: Partial<FormDataState>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmit = async () => {
    if (!formData.fullName.trim() || !formData.phoneWhatsapp.trim()) {
      setErrorMessage('لطفاً نام و شماره واتساپ خود را وارد نمایید.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    let submittedSuccessfully = false;

    // 1. Try server endpoint
    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const contentType = response.headers.get('content-type') || '';
      if (response.ok && contentType.includes('application/json')) {
        const result = await response.json();
        if (result.success) {
          submittedSuccessfully = true;
        } else {
          setErrorMessage(result.error || 'خطا در ارسال فورم. لطفاً دوباره تلاش نمایید.');
          setIsSubmitting(false);
          return;
        }
      }
    } catch (err) {
      console.log('Server endpoint not reachable, proceeding with client-side/webhook handling');
    }

    // 2. Client-side resilience (For GitHub Pages & direct Google Webhook)
    const submissionId = 'VR-' + Math.random().toString(36).substring(2, 7).toUpperCase();
    const newSubmission: FormSubmission = {
      ...formData,
      id: submissionId,
      ip: 'github-pages',
      submittedAt: new Date().toISOString(),
    };

    // Save in local storage
    try {
      const existing = JSON.parse(localStorage.getItem('vr_submissions') || '[]');
      existing.unshift(newSubmission);
      localStorage.setItem('vr_submissions', JSON.stringify(existing));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    // Forward to saved Webhook directly from browser if configured
    const savedWebhook = localStorage.getItem('vr_webhook_url');
    if (savedWebhook) {
      try {
        await fetch(savedWebhook, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newSubmission),
        });
      } catch (e) {
        console.warn('Direct webhook delivery warning:', e);
      }
    }

    submittedSuccessfully = true;

    if (submittedSuccessfully) {
      setIsSuccessOpen(true);
      localStorage.removeItem('vr_form_draft');
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#FAF8FA] text-[#1E1B24] flex flex-col justify-between" dir="rtl">
      <div>
        {/* Brand Header */}
        <BrandHeader onOpenAdmin={() => setIsAdminOpen(true)} />

        {/* Main Content Area */}
        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-12">
          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm font-medium flex items-center justify-between shadow-sm">
              <span>{errorMessage}</span>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-red-500 hover:text-red-800 font-bold px-2"
              >
                ✕
              </button>
            </div>
          )}

          {/* Form Sections */}
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            {/* ۱. معلومات فردی */}
            <PersonalInfoSection
              data={formData}
              onChange={handleFormChange}
            />

            {/* ۲. بررسی سوابق کاری */}
            <SalesExperienceSection
              data={formData}
              onChange={handleFormChange}
            />

            {/* ۳. استعداد در شبکه‌های اجتماعی */}
            <ContentCameraSection
              data={formData}
              onChange={handleFormChange}
            />

            {/* ۵. یادداشت‌ها و دکمه ارسال */}
            <StrategyNotesSection
              data={formData}
              onChange={handleFormChange}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              ipStatus={ipStatus}
            />
          </form>
        </main>
      </div>

      {/* Brand Footer */}
      <footer className="bg-white border-t border-purple-100 py-6 px-4 text-center">
        <p className="text-sm font-bold text-[#802882] tracking-wider mb-3">
          - ویکتوریارز رایحه جذابیت -
        </p>

        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={() => setIsAdminOpen(true)}
            className="text-[11px] text-gray-400 hover:text-[#802882] transition-colors flex items-center gap-1"
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>تنظیمات و ورود به گوگل درایو</span>
          </button>
        </div>
      </footer>

      {/* Modals */}
      <SubmissionSuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
      />

      <AdminDriveModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />
    </div>
  );
}
