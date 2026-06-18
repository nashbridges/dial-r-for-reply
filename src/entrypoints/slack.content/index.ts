import { defineContentScript } from 'wxt/utils/define-content-script';

import { main } from './main';

export default defineContentScript({
  matches: ['https://*.slack.com/*'],
  // Disable isolation in order to get access to expando properties on DOM nodes.
  // This is in order to hold the `__quill` reference.
  // See https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts#dom_access
  world: 'MAIN',
  main,
});
