import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  Cloud,
  FileSpreadsheet,
  Download,
  Copy,
  Check,
  Search,
  ExternalLink,
  ShieldCheck,
  Phone,
  RefreshCw,
  Trash2,
  Key,
} from 'lucide-react';
import { FormSubmission } from '../types';

interface AdminDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const APPS_SCRIPT_SNIPPET = `// Google Apps Script - Victoria Rose Form Sync
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Auto-create headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "کد رهگیری", "تاریخ و زمان", "نام و تخلص", "شماره تماس و واتساپ", 
        "میزان تحصیلات", "سابقه کار (سال)", "نام شرکت قبلی",
        "لینک صفحات مجازی", "تعداد فالوور", "مراکز مرتبط", "یادداشت‌ها", "آدرس IP"
      ]);
    }
    
    var data = JSON.parse(e.postData.contents);
    var centers = Array.isArray(data.networkCenters) 
      ? data.networkCenters.map(function(c){ return (c.name || "") + " (" + (c.address || "") + ")"; }).filter(Boolean).join(" | ")
      : "";

    sheet.appendRow([
      data.id || "",
      new Date().toLocaleString("fa-AF"),
      data.fullName || "",
      data.phoneWhatsapp || "",
      data.education || "",
      data.salesExperienceYears || "",
      data.previousCompanyName || "",
      data.socialProfileUrl || "",
      data.totalFollowers || "",
      centers,
      data.candidateNotes || "",
      data.ip || ""
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

export const AdminDriveModal: React.FC<AdminDriveModalProps> = ({ isOpen, onClose }) => {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSavedWebhook, setIsSavedWebhook] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchAdminData();
    }
  }, [isOpen]);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/submissions');
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data.submissions || []);
        setWebhookUrl(data.googleDriveWebhookUrl || '');
      }
    } catch (e) {
      console.error('Failed to load admin data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveWebhook = async () => {
    try {
      const res = await fetch('/api/admin/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl, adminKey }),
      });
      if (res.ok) {
        setIsSavedWebhook(true);
        setTimeout(() => setIsSavedWebhook(false), 3000);
      }
    } catch (e) {
      console.error('Error saving webhook:', e);
    }
  };

  const handleTestWebhook = async () => {
    setIsTestingWebhook(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/admin/webhook/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({ ok: true, msg: 'اتصال با موفقیت برقرار شد و ردیف تستی در گوگل شیت ثبت شد!' });
      } else {
        setTestResult({ ok: false, msg: data.error || 'خطا در برقراری ارتباط با وب‌هوک.' });
      }
    } catch (e: any) {
      setTestResult({ ok: false, msg: e.message || 'خطا در شبکه' });
    } finally {
      setIsTestingWebhook(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا از حذف این فورم اطمینان دارید؟')) return;
    try {
      const res = await fetch(`/api/admin/submissions/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminKey }),
      });
      if (res.ok) {
        setSubmissions((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (e) {
      console.error('Failed to delete:', e);
    }
  };

  const exportToCSV = () => {
    if (submissions.length === 0) return;
    const headers = [
      'کد رهگیری',
      'تاریخ و زمان',
      'نام و تخلص',
      'شماره تماس و واتساپ',
      'میزان تحصیلات',
      'سابقه کار (سال)',
      'نام شرکت قبلی',
      'لینک صفحات مجازی',
      'تعداد فالوور',
      'یادداشت‌ها',
      'آدرس IP',
    ];

    const rows = submissions.map((s) => [
      s.id,
      new Date(s.submittedAt).toLocaleString('fa-AF'),
      s.fullName,
      s.phoneWhatsapp,
      s.education,
      s.salesExperienceYears,
      s.previousCompanyName || '',
      s.socialProfileUrl,
      s.totalFollowers,
      (s.candidateNotes || '').replace(/"/g, '""'),
      s.ip,
    ]);

    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.map((cell) => `"${cell || ''}"`).join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VictoriaRose_Submissions_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyAppsScript = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_SNIPPET);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const filteredSubmissions = submissions.filter((s) => {
    const q = searchTerm.toLowerCase();
    return (
      (s.fullName || '').toLowerCase().includes(q) ||
      (s.phoneWhatsapp || '').includes(q) ||
      (s.previousCompanyName || '').toLowerCase().includes(q) ||
      (s.id || '').toLowerCase().includes(q)
    );
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" dir="rtl">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-purple-100 shadow-2xl">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#802882] to-purple-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                مدیریت فورم‌ها و Google Drive Webhook
              </h2>
              <p className="text-[11px] text-purple-200">
                مشاهده فورم‌ها و اتصال به گوگل شیت
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* Webhook Configuration */}
          <div className="p-4 sm:p-5 rounded-2xl bg-purple-50/60 border border-[#802882]/20 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-[#802882]" />
                <h3 className="text-sm font-bold text-gray-900">
                  تنظیم Google Drive / Google Sheets Webhook
                </h3>
              </div>
              <button
                type="button"
                onClick={copyAppsScript}
                className="text-xs px-3 py-1.5 rounded-xl bg-white text-[#802882] border border-[#802882]/30 hover:bg-[#802882] hover:text-white transition-all flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'کد اسکریپت کپی شد!' : 'کپی کد آماده Apps Script'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  آدرس Webhook گوگل اپس اسکریپت (Web App URL):
                </label>
                <input
                  type="url"
                  dir="ltr"
                  placeholder="https://script.google.com/macros/s/.../exec"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:border-[#802882] focus:ring-1 focus:ring-[#802882] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <Key className="w-3 h-3 text-gray-500" />
                  <span>کلید مدیریت (اختیاری):</span>
                </label>
                <input
                  type="password"
                  placeholder="کلید عبور"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:border-[#802882] outline-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleSaveWebhook}
                className="px-4 py-2 rounded-xl bg-[#802882] text-white text-xs font-bold hover:bg-[#6a1f6c] transition-all flex items-center gap-1.5 shadow-sm"
              >
                {isSavedWebhook ? <Check className="w-3.5 h-3.5" /> : <Cloud className="w-3.5 h-3.5" />}
                <span>{isSavedWebhook ? 'ذخیره شد' : 'ذخیره آدرس Webhook'}</span>
              </button>

              <button
                type="button"
                disabled={!webhookUrl || isTestingWebhook}
                onClick={handleTestWebhook}
                className="px-4 py-2 rounded-xl bg-white border border-purple-200 text-[#802882] text-xs font-semibold hover:bg-purple-50 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {isTestingWebhook ? (
                  <div className="w-3.5 h-3.5 border-2 border-[#802882] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ExternalLink className="w-3.5 h-3.5" />
                )}
                <span>ارسال رکورد تستی</span>
              </button>
            </div>

            {testResult && (
              <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                testResult.ok ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                <span>{testResult.msg}</span>
              </div>
            )}
          </div>

          {/* Submissions Section */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-gray-900">
                  فهرست فورم‌های دریافتی ({submissions.length} مورد)
                </h3>
                <button
                  type="button"
                  onClick={fetchAdminData}
                  className="p-1 text-gray-500 hover:text-[#802882] transition-colors"
                  title="تازه‌سازی"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute right-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="جستجو در نام، شماره یا شرکت..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-8 pl-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:border-[#802882] outline-none w-48 sm:w-60"
                  />
                </div>

                <button
                  type="button"
                  onClick={exportToCSV}
                  disabled={submissions.length === 0}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>اکسل / CSV</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-right text-xs">
                  <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200 sticky top-0 z-10">
                    <tr>
                      <th className="p-3">نام و تخلص</th>
                      <th className="p-3">شماره تماس / واتساپ</th>
                      <th className="p-3">تحصیلات</th>
                      <th className="p-3">سابقه (سال)</th>
                      <th className="p-3">شرکت قبلی</th>
                      <th className="p-3">شبکه اجتماعی</th>
                      <th className="p-3">تاریخ ثبت</th>
                      <th className="p-3 text-center">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {filteredSubmissions.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-gray-400">
                          {isLoading ? 'در حال بارگذاری اطلاعات...' : 'هیچ فورمی یافت نشد.'}
                        </td>
                      </tr>
                    ) : (
                      filteredSubmissions.map((s) => (
                        <tr key={s.id} className="hover:bg-purple-50/40 transition-colors">
                          <td className="p-3 font-bold text-gray-900">{s.fullName || '—'}</td>
                          <td className="p-3">
                            <a
                              href={`https://wa.me/${(s.phoneWhatsapp || '').replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-700 hover:underline flex items-center gap-1 font-mono"
                            >
                              <Phone className="w-3 h-3 text-emerald-600" />
                              <span>{s.phoneWhatsapp}</span>
                            </a>
                          </td>
                          <td className="p-3 text-gray-600">{s.education || '—'}</td>
                          <td className="p-3 font-semibold text-[#802882]">{s.salesExperienceYears || '0'} سال</td>
                          <td className="p-3 text-gray-600">{s.previousCompanyName || '—'}</td>
                          <td className="p-3 text-gray-600">
                            {s.socialProfileUrl ? (
                              <a href={s.socialProfileUrl} target="_blank" rel="noopener noreferrer" className="text-[#802882] hover:underline">
                                {s.totalFollowers ? `${s.totalFollowers} فالوور` : 'لینک'}
                              </a>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="p-3 text-gray-400 text-[11px]">
                            {new Date(s.submittedAt).toLocaleDateString('fa-AF')}
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => handleDelete(s.id)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              title="حذف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-semibold transition-all"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
