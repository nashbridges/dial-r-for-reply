import { isQuoteEvent } from '~/utils/is-quote-event';
import { getSelectionRangesAsHtml, isSelectionNotEmpty } from '~/utils/selection';

import { getCleanSelection } from './clean-selection';
import { getCurrentEditor } from './current-editor';
import { Range } from './quill-editor';

export const main = () => {
  document.addEventListener(
    'keydown',
    event => {
      const selection = document.getSelection();

      if (!(isQuoteEvent(event) && isSelectionNotEmpty(selection))) {
        return;
      }

      const currentEditor = getCurrentEditor(selection);
      if (!currentEditor) {
        return;
      }

      event.preventDefault();
      const rangesAsHtml = getSelectionRangesAsHtml(selection);

      let firstInsertedCaretPosition: Range | undefined;

      rangesAsHtml.forEach(rangeAsHtml => {
        const cleanHtml = getCleanSelection(rangeAsHtml);
        const insertedCaretPosition = currentEditor.pasteQuotedHtml(cleanHtml);
        firstInsertedCaretPosition ??= insertedCaretPosition;
      });

      if (firstInsertedCaretPosition) {
        currentEditor.select(firstInsertedCaretPosition);
      }
    },
    // Slack focuses the editor on any keypress, as a result selection is mangled
    // when we finally get to handle the keypress. The workaround is to listen to
    // the event during the capturing phase.
    { capture: true },
  );
};
