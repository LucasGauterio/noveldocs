<template>

    <nav>

      <v-snackbar v-model="snackbar" :timeout="4000" top color="success">
        <span>New project added!</span>
        <v-btn flat color="white" @click="snackbar = false">Close</v-btn>
      </v-snackbar>

      <v-toolbar flat app>
        <v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>

        <router-link to="/">
          <v-toolbar-title class="text-uppercase">
            <span class="font-weight-light">Novel</span>
            <span>Docs</span>
          </v-toolbar-title>
        </router-link>
        <v-spacer></v-spacer>
        
        <GoogleSignInButton v-if="!isAuthenticated"
          @success="handleLoginSuccess"
          @error="handleLoginError"
        ></GoogleSignInButton>

      </v-toolbar>

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

    </nav>

</template>
<style>
 </style>
<script>
import { GoogleSignInButton, useOneTap, decodeCredential } from "vue3-google-signin"

export default {
  data: () => ({
      drawer: false,
      links: [
        { icon: 'mdi-email', text: 'Projects', route: '/projects'},
      ],  
      snackbar: false,
  }),

  computed: {
    isAuthenticated() {
      let credential = this.getDecodedCredential()
      let hasCredential = credential !== null && credential !== undefined && credential.email !== undefined
      console.log("isAuthenticated",hasCredential)
      return hasCredential
    },
    userData() {
      return this.getDecodedCredential()
    }
  },
  mounted(){
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
      return localStorage.setItem("credential", credential)
    },
    logout(response){
      console.log("logout")
      gapi.auth2.getAuthInstance().revokeAccess();
      this.isAuthenticated = false
      console.log("logged out")
    },
    handleLoginSuccess(response){
      const { credential } = response;
      console.log("credential", credential);
      this.setCredential(credential)
    },
    handleLoginError (){
      console.error("Login failed");
    }
  }
};
</script>
