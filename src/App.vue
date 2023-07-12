<template>
  <v-app class="grey lighten-4">
    <AppHeader />
    <router-view />
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