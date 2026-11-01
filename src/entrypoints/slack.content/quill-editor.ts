import type { Range, default as Quill } from 'quill';
export { Range };

// An essential wrapper around https://github.com/slab/quill
export class QuillEditor {
  quill: Quill;

  constructor(quill: Quill) {
    this.quill = quill;
  }

  // Returns caret position right after the pasted content
  pasteQuotedHtml(htmlString: string): Range {
    let beforePasteLength = this.quill.getLength();
    if (beforePasteLength === 1) {
      // When response textfield is empty, Quill still populates its state with
      // a single newline. Skip it, so there would be no empty line before the
      // pasted content
      beforePasteLength = 0;
    }

    this.quill.clipboard.dangerouslyPasteHTML(beforePasteLength, htmlString);

    // Wrap the content we just have pasted into quote
    const afterPasteLength = this.quill.getLength();
    this.quill.formatText(beforePasteLength, afterPasteLength, { blockquote: true });

    // The caret will be placed on a newline, outside of the quote
    this.quill.insertText(this.quill.getLength(), '\n');

    // Actually place the caret on the newline
    const finalLength = this.quill.getLength() - 1;
    const finalSelection: Range = { index: finalLength, length: 0 };
    this.quill.setSelection(finalSelection);
    return finalSelection;
  }

  select(selection: Range) {
    this.quill.setSelection(selection);
    // Quill automatically scrolls to the text area by calling `scrollSelectionIntoView`
    // within the `setSelection`. For some reason that stopped working.
    this.quill.container.scrollIntoView();
  }
}
