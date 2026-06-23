const EDITED_LABEL_RE = /<span class="c-message__edited_label"[^>]*>[^<]+<\/span>$/;

export const getCleanSelection = (htmlString: string) => {
  return htmlString.replace(EDITED_LABEL_RE, '');
};
