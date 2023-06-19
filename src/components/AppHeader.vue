<template>
  <nav>

    <v-snackbar v-model="snackbar" :timeout="4000" top color="success">
      <span>New project added!</span>
      <v-btn flat color="white" @click="snackbar = false">Close</v-btn>
    </v-snackbar>

    <v-app-bar flat app>
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
export default {
  data: () => ({
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
      console.log("isAuthenticated", hasCredential)
      return hasCredential
    },
    userData() {
      return this.credential
    }
  },
  mounted() {
    useOneTap({
      onSuccess: this.handleLoginSuccess,
      onError: this.handleLoginError,
    })
  },
  methods: {
    getEncodedCredential() {
      return localStorage.getItem("credential")
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
      return localStorage.setItem("credential", credential)
    },
    logout() {
      console.log("logout")
      gapi.auth.setToken(null)
      this.setCredential(null)
      gapi.auth.signOut()
      console.log("logged out")
    },
    handleLoginSuccess(response) {
      const { credential } = response;
      console.log("credential", credential);
      this.setCredential(credential)
    },
    handleLoginError() {
      console.error("Login failed");
    }
  }
};
</script>
