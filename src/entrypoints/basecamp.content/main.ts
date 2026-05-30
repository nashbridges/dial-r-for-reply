import type { ElementNode } from 'lexical';

import { isQuoteEvent } from '~/utils/is-quote-event';
import { getSelectionRangesAsHtml, isSelectionNotEmpty } from '~/utils/selection';

import { ensureNoAddCommentBanner } from './editor-banner';
import { LexxyEditor } from './lexxy-editor';

export const main = () => {
  let editor: LexxyEditor;

  // Editor instance is attached to a <lexxy-editor /> DOM element. Saving it for later.
  // NB: `"world": "MAIN"` is required in manifest.json to make this work.
  document.addEventListener('lexxy:initialize', event => {
    // @ts-expect-error
    const lexxy = event.target.editor;
    if (lexxy) {
      editor = new LexxyEditor(lexxy);
    }
  });

  document.addEventListener('keydown', event => {
    const selection = document.getSelection();

    if (!(editor && isQuoteEvent(event) && isSelectionNotEmpty(selection))) {
      return;
    }

    event.preventDefault();
    ensureNoAddCommentBanner();

    const rangesAsHtml = getSelectionRangesAsHtml(selection);
    let firstInsertedParagraphNode: ElementNode | undefined;

    rangesAsHtml.forEach((rangeAsHtml, idx) => {
      editor.insertQuote({ replaceEmpty: idx === 0 });
      editor.pasteHtml(rangeAsHtml);
      const insertedParagraphNode = editor.insertParagraph();
      firstInsertedParagraphNode ??= insertedParagraphNode;
    });

    if (firstInsertedParagraphNode) {
      editor.selectNode(firstInsertedParagraphNode);
    }
  });
};
