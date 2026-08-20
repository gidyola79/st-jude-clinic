import React from 'react';
import logoImg from '../assets/images/st_jude_logo_1787250208365.jpg';

export const CLINIC_LOGO_SRC = logoImg;

interface ClinicLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  className?: string;
  imgClassName?: string;
  showText?: boolean;
  textClassName?: string;
  subtext?: string;
  badge?: string;
  id?: string;
}

export default function ClinicLogo({
  size = 'md',
  className = '',
  imgClassName = '',
  showText = false,
  textClassName = '',
  subtext,
  badge,
  id = 'st-jude-clinic-logo'
}: ClinicLogoProps) {
  // Size mappings
  const sizeMap: Record<string, { box: string; img: string; text: string; sub: string }> = {
    xs: { box: 'w-6 h-6', img: 'w-6 h-6', text: 'text-xs', sub: 'text-[9px]' },
    sm: { box: 'w-8 h-8', img: 'w-8 h-8', text: 'text-sm', sub: 'text-[10px]' },
    md: { box: 'w-10 h-10', img: 'w-10 h-10', text: 'text-base', sub: 'text-xs' },
    lg: { box: 'w-12 h-12', img: 'w-12 h-12', text: 'text-lg', sub: 'text-xs' },
    xl: { box: 'w-16 h-16', img: 'w-16 h-16', text: 'text-xl', sub: 'text-sm' },
  };

  const currentSize = typeof size === 'string' && sizeMap[size] ? sizeMap[size] : sizeMap.md;
  const customBoxStyle = typeof size === 'number' ? { width: `${size}px`, height: `${size}px` } : undefined;

  return (
    <div id={id} className={`inline-flex items-center gap-3 select-none ${className}`}>
      <div 
        style={customBoxStyle}
        className={`relative ${typeof size === 'string' ? currentSize.box : ''} rounded-2xl overflow-hidden bg-white shadow-md shadow-teal-600/10 border border-teal-500/20 ring-1 ring-teal-500/10 shrink-0 flex items-center justify-center p-0.5`}
      >
        <img
          src={CLINIC_LOGO_SRC}
          alt="St. Jude Clinic Clinical Emblem"
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover rounded-xl ${imgClassName}`}
        />
      </div>

      {showText && (
        <div className="flex flex-col truncate">
          <div className="flex items-center gap-2">
            <span className={`font-black tracking-tight text-slate-900 dark:text-white ${currentSize.text} ${textClassName}`}>
              St. Jude Clinic
            </span>
            {badge && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                {badge}
              </span>
            )}
          </div>
          {subtext && (
            <span className={`font-medium text-slate-500 dark:text-slate-400 ${currentSize.sub}`}>
              {subtext}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
