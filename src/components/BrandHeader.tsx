import React from 'react';

interface BrandHeaderProps {
  onOpenAdmin: () => void;
}

export const BrandHeader: React.FC<BrandHeaderProps> = ({ onOpenAdmin }) => {
  return (
    <header className="bg-white border-b border-purple-100 py-6 px-4 sm:px-6 text-center">
      <div className="max-w-3xl mx-auto flex flex-col items-center">
        {/* Brand Icon */}
        <div className="w-12 h-12 rounded-full bg-[#802882] text-white flex items-center justify-center font-bold text-xl mb-3 shadow-md shadow-[#802882]/20">
          VR
        </div>

        <h1 className="text-xl sm:text-2xl font-extrabold text-[#1E1B24]">
          فورم استخدام کارشناس فروش برند ویکتوریارز
        </h1>
      </div>
    </header>
  );
};
