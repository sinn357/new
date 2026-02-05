type LanguageCode = 'ko' | 'en';

const LANG_SECTION_REGEX = /<section\s+data-lang="(ko|en)"\s*>([\s\S]*?)<\/section>/g;

export function splitBilingualContent(html: string): {
  ko: string;
  en: string;
  isBilingual: boolean;
} {
  if (!html) {
    return { ko: '', en: '', isBilingual: false };
  }

  let ko = '';
  let en = '';
  let match: RegExpExecArray | null = null;
  let found = false;

  while ((match = LANG_SECTION_REGEX.exec(html)) !== null) {
    found = true;
    if (match[1] === 'ko') {
      ko = match[2].trim();
    } else if (match[1] === 'en') {
      en = match[2].trim();
    }
  }

  if (!found) {
    return { ko: html, en: '', isBilingual: false };
  }

  return { ko, en, isBilingual: true };
}

export function buildBilingualContent(ko: string, en: string): string {
  const koTrim = (ko ?? '').trim();
  const enTrim = (en ?? '').trim();

  if (koTrim && enTrim) {
    return `<section data-lang="ko">${koTrim}</section><section data-lang="en">${enTrim}</section>`;
  }

  if (koTrim) return koTrim;
  if (enTrim) return enTrim;

  return '';
}

export function getContentForLang(
  html: string,
  lang: LanguageCode,
  fallback: LanguageCode = 'ko'
): string {
  const { ko, en, isBilingual } = splitBilingualContent(html);
  if (!isBilingual) return html ?? '';

  const primary = lang === 'en' ? en : ko;
  if (primary?.trim()) return primary;

  const fallbackContent = fallback === 'en' ? en : ko;
  return fallbackContent ?? '';
}
