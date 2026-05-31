export function normalizeStr(str) {
  if (!str) return '';
  return String(str).normalize('NFC').replace(/\s+/g, '').toLowerCase();
}

export function beautifyName(str) {
  if (!str) return '';
  return String(str).trim(); 
}

export function parseSafeDate(val) {
  if (!val) return new Date();
  let d;
  if (val instanceof Date) d = new Date(val);
  else {
    const str = String(val).trim();
    if (str.includes('/')) {
      const parts = str.split('/');
      if (parts.length === 3) d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    } else if (str.includes('-')) {
      const parts = str.split('T')[0].split('-');
      if (parts.length === 3) d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    } else d = new Date(str);
  }
  if (!d || isNaN(d.getTime())) return new Date();
  d.setHours(0, 0, 0, 0); 
  return d;
}

export function dateToInputValue(d) {
  if (!(d instanceof Date) || isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}