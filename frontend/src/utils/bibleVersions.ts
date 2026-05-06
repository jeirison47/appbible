export const BIBLE_VERSIONS = [
  { code: 'RVR1960', label: 'RV1960', lang: 'Español' },
  { code: 'NVI',     label: 'NVI',    lang: 'Español' },
  { code: 'NTV',     label: 'NTV',    lang: 'Español' },
  { code: 'TLA',     label: 'TLA',    lang: 'Español' },
  { code: 'KJV',     label: 'KJV',    lang: 'English' },
  { code: 'NIV',     label: 'NIV',    lang: 'English' },
  { code: 'NLT',     label: 'NLT',    lang: 'English' },
  { code: 'ESV',     label: 'ESV',    lang: 'English' },
] as const;

export type BibleVersionCode = typeof BIBLE_VERSIONS[number]['code'];

/** Normaliza el alias legacy 'RV1960' al código canónico 'RVR1960'. */
export function normalizeVersion(version: string): string {
  return version === 'RV1960' ? 'RVR1960' : version;
}

export const DEFAULT_VERSION: BibleVersionCode = 'RVR1960';
