import { queryXpathSelector } from '~/utils/xpath';

export const ensureNoAddCommentBanner = () => {
  const banner = queryXpathSelector('//button[contains(normalize-space(.), "Add your comment")]');
  if (banner) {
    // remove the banner
    (banner as HTMLButtonElement).click();
  }
};
