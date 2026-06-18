import { QuillEditor } from './quill-editor';

// There can be two editors on the same page (the main one and the one from an
// opened thread), so we get the editor closest to the selection.
export const getCurrentEditor = (selection: Selection) => {
  let currentElement = selection.anchorNode;
  let parent = currentElement?.parentElement;

  while (parent) {
    const editorContainer = parent.querySelector('.ql-container');
    if (editorContainer) {
      // NB: `"world": "MAIN"` is required in manifest.json to get access to the `__quill` expando.
      // @ts-expect-error
      const quill = editorContainer.__quill;
      if (quill) {
        return new QuillEditor(quill);
      } else {
        return undefined;
      }
    }

    currentElement = parent;
    parent = currentElement.parentElement;
  }
};
