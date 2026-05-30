export const isQuoteEvent = (event: KeyboardEvent) => {
  // do not prevent typing 'r' in text fields
  if (document.activeElement?.tagName !== 'BODY') {
    return false;
  }

  return event.key === 'r' && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey;
};
