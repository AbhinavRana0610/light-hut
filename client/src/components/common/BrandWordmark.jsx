import React from 'react';

/**
 * Official Light-Hut brand wordmark component.
 * Renders "Light-Hut" strictly using the Calibri (Body) font family,
 * matching the official company logo:
 * - "Light-" in parent text color / dark
 * - "H" in signature brand red (#DC2626)
 * - "ut" in parent text color / dark
 * - Optional registered trademark symbol (®)
 */
export const LightHut = ({
  className = '',
  withRegistered = false,
  redH = true,
  style = {}
}) => {
  return (
    <span
      className={`font-calibri font-bold tracking-tight inline-flex items-baseline ${className}`}
      style={{
        fontFamily: "'Calibri', 'Calibri (Body)', 'Carlito', sans-serif",
        ...style,
      }}
    >
      <span>Light-</span>
      {redH ? <span className="text-[#DC2626]">H</span> : <span>H</span>}
      <span>ut</span>
      {withRegistered && (
        <sup className="text-[0.6em] ml-0.5 font-bold leading-none">®</sup>
      )}
    </span>
  );
};

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
        <span className="text-[10px] tracking-wide font-bold mt-0.5 text-right font-calibri">
          <span className="text-neutral-900">Decorative </span>
          <span className="text-[#DC2626]">Solutions</span>
        </span>
      )}
    </span>
  );
};

export default LightHut;
