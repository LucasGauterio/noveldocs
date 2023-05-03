/**
 * plugins/index.js
 *
 * Automatically included in `./src/main.js`
 */

// Plugins
import { loadFonts } from './webfontloader'
import vuetify from './vuetify'
import router from '../router'
import GoogleSignInPlugin from "vue3-google-signin"

export function registerPlugins (app) {
  loadFonts()
  app
    .use(vuetify)
    .use(router)
    .use(GoogleSignInPlugin, {
      clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID
    })
}