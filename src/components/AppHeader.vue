<template>
  <nav>

    <v-snackbar v-model="snackbar" :timeout="4000" top color="success">
      <span>New project added!</span>
      <v-btn flat color="white" @click="snackbar = false">Close</v-btn>
    </v-snackbar>

    <v-app-bar app>
      <!--
        <v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      -->
      <v-app-bar-title>
        <v-img :src="logo" title="NOVELDOCS" height="60px"></v-img>
      </v-app-bar-title>

      <v-list>
        <v-list-item v-if="isAuthenticated" @click.stop="logout"
            :title="userData.name"
            :subtitle="userData.email"
          >
        <template v-slot:prepend>
          <v-icon icon="mdi-power"></v-icon>
        </template>
        <v-tooltip
                      activator="parent"
                      location="start"
                    >Logout</v-tooltip>
        </v-list-item>
      <v-list-item v-if="!isAuthenticated">
        <GoogleSignInButton v-if="!isAuthenticated" @success="handleLoginSuccess" @error="handleLoginError">
        </GoogleSignInButton>
      </v-list-item>
      </v-list>
    </v-app-bar>
    <!--
      <v-navigation-drawer v-model="drawer" temporary class="primary" v-if="isAuthenticated">
        <v-list>
          <v-list-item
              :prepend-avatar="userData.picture"
              :title="userData.name"
              :subtitle="userData.email"
            ></v-list-item>
        </v-list>
        <v-divider></v-divider>
        <v-list>
          <v-list-tile v-for="link in links" :key="link.text">
            <router-link :to="link.route">
              <v-list-tile-action>
                <v-icon class="white--text">{{ link.icon }}</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title class="white--text">{{ link.text }}</v-list-tile-title>
              </v-list-tile-content>
            </router-link>
          </v-list-tile>
        </v-list>

      </v-navigation-drawer>
      -->
  </nav>
</template>
<style></style>
<script>
import { GoogleSignInButton, useOneTap, decodeCredential } from "vue3-google-signin"
import logo from '../assets/noveldocs-logo.svg'
import VueCookies from 'vue-cookies'
    
export default {
  data: () => ({
    CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    API_KEY: import.meta.env.VITE_API_KEY,
    DISCOVERY_DOC: import.meta.env.VITE_DISCOVERY_DOC,
    SCOPES: import.meta.env.VITE_SCOPES,
    drawer: false,
    logo: logo,
    links: [
      { icon: 'mdi-book', text: 'Projects', route: '/projects' },
    ],
    snackbar: false,
    credential: null,
  }),
  computed: {
    isAuthenticated() {
      this.credential = this.getDecodedCredential()
      let hasCredential = this.credential !== null && this.credential !== undefined && this.credential.email !== undefined
      return hasCredential
    },
    userData() {
      return this.credential
    }
  },
  mounted() {
    this.loadScripts();
    useOneTap({
      onSuccess: this.handleLoginSuccess,
      onError: this.handleLoginError,
    })
  },
  methods: {
    getEncodedCredential() {
      return VueCookies.get('credential') || ""
    },
    getDecodedCredential() {
      try {
        return decodeCredential(this.getEncodedCredential())
      } catch (error) {
        console.error(error)
        return null
      }
    },
    setCredential(credential) {
      this.credential = credential
      return VueCookies.set('credential' , credential, "59m")
    },
    logout() {
      console.log("logout")
      gapi.auth.setToken(null)
      this.setCredential(null)
      gapi.auth.signOut()
      console.log("logged out")
    },
    handleLoginSuccess(response) {
      const { credential } = response
      console.log("credential", credential)
      this.setCredential(credential)
      this.$router.push('/projects')
    },
    handleLoginError() {
      console.error("Login failed")
    },
    gapiLoaded() {
        gapi.load("client", async () => {
            await gapi.client.init({
                apiKey: this.API_KEY,
                discoveryDocs: [this.DISCOVERY_DOC],
            });
            this.bGapiLoaded = true;
            //this.askPermission();
        });
    },
    gisLoaded() {
        this.tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: this.CLIENT_ID,
            scope: this.SCOPES,
            callback: this.authCallback, // defined later
        });
        this.bGisLoaded = true;
        //this.askPermission();
    },    
    loadScripts() {
      var scripts = [
          {
              src: "https://apis.google.com/js/api.js",
              onload: this.gapiLoaded
          },
          {
              src: "https://accounts.google.com/gsi/client",
              onload: this.gisLoaded
          }
      ];
      scripts.forEach(script => {
          let tag = document.createElement("script");
          tag.setAttribute("src", script.src);
          tag.onload = script.onload;
          tag.async = true;
          tag.defer = true;
          document.head.appendChild(tag);
      });
  },
  }
};
</script>
