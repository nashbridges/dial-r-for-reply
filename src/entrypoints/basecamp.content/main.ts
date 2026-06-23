import { isQuoteEvent } from '~/utils/is-quote-event';
import { getSelectionRangesAsHtml, isSelectionNotEmpty } from '~/utils/selection';

import { getCleanSelection } from './clean-selection';
import { ensureNoAddCommentBanner } from './editor-banner';
import { LexxyEditor, type ElementNode } from './lexxy-editor';

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
    let firstCaretPositionNode: ElementNode | undefined;

    rangesAsHtml.forEach(rangeAsHtml => {
      const cleanHtml = getCleanSelection(rangeAsHtml);
      const caretPositionNode = editor.pasteQuotedHtml(cleanHtml);
      firstCaretPositionNode ??= caretPositionNode;
    });

    if (firstCaretPositionNode) {
      editor.select(firstCaretPositionNode);
    }
  });
};
