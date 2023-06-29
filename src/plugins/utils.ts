export function truncateText(
  str,
  n = 13,
  frontChars = 6,
  backChars = 4,
  separator = '...'
) {
  if (!str || typeof str !== 'string') {
    return;
  }
  if (str.length === frontChars && backChars === 0) {
    return str;
  }
  const sep = separator || '...';
  const sepLen = sep.length;
  if (str.length < n - sepLen) {
    return str;
  }
  return str.substr(0, frontChars) + sep + str.substr(str.length - backChars);
}
