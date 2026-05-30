import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/auto-icons'],
  manifest: {
    version: '1.0',
    name: 'Dial R for Reply',
    description: "Select text and press 'r' to insert a quote.",
    homepage_url: 'https://github.com/nashbridges/dial-r-for-reply',
    browser_specific_settings: {
      gecko: {
        id: 'dial-r-for-reply@nashbridges.me',
        data_collection_permissions: {
          required: ['none'],
        },
      },
    },
  },
  vite: () => ({
    build: {
      minify: false,
    },
  }),
  srcDir: 'src',
  imports: false,
});
