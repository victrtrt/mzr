export interface NetworkCenter {
  id: string;
  name: string;
  address: string;
}

export interface FormDataState {
  // ۱. معلومات فردی
  fullName: string;
  phoneWhatsapp: string;
  education: string;

  // ۲. بررسی سوابق کاری
  salesExperienceYears: string;
  previousCompanyName: string;
  networkCenters: NetworkCenter[];

  // ۳. استعداد در شبکه‌های اجتماعی
  socialProfileUrl: string;
  totalFollowers: string;

  // ۵. یادداشت‌ها
  candidateNotes: string;
}

export interface FormSubmission extends FormDataState {
  id: string;
  ip: string;
  submittedAt: string;
}

export interface IpStatusResponse {
  ip: string;
  submissionsCount: number;
  remainingSubmissions: number;
  maxAllowed: number;
  canSubmit: boolean;
}

export interface SubmitResponse {
  success: boolean;
  message: string;
  submissionId?: string;
  forwardedToDrive?: boolean;
  error?: string;
}
