import type { Range, default as Quill } from 'quill';
export { Range };

export class QuillEditor {
  quill: Quill;

  constructor(quill: Quill) {
    this.quill = quill;
  }

  // Returns caret position right after the pasted content
  pasteQuotedHtml(htmlString: string): Range {
    let beforePasteLength = this.quill.getLength();
    if (beforePasteLength === 1) {
      // in case the textfield is empty, it contains a single newline -- skip it, so
      // there would be no empty line before the pasted content
      beforePasteLength = 0;
    }

    this.quill.clipboard.dangerouslyPasteHTML(beforePasteLength, htmlString);

    // quote just pasted content
    const afterPasteLength = this.quill.getLength();
    this.quill.formatText(beforePasteLength, afterPasteLength, { blockquote: true });

    // the caret will be placed on a newline, outside of the quote
    this.quill.insertText(this.quill.getLength(), '\n');

    // actually place the caret on the newline
    const finalLength = this.quill.getLength() - 1;
    const finalSelection: Range = { index: finalLength, length: 0 };
    this.quill.setSelection(finalSelection);
    return finalSelection;
  }

  select(selection: Range) {
    this.quill.setSelection(selection);
  }
}
