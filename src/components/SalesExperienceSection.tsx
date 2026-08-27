import React from 'react';
import { Briefcase, Building2, Plus, Trash2 } from 'lucide-react';
import { FormDataState, NetworkCenter } from '../types';

interface SalesExperienceSectionProps {
  data: FormDataState;
  onChange: (fields: Partial<FormDataState>) => void;
}

export const SalesExperienceSection: React.FC<SalesExperienceSectionProps> = ({ data, onChange }) => {
  const centers = data.networkCenters || [];

  const handleCenterChange = (index: number, key: keyof NetworkCenter, value: string) => {
    const updated = [...centers];
    if (!updated[index]) {
      updated[index] = { id: String(Date.now() + index), name: '', address: '' };
    }
    updated[index] = { ...updated[index], [key]: value };
    onChange({ networkCenters: updated });
  };

  const addCenter = () => {
    if (centers.length < 5) {
      onChange({
        networkCenters: [
          ...centers,
          { id: String(Date.now()), name: '', address: '' },
        ],
      });
    }
  };

  const removeCenter = (index: number) => {
    const updated = centers.filter((_, i) => i !== index);
    onChange({ networkCenters: updated });
  };

  return (
    <section className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-5 sm:p-6 mb-5">
      <div className="pb-3 mb-4 border-b border-gray-100">
        <h3 className="text-base font-bold text-gray-900">
          بررسی سوابق کاری
        </h3>
      </div>

      <div className="space-y-4">
        {/* Sales Experience (Years) */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-[#802882]" />
            <span>میزان سابقه کار (به سال)</span>
          </label>
          <input
            type="number"
            min="0"
            max="40"
            step="0.5"
            placeholder="مثلاً: 2 یا 3"
            value={data.salesExperienceYears}
            onChange={(e) => onChange({ salesExperienceYears: e.target.value })}
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:border-[#802882] focus:ring-2 focus:ring-[#802882]/20 outline-none transition-all"
          />
        </div>

        {/* Previous Company Name */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-[#802882]" />
            <span>نام شرکت قبلی را ذکر کنید</span>
          </label>
          <input
            type="text"
            placeholder="نام شرکت، نهاد یا فروشگاه قبلی"
            value={data.previousCompanyName}
            onChange={(e) => onChange({ previousCompanyName: e.target.value })}
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:border-[#802882] focus:ring-2 focus:ring-[#802882]/20 outline-none transition-all"
          />
        </div>

        {/* Network Centers */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#802882]" />
              <span>مراکز، دواخانه‌ها یا کلینیک‌های مرتبط:</span>
            </label>
            {centers.length < 5 && (
              <button
                type="button"
                onClick={addCenter}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-purple-50 text-[#802882] border border-[#802882]/20 hover:bg-[#802882] hover:text-white transition-all"
              >
                <Plus className="w-3 h-3" />
                <span>افزودن مرکز</span>
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {centers.map((center, index) => (
              <div
                key={center.id || index}
                className="bg-gray-50/70 p-3 rounded-xl border border-gray-200 flex flex-col sm:flex-row items-center gap-2"
              >
                <div className="w-full sm:w-1/2">
                  <input
                    type="text"
                    placeholder={`نام مرکز / دواخانه ${index + 1}`}
                    value={center.name}
                    onChange={(e) => handleCenterChange(index, 'name', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-white focus:border-[#802882] outline-none"
                  />
                </div>
                <div className="w-full sm:w-1/2 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="آدرس یا موقعیت"
                    value={center.address}
                    onChange={(e) => handleCenterChange(index, 'address', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-white focus:border-[#802882] outline-none"
                  />
                  {centers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCenter(index)}
                      className="text-gray-400 hover:text-red-500 p-1 flex-shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
