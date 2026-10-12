/**
 * Contents of the reference sheet shown in strict-conditions mode.
 *
 * UNVERIFIED: the official Codebusters reference sheet for this season has not
 * been sourced yet. Do not add content from memory or from study guides here;
 * replace the placeholder with the official sheet's contents verbatim, then set
 * `status` to 'verified' and fill in `source`.
 */

export type ReferenceBlock =
  | { kind: 'text'; text: string }
  | { kind: 'table'; header: string[]; rows: string[][] };

export interface ReferenceSection {
  id: string;
  title: string;
  blocks: ReferenceBlock[];
}

export interface ReferenceSheet {
  status: 'UNVERIFIED' | 'verified';
  source: string | null;
  sections: ReferenceSection[];
}

export const REFERENCE_SHEET: ReferenceSheet = {
  status: 'UNVERIFIED',
  source: null,
  sections: [
    {
      id: 'placeholder',
      title: 'UNVERIFIED: official reference sheet not yet added',
      blocks: [
        {
          kind: 'text',
          text: 'UNVERIFIED placeholder. The official reference sheet will appear here once its contents are confirmed.',
        },
      ],
    },
  ],
};
