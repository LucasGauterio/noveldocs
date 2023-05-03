<template>
  <v-app class="grey lighten-4">
    <AppHeader />
    <v-content class="mb-4">
      <router-view />
    </v-content>
  </v-app>
  
</template>

<script>
import AppHeader from "@/components/AppHeader";

export default {
  name: "App",
  components: {
    AppHeader
  },
  data: () => {
    return {
      //
    }
  }
};
</script>

<style></style>