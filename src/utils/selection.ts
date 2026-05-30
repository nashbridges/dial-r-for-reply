export const isSelectionNotEmpty = (selection: Selection | null): selection is Selection => {
  return Boolean(selection && selection.toString() !== '');
};

export const getSelectionRangesAsHtml = (selection: Selection) => {
  const ranges: string[] = [];

  for (let i = 0; i < selection.rangeCount; i++) {
    const range = selection.getRangeAt(i);
    const container = document.createElement('div');
    const fragment = range.cloneContents();
    container.appendChild(fragment);
    ranges.push(container.innerHTML);
  }

  return ranges;
};
