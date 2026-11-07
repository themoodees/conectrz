export interface LegalSection {
  heading: string;
  /** Paragraphs. Text in [square brackets] is a placeholder to replace. */
  body: string[];
}

export interface LegalDocument {
  /** Shown above a translated document (the English text is the reference). */
  translationNotice?: string;
  title: string;
  /** e.g. "2026-10-09" — update when the text changes. */
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
}
