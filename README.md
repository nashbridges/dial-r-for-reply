# Dial R for Reply

This is a browser extension that allows Github-like quoting. You select a text
on a discussion page, hit "r", and that inserts the selection as a quote in the
text area on the page.

In Firefox multiple quoting is supported. Select first chunk of text, hold
Cmd/Ctrl, then select the next one and so on. Finally press "r" -- each chunk
will be quoted separately.

So far only the following sites are supported:

- basecamp.com
- slack.com

## Installation

### As a standalone browser extension

- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/dial-r-for-reply/)
- [Chrome](https://chromewebstore.google.com/detail/lmdlejimkgcjijaphmafldghldplolgd/)

### As a userscript

- [basecamp.com](https://raw.githubusercontent.com/nashbridges/dial-r-for-reply/refs/heads/main/userscripts/basecamp.js)
- [slack.com](https://raw.githubusercontent.com/nashbridges/dial-r-for-reply/refs/heads/main/userscripts/slack.js)

Notice, both scripts require to be injected into the page context (_not_ the content context). That means they will not
work by default in Firefox on sites with CSP enabled (which, at the moment of writing this, slack.com does).
See [Firemonkey's CSP exlude](https://erosman.github.io/firemonkey/src/content/help.html#csp-exclude) as an example
workaround, or use the standalone extension. There should be no problems with scripts injecting in Chrome.

## Build from source

- pnpm install
- pnpm zip

Check the `.output` folder.

## Issues

Use [Github issues](https://github.com/nashbridges/dial-r-for-reply/issues) to file a ticket.

## Contributing

This project is open source and close contribution. I don't have mental
capacity to support sites I don't use myself, or to accept features I don't
need.

You are still allowed to reuse and/or modify the code as you wish.
