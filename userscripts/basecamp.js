// ==UserScript==
// @name Dial R for Reply (Basecamp)
// @namespace https://github.com/nashbridges/dial-r-for-reply
// @match https://*.basecamp.com/*
// @version v.1.3
// @description A script that allows Github-like quoting on Basecamp
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
  //#region src/entrypoints/basecamp.content/clean-selection.ts
  var EMPTY_BLOCK_RE_TEMPLATE = `(<p dir="auto">(<br>)?</p>)|<br>`;
  var EDGE_EMPTY_BLOCKS_RE = new RegExp(
    `(^(${EMPTY_BLOCK_RE_TEMPLATE})*)|((${EMPTY_BLOCK_RE_TEMPLATE})*$)`,
    'g',
  );
  var getCleanSelection = htmlString => {
    return htmlString.replaceAll(EDGE_EMPTY_BLOCKS_RE, '');
  };
  //#endregion
  //#region src/utils/xpath.ts
  var queryXpathSelector = selector => {
    return document.evaluate(selector, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
      .singleNodeValue;
  };
  //#endregion
  //#region src/entrypoints/basecamp.content/editor-banner.ts
  var ensureNoAddCommentBanner = () => {
    const banner = queryXpathSelector('//button[contains(normalize-space(.), "Add your comment")]');
    if (banner) banner.click();
  };
  //#endregion
  //#region src/entrypoints/basecamp.content/lexxy-editor.ts
  var LexxyEditor = class LexxyEditor {
    lexxy;
    constructor(lexxy) {
      this.lexxy = lexxy;
    }
    static isNodeEmpty(node) {
      if (!node.getChildren) return false;
      const children = node.getChildren();
      return children.length === 0 || children.every(child => this.isNodeEmpty(child));
    }
    pasteQuotedHtml(htmlString) {
      this.#insertQuote();
      this.#pasteHtml(htmlString);
      return this.#insertParagraph();
    }
    #updateDiscrete(fn) {
      this.lexxy.update(fn, { discrete: true });
    }
    #dispatchCommand(type, data) {
      let actualCommand;
      for (const command of this.lexxy._commands.keys())
        if (command.type === type) {
          actualCommand = command;
          break;
        }
      if (!actualCommand) {
        console.error(`Command "'${type}'" was not found.`);
        return;
      }
      this.#updateDiscrete(() => {
        this.lexxy.dispatchCommand(actualCommand, data);
      });
    }
    #pasteHtml(htmlString) {
      const clipboardData = new DataTransfer();
      clipboardData.setData('text/html', htmlString);
      const clipboardEventStub = {
        clipboardData,
        preventDefault: () => {},
      };
      this.#dispatchCommand('PASTE_COMMAND', clipboardEventStub);
    }
    getEditorState() {
      return this.lexxy.getEditorState();
    }
    #getCurrentTopLevelNode() {
      const { _selection: selection } = this.getEditorState();
      if (!selection?.anchor) {
        console.error('Could not get a range selection.');
        return;
      }
      return selection.anchor.getNode()?.getTopLevelElement();
    }
    #getNodeClass(className) {
      const nodeDefinition = this.lexxy._nodes.get(className);
      if (!nodeDefinition) {
        console.error(`Node definition "${className}" was not found.`);
        return;
      }
      return nodeDefinition.klass;
    }
    #insertQuote() {
      let quoteNode;
      const QuoteNode = this.#getNodeClass('quote');
      if (!QuoteNode) return;
      this.#updateDiscrete(() => {
        const currentTopLevelNode = this.#getCurrentTopLevelNode();
        if (!currentTopLevelNode) return;
        quoteNode = new QuoteNode();
        if (
          LexxyEditor.isNodeEmpty(currentTopLevelNode) &&
          !currentTopLevelNode.getPreviousSibling() &&
          !currentTopLevelNode.getNextSibling()
        )
          currentTopLevelNode.replace(quoteNode);
        else currentTopLevelNode.insertAfter(quoteNode);
        quoteNode.select();
      });
      return quoteNode;
    }
    #insertParagraph() {
      let paragraphNode;
      const ParagraphNode = this.#getNodeClass('paragraph');
      if (!ParagraphNode) return;
      this.#updateDiscrete(() => {
        const currentTopLevelNode = this.#getCurrentTopLevelNode();
        if (!currentTopLevelNode) return;
        paragraphNode = new ParagraphNode();
        currentTopLevelNode.insertAfter(paragraphNode);
        paragraphNode.select();
      });
      return paragraphNode;
    }
    select(node) {
      this.#updateDiscrete(() => {
        node.select();
      });
    }
  };
  //#endregion
  //#region src/entrypoints/basecamp.content/main.ts
  var main = () => {
    let editor;
    document.addEventListener('lexxy:initialize', event => {
      const lexxy = event.target.editor;
      if (lexxy) editor = new LexxyEditor(lexxy);
    });
    document.addEventListener('keydown', event => {
      const selection = document.getSelection();
      if (!(editor && isQuoteEvent(event) && isSelectionNotEmpty(selection))) return;
      event.preventDefault();
      ensureNoAddCommentBanner();
      const rangesAsHtml = getSelectionRangesAsHtml(selection);
      let firstCaretPositionNode;
      rangesAsHtml.forEach(rangeAsHtml => {
        const cleanHtml = getCleanSelection(rangeAsHtml);
        const caretPositionNode = editor.pasteQuotedHtml(cleanHtml);
        firstCaretPositionNode ??= caretPositionNode;
      });
      if (firstCaretPositionNode) editor.select(firstCaretPositionNode);
    });
  };
  //#endregion
  //#region src/entrypoints/basecamp.content/index.ts
  var basecamp_content_default = defineContentScript({
    matches: ['https://*.basecamp.com/*'],
    world: 'MAIN',
    main,
  });
  //#endregion
  //#region \0virtual:wxt-content-script-main-world-entrypoint?/Users/nash/projects/dial-r-for-reply/src/entrypoints/basecamp.content/index.ts
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
      return await basecamp_content_default.main();
    } catch (err) {
      logger.error(`The content script "basecamp" crashed on startup!`, err);
      throw err;
    }
  })();
})();
