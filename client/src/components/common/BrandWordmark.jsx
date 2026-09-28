import React from 'react';

/**
 * Official Light-Hut brand wordmark styled with Calibri (Body) typography.
 * Supports customizable text sizes and optional subtitle.
 */
export const BrandWordmark = ({ className = '', size = 'text-xl', showSubtitle = false }) => {
  return (
    <span
      className={`inline-flex flex-col leading-none font-calibri ${className}`}
      style={{ fontFamily: "'Calibri', 'Calibri (Body)', 'Carlito', sans-serif" }}
    >
      <span className={`font-bold tracking-tight inline-flex items-baseline ${size}`}>
        <span className="text-neutral-900">Light-</span>
        <span className="text-[#DC2626]">H</span>
        <span className="text-neutral-900">ut</span>
        <sup className="text-[0.5em] ml-0.5 text-neutral-800 font-bold">®</sup>
      </span>
      {showSubtitle && (
        <span className="text-[10px] tracking-wide font-bold mt-0.5 text-right">
          <span className="text-neutral-900">Decorative </span>
          <span className="text-[#DC2626]">Solutions</span>
        </span>
      )}
    </span>
  );
};

export default BrandWordmark;
