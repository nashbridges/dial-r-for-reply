// ==UserScript==
// @name Dial R for Reply (Slack)
// @namespace https://github.com/nashbridges/dial-r-for-reply
// @match https://*.slack.com/*
// @version v.1.3
// @description A script that allows Github-like quoting on Slack
// @inject-into page
// @homepageURL https://github.com/nashbridges/dial-r-for-reply
// ==/UserScript==
(function () {
  //#region node_modules/.pnpm/wxt@0.20.26_@types+node@25.9.1_jiti@2.7.0_rolldown@1.0.3/node_modules/wxt/dist/utils/define-content-script.mjs
  function defineContentScript(definition) {
    return definition;
  }
  //#endregion
  //#region src/utils/is-quote-event.ts
  var isQuoteEvent = event => {
    const target = event.target;
    if (!target) return false;
    if (
      !(
        target.tagName === 'BODY' ||
        (target.tagName === 'DIV' && !target.hasAttribute('contenteditable'))
      )
    )
      return false;
    return (
      event.key === 'r' && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey
    );
  };
  //#endregion
  //#region src/utils/selection.ts
  var isSelectionNotEmpty = selection => {
    return Boolean(selection && selection.toString() !== '');
  };
  var getSelectionRangesAsHtml = selection => {
    const ranges = [];
    for (let i = 0; i < selection.rangeCount; i++) {
      const range = selection.getRangeAt(i);
      const container = document.createElement('div');
      const fragment = range.cloneContents();
      container.appendChild(fragment);
      ranges.push(container.innerHTML);
    }
    return ranges;
  };
  //#endregion
  //#region src/entrypoints/slack.content/clean-selection.ts
  var EDITED_LABEL_RE = /<span class="c-message__edited_label"[^>]*>[^<]+<\/span>$/;
  var getCleanSelection = htmlString => {
    return htmlString.replace(EDITED_LABEL_RE, '');
  };
  //#endregion
  //#region src/entrypoints/slack.content/quill-editor.ts
  var QuillEditor = class {
    quill;
    constructor(quill) {
      this.quill = quill;
    }
    pasteQuotedHtml(htmlString) {
      let beforePasteLength = this.quill.getLength();
      if (beforePasteLength === 1) beforePasteLength = 0;
      this.quill.clipboard.dangerouslyPasteHTML(beforePasteLength, htmlString);
      const afterPasteLength = this.quill.getLength();
      this.quill.formatText(beforePasteLength, afterPasteLength, { blockquote: true });
      this.quill.insertText(this.quill.getLength(), '\n');
      const finalSelection = {
        index: this.quill.getLength() - 1,
        length: 0,
      };
      this.quill.setSelection(finalSelection);
      return finalSelection;
    }
    select(selection) {
      this.quill.setSelection(selection);
      this.quill.container.scrollIntoView();
    }
  };
  //#endregion
  //#region src/entrypoints/slack.content/current-editor.ts
  var getCurrentEditor = selection => {
    let currentElement = selection.anchorNode;
    let parent = currentElement?.parentElement;
    while (parent) {
      const editorContainer = parent.querySelector('.ql-container');
      if (editorContainer) {
        const quill = editorContainer.__quill;
        if (quill) return new QuillEditor(quill);
        else return;
      }
      currentElement = parent;
      parent = currentElement.parentElement;
    }
  };
  //#endregion
  //#region src/entrypoints/slack.content/main.ts
  var main = () => {
    document.addEventListener(
      'keydown',
      event => {
        const selection = document.getSelection();
        if (!(isQuoteEvent(event) && isSelectionNotEmpty(selection))) return;
        const currentEditor = getCurrentEditor(selection);
        if (!currentEditor) return;
        event.preventDefault();
        const rangesAsHtml = getSelectionRangesAsHtml(selection);
        let firstInsertedCaretPosition;
        rangesAsHtml.forEach(rangeAsHtml => {
          const cleanHtml = getCleanSelection(rangeAsHtml);
          const insertedCaretPosition = currentEditor.pasteQuotedHtml(cleanHtml);
          firstInsertedCaretPosition ??= insertedCaretPosition;
        });
        if (firstInsertedCaretPosition) currentEditor.select(firstInsertedCaretPosition);
      },
      { capture: true },
    );
  };
  //#endregion
  //#region src/entrypoints/slack.content/index.ts
  var slack_content_default = defineContentScript({
    matches: ['https://*.slack.com/*'],
    world: 'MAIN',
    main,
  });
  //#endregion
  //#region \0virtual:wxt-content-script-main-world-entrypoint?/Users/nash/projects/dial-r-for-reply/src/entrypoints/slack.content/index.ts
  /** Wrapper around `console` with a "[wxt]" prefix */
  var logger = {
    debug: (...args) => ([...args], void 0),
    log: (...args) => ([...args], void 0),
    warn: (...args) => ([...args], void 0),
    error: (...args) => ([...args], void 0),
  };
  //#endregion
  return (async () => {
    try {
      return await slack_content_default.main();
    } catch (err) {
      logger.error(`The content script "slack" crashed on startup!`, err);
      throw err;
    }
  })();
})();
