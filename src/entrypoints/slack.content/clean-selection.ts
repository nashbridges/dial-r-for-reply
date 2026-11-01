const EDITED_LABEL_RE = /<span class="c-message__edited_label"[^>]*>[^<]+<\/span>$/;

// Slack includes the "edited" label into the message itself -- no need to quote it
export const getCleanSelection = (htmlString: string) => {
  return htmlString.replace(EDITED_LABEL_RE, '');
};
