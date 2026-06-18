export const isQuoteEvent = (event: KeyboardEvent) => {
  const target = event.target as HTMLElement;

  if (!target) {
    return false;
  }

  // do not prevent typing 'r' in text fields
  if (
    !(
      target.tagName === 'BODY' ||
      (target.tagName === 'DIV' && !target.hasAttribute('contenteditable'))
    )
  ) {
    return false;
  }

  return event.key === 'r' && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey;
};
