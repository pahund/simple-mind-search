interface NoteContent {
  "#text"?: string;
  "@_textfmt"?: string;
  [key: string]: unknown;
}

interface TextNode {
  note?: string | NoteContent;
  [key: string]: unknown;
}

interface Children {
  text?: TextNode | TextNode[];
}

interface Link {
  "@_urllink"?: string;
  [key: string]: unknown;
}

export interface Topic {
  "@_text"?: string;
  "@_checkbox-mode"?: string;
  "@_checkbox"?: string;
  "@_progress"?: string;
  "@_date"?: string;
  topic?: Topic | Topic[];
  link?: Link | Link[];
  children?: Children;
  [key: string]: unknown;
}

export interface SearchResult {
  file: string;
  createdAt: Date;
  modifiedAt: Date;
  match: {
    text: string;
    notes?: string[];
    url?: string;
    done?: boolean;
    date?: Date;
  };
}
