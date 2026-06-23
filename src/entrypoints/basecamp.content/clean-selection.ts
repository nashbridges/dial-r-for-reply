const EMPTY_BLOCK_RE_TEMPLATE = `(<p dir="auto">(<br>)?</p>)|<br>`;
const EDGE_EMPTY_BLOCKS_RE = new RegExp(
  `(^(${EMPTY_BLOCK_RE_TEMPLATE})*)|((${EMPTY_BLOCK_RE_TEMPLATE})*$)`,
  'g',
);

// When selecting an inner paragraph, it's easy to include the surrounding
// line breaks into the selection -- remove them.
export const getCleanSelection = (htmlString: string) => {
  return htmlString.replaceAll(EDGE_EMPTY_BLOCKS_RE, '');
};
