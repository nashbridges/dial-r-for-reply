import type { LexicalEditor, LexicalNode, ElementNode, RangeSelection } from 'lexical';
export { ElementNode };

// An essential wrapper around https://github.com/basecamp/lexxy, which itself
// is based on https://github.com/facebook/lexical.
// This only uses types from lexical, but not the code. Two reasons for that:
//   1. we don't want to bundle the whole library along with the extension.
//   2. dispatch commands related `$xxx` functions can't be used anyway as they
//      would hold different references comparing to what lexxy sees.
export class LexxyEditor {
  lexxy: LexicalEditor;

  constructor(lexxy: LexicalEditor) {
    this.lexxy = lexxy;
  }

  static isNodeEmpty(node: LexicalNode): boolean {
    if (!(node as ElementNode).getChildren) {
      return false; // non-container node
    }
    const children = (node as ElementNode).getChildren();
    return children.length === 0 || children.every(child => this.isNodeEmpty(child));
  }

  pasteQuotedHtml(htmlString: string) {
    // first prepare a quote node, then paste the content -- this is how lexical works
    this.#insertQuote();
    this.#pasteHtml(htmlString);
    // insert a blank line outside the quote to place the caret
    const caretPositionNode = this.#insertParagraph();
    return caretPositionNode;
  }

  // Use `discrete: true`, so that the next steps get up-to-date state
  // immediately after the previous one has been executed.
  // https://github.com/facebook/lexical/blob/9a036d4c043/packages/lexical-website/docs/faq.md?plain=1#L40
  #updateDiscrete(fn: () => void) {
    this.lexxy.update(fn, { discrete: true });
  }

  #dispatchCommand(type: string, data: unknown) {
    let actualCommand;

    // Resorting to an internal API as we don't have access to the scope of
    // lexical library where the commands are defined
    for (const command of this.lexxy._commands.keys()) {
      if (command.type === type) {
        actualCommand = command;
        break;
      }
    }

    if (!actualCommand) {
      console.error(`Command "'${type}'" was not found.`);
      return;
    }

    this.#updateDiscrete(() => {
      this.lexxy.dispatchCommand(actualCommand, data);
    });
  }

  #pasteHtml(htmlString: string) {
    const clipboardData = new DataTransfer();
    clipboardData.setData('text/html', htmlString);

    // Firefox does not allow to manually build ClipboardEvent instances, but
    // lexical is fine with duck typing
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

    if (!(selection as RangeSelection)?.anchor) {
      console.error('Could not get a range selection.');
      return;
    }

    const anchorNode = (selection as RangeSelection).anchor.getNode();
    return anchorNode?.getTopLevelElement();
  }

  #getNodeClass(className: string) {
    const nodeDefinition = this.lexxy._nodes.get(className);

    if (!nodeDefinition) {
      console.error(`Node definition "${className}" was not found.`);
      return;
    }

    return nodeDefinition.klass;
  }

  #insertQuote() {
    let quoteNode: ElementNode | undefined;

    const QuoteNode = this.#getNodeClass('quote');
    if (!QuoteNode) {
      return;
    }

    this.#updateDiscrete(() => {
      const currentTopLevelNode = this.#getCurrentTopLevelNode();
      if (!currentTopLevelNode) {
        return;
      }

      quoteNode = new QuoteNode() as ElementNode;

      const isCurrentNodeASingleEmptyLine =
        LexxyEditor.isNodeEmpty(currentTopLevelNode) &&
        !currentTopLevelNode.getPreviousSibling() &&
        !currentTopLevelNode.getNextSibling();

      if (isCurrentNodeASingleEmptyLine) {
        currentTopLevelNode.replace(quoteNode);
      } else {
        currentTopLevelNode.insertAfter(quoteNode);
      }

      quoteNode.select();
    });

    return quoteNode;
  }

  #insertParagraph() {
    let paragraphNode: ElementNode | undefined;

    const ParagraphNode = this.#getNodeClass('paragraph');
    if (!ParagraphNode) {
      return;
    }

    this.#updateDiscrete(() => {
      const currentTopLevelNode = this.#getCurrentTopLevelNode();
      if (!currentTopLevelNode) {
        return;
      }

      paragraphNode = new ParagraphNode() as ElementNode;
      currentTopLevelNode.insertAfter(paragraphNode);
      paragraphNode.select();
    });

    return paragraphNode;
  }

  select(node: ElementNode) {
    this.#updateDiscrete(() => {
      node.select();
    });
  }
}
