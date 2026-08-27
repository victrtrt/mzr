import React from 'react';
import { User, Phone, GraduationCap } from 'lucide-react';
import { FormDataState } from '../types';

interface PersonalInfoSectionProps {
  data: FormDataState;
  onChange: (fields: Partial<FormDataState>) => void;
}

export const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({ data, onChange }) => {
  return (
    <section className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-5 sm:p-6 mb-5">
      <div className="pb-3 mb-4 border-b border-gray-100">
        <h3 className="text-base font-bold text-gray-900">
          معلومات فردی
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[#802882]" />
            <span>نام و تخلص</span>
            <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="نام و تخلص خود را وارد نمایید"
            value={data.fullName}
            onChange={(e) => onChange({ fullName: e.target.value })}
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:border-[#802882] focus:ring-2 focus:ring-[#802882]/20 outline-none transition-all"
            required
          />
        </div>

        {/* WhatsApp Phone */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            <span>شماره تماس و واتساپ فعال</span>
            <span className="text-rose-500">*</span>
          </label>
          <input
            type="tel"
            dir="ltr"
            placeholder="07xxxxxxxx"
            value={data.phoneWhatsapp}
            onChange={(e) => onChange({ phoneWhatsapp: e.target.value })}
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:border-[#802882] focus:ring-2 focus:ring-[#802882]/20 outline-none transition-all text-left placeholder:text-right"
            required
          />
        </div>

        {/* Education */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-[#802882]" />
            <span>میزان تحصیلات</span>
          </label>
          <input
            type="text"
            placeholder="میزان تحصیلات و رشته تحصیلی"
            value={data.education}
            onChange={(e) => onChange({ education: e.target.value })}
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:border-[#802882] focus:ring-2 focus:ring-[#802882]/20 outline-none transition-all"
          />
        </div>
      </div>
    </section>
  );
};
