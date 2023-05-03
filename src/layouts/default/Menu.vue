<script>

</script>
<template>
  <v-layout>
    <v-navigation-drawer image="https://picsum.photos/1920/1080?random" temporary theme="dark">
      <v-list nav>
        <v-list-item prepend-avatar="userData.picture" title="userData.name"
          subtitle="userData.email"></v-list-item>
        <v-divider></v-divider>
        <v-list-item prepend-icon="mdi-account-supervisor-circle" title="Projects" value="projects"></v-list-item>
        <v-list-item prepend-icon="mdi-clock-start" title="Clock-in" value="clockin"></v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-main style="height: 500px"></v-main>
  </v-layout>
</template>