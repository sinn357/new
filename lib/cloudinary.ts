export function getCloudinaryImageUrl(url?: string): string | undefined {
  if (!url) return url;
  if (!url.startsWith('http')) return url;
  if (!url.includes('res.cloudinary.com')) return url;
  if (url.includes('/video/upload/')) return url;
  if (url.includes('/raw/upload/')) return url;
  const [prefix, suffix] = url.split('/upload/');
  if (!suffix) return url;
  if (suffix.startsWith('f_auto')) return url;
  return `${prefix}/upload/f_auto,q_auto/${suffix}`;
}
