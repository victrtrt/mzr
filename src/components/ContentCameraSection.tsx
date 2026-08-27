import React from 'react';
import { Share2, Users } from 'lucide-react';
import { FormDataState } from '../types';

interface ContentCameraSectionProps {
  data: FormDataState;
  onChange: (fields: Partial<FormDataState>) => void;
}

export const ContentCameraSection: React.FC<ContentCameraSectionProps> = ({ data, onChange }) => {
  return (
    <section className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-5 sm:p-6 mb-5">
      <div className="pb-3 mb-4 border-b border-gray-100">
        <h3 className="text-base font-bold text-gray-900">
          استعداد در شبکه‌های اجتماعی
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Social Profile Link */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5 text-[#802882]" />
            <span>لینک صفحه در شبکه‌های اجتماعی</span>
          </label>
          <input
            type="text"
            dir="ltr"
            placeholder="instagram.com/... یا facebook.com/..."
            value={data.socialProfileUrl}
            onChange={(e) => onChange({ socialProfileUrl: e.target.value })}
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:border-[#802882] focus:ring-2 focus:ring-[#802882]/20 outline-none transition-all text-left placeholder:text-right"
          />
        </div>

        {/* Total Followers */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#802882]" />
            <span>تعداد فالوور</span>
          </label>
          <input
            type="text"
            placeholder="مثلاً: 2500"
            value={data.totalFollowers}
            onChange={(e) => onChange({ totalFollowers: e.target.value })}
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:border-[#802882] focus:ring-2 focus:ring-[#802882]/20 outline-none transition-all"
          />
        </div>
      </div>
    </section>
  );
};
