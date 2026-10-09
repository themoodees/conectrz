export interface LegalSection {
  heading: string;
  /** Paragraphs. Text in [square brackets] is a placeholder to replace. */
  body: string[];
}

export interface LegalDocument {
  title: string;
  /** e.g. "2026-10-09" — update when the text changes. */
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
}
