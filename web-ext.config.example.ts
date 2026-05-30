import { defineWebExtConfig } from 'wxt';

export default defineWebExtConfig({
  firefoxProfile: 'Open about:profiles, create a new profile, copy-paste Root Directory.',
  chromiumArgs: ['--user-data-dir=./.wxt/chrome-data', '--profile-directory=Default'],
  startUrls: [''],
});
