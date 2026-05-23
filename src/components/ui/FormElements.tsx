import React from "react";
import { CheckCircle2 } from "lucide-react";

interface RadioCardProps {
  name: string;
  value: string;
  label: React.ReactNode;
  checked: boolean;
  highlight?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const RadioCard: React.FC<RadioCardProps> = ({ 
  name, value, label, checked, highlight, onChange 
}) => {
  return (
    <label className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
      checked 
        ? "border-[#F47920] bg-orange-50/50 shadow-md translate-x-1" 
        : highlight 
          ? "border-orange-200 bg-orange-50/30 shadow-sm" 
          : "border-slate-100 bg-white hover:border-orange-200 hover:bg-orange-50/20"
    }`}>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
        checked ? "border-[#F47920] bg-[#F47920]" : "border-slate-300"
      }`}>
        {checked && <div className="w-2 h-2 bg-white rounded-full"></div>}
      </div>
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="hidden" />
      <div className="w-full">{label}</div>
    </label>
  );
};

export const Section: React.FC<{ id?: string; title: string; icon: string; children: React.ReactNode; required?: boolean }> = ({ 
  id, title, icon, children, required 
}) => {
  return (
    <div id={id} className="scroll-mt-24 group">
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#1a2d8f]/5 rounded-xl flex items-center justify-center text-xl sm:text-2xl group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <div>
          <h3 className="font-black text-[#1a2d8f] text-sm sm:text-lg leading-none uppercase tracking-tight">
            {title}
            {required && <span className="text-red-500 ml-1">*</span>}
          </h3>
          <div className="h-1 w-8 bg-[#F47920] rounded-full mt-1.5 transition-all group-hover:w-12"></div>
        </div>
      </div>
      <div className="pl-0 sm:pl-1">{children}</div>
    </div>
  );
};

export const InputField: React.FC<{ label?: string; name: string; value: string; onChange: any; placeholder?: string; required?: boolean; type?: string; textarea?: boolean }> = ({ 
  label, name, value, onChange, placeholder, required, type = "text", textarea 
}) => {
  const baseClass = "w-full border-2 border-gray-100 rounded-lg sm:rounded-xl px-3 py-2 sm:px-4 sm:py-3 text-[13px] sm:text-sm text-gray-800 focus:outline-none focus:border-[#F47920] focus:ring-4 focus:ring-orange-100 transition-all placeholder-gray-400 bg-white shadow-sm";
  return (
    <div>
      {label && <label className="block text-[11px] sm:text-xs font-black text-black uppercase tracking-widest mb-1.5 ml-1">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>}
      {textarea ? (
        <textarea name={name} value={value} onChange={onChange} placeholder={placeholder} rows={3} required={required} className={baseClass} />
      ) : (
        <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} required={required} className={baseClass} />
      )}
    </div>
  );
};

export const SelectField: React.FC<{ label?: string; name: string; value: string; onChange: any; options: string[]; required?: boolean }> = ({ 
  label, name, value, onChange, options, required 
}) => {
  const baseClass = "w-full border-2 border-gray-100 rounded-lg sm:rounded-xl px-3 py-2 sm:px-4 sm:py-3 text-[13px] sm:text-sm text-gray-800 focus:outline-none focus:border-[#F47920] focus:ring-4 focus:ring-orange-100 transition-all bg-white shadow-sm appearance-none cursor-pointer";
  return (
    <div className="relative">
      {label && <label className="block text-[11px] sm:text-xs font-black text-black uppercase tracking-widest mb-1.5 ml-1">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>}
      <div className="relative">
        <select name={name} value={value} onChange={onChange} required={required} className={baseClass}>
          <option value="" disabled>Pilih {label}</option>
          {options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>
    </div>
  );
};

export const LogoMark = () => (
  <div className="relative w-14 h-14 flex-shrink-0">
    <svg viewBox="0 0 56 56" className="absolute inset-0 w-full h-full">
      <ellipse cx="28" cy="28" rx="24" ry="13" fill="none" stroke="#7b8fd4" strokeWidth="3.5" opacity="0.7" transform="rotate(-40 28 28)" />
      <polygon points="28,8 42,44 14,44" fill="#F47920" />
      <polygon points="28,8 34,24 22,24" fill="#e06010" opacity="0.7" />
      <polygon points="28,30 35,44 21,44" fill="#1a2d8f" />
    </svg>
  </div>
);
