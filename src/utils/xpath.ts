export const queryXpathSelector = (selector: string) => {
  return document.evaluate(selector, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
    .singleNodeValue;
};
