// Remove the "E27" bulb-base label from customer-facing text while keeping sentences readable.
// Only uppercase "E27" is touched, so slugs, image paths and identifiers (e.g. e27-wall-lamp) stay intact.
const RULES = [
  [/E27\s*\/\s*E14 Base/g, 'Standard Screw Base'],
  [/E27\s*\/\s*E14\s+/g, ''],
  [/(\d+) x E27 \/ G9 Compatible/g, '$1 Lights'],
  [/LED & E27/g, 'LED & Classic'],
  [/LED and E27/g, 'LED and classic'],
  [/LED \+ E27/g, 'LED + Bulb Holder'],
  [/E27 × (\d+)/g, '$1 Bulb Holder'],
  [/\ban E27 /g, 'a '],
  [/E27 Socket/g, 'Bulb Socket'],
  [/E27 base\b/g, 'screw base'],
  [/\s*\bE27\b(?![_\w])/g, ''],
];

export const stripE27 = (text) => {
  if (typeof text !== 'string' || !text.includes('E27')) return text;
  let out = text;
  for (const [pattern, replacement] of RULES) out = out.replace(pattern, replacement);
  // Tidy up: leading spaces left at the start, doubled spaces, capitalise a now-leading word
  return out.replace(/ {2,}/g, ' ').replace(/^\s+/, '').replace(/^[a-z]/, (c) => c.toUpperCase());
};
