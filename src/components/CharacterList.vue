<template>
  <div>
    <v-toolbar color="white" dense floating>
      <v-text-field single-line hide-details v-model="search" placeholder="Search" variant="underlined"
        prepend-icon="mdi-magnify"></v-text-field>
    </v-toolbar>
    <v-toolbar color="white" dense floating>
      <v-btn color="green">
        <v-icon>mdi-plus</v-icon>
        Create character
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn-toggle v-model="viewMode" mandatory>
        <v-btn value="list" icon>
          <v-icon>mdi-format-list-bulleted</v-icon>
        </v-btn>
        <v-btn value="thumbnail" icon>
          <v-icon>mdi-view-grid</v-icon>
        </v-btn>
      </v-btn-toggle>
    </v-toolbar>

    <v-container>
      <v-row v-if="viewMode === 'list'">
        <v-col v-for="character in filteredCharacters" :key="character.id" cols="12" sm="12" md="12">
          <v-card class="mb-4">
            <template v-slot:prepend>
              <v-card-title>{{ character.name }}</v-card-title>
            </template>

            <template v-slot:append>
              <v-card-actions>
                  <v-btn icon color="green" class="flex-grow-1">
                    <v-icon>mdi-eye-outline</v-icon>
                    
                    <v-tooltip
                      activator="parent"
                      location="start"
                    >View</v-tooltip>
                  </v-btn>
                  <v-btn icon color="blue" class="flex-grow-1">
                    <v-icon>mdi-pencil</v-icon>
                    
                    <v-tooltip
                      activator="parent"
                      location="start"
                    >Edit</v-tooltip>
                  </v-btn>
                <v-btn icon color="red" class="flex-grow-1">
                  <v-icon>mdi-delete</v-icon>
                    
                    <v-tooltip
                      activator="parent"
                      location="start"
                    >Delete</v-tooltip>
                </v-btn>
              </v-card-actions>
            </template>
          </v-card>
        </v-col>
      </v-row>

      <v-row v-else-if="viewMode === 'thumbnail'">
        <v-col v-for="character in filteredCharacters" :key="character.id" cols="12" xs="12" sm="6" md="4" lg="4">
          <v-card outlined>
            <v-img :src="character.photo" 
              height="200"
              cover></v-img>
            <v-card-text>{{ character.name }}</v-card-text>
              <v-card-actions>
                  <v-btn color="green" class="flex-grow-1">
                    <v-icon>mdi-eye-outline</v-icon>
                    View
                  </v-btn>
                  <v-btn color="blue" class="flex-grow-1">
                    <v-icon>mdi-pencil</v-icon>
                    Edit
                  </v-btn>
                <v-btn color="red" class="flex-grow-1">
                  <v-icon>mdi-delete</v-icon>
                  Delete
                </v-btn>
              </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <div v-if="filteredCharacters.length === 0">
        <p>No characters found.</p>
      </div>
    </v-container>
  </div>
</template>
<style scoped></style>
<script>
export default {
  data() {
    return {
      characters: Array.from({ length: 10 }, (_, index) => ({
        id: index + 1,
        name: `Character ${index + 1}`,
        photo: `https://picsum.photos/512/512?random`
      })),
      search: '',
      viewMode: 'list'
    };
  },
  computed: {
    filteredCharacters() {
      if (this.search.length > 3) {
        return this.characters.filter(character =>
          character.name.toLowerCase().includes(this.search.toLowerCase())
        )
      }
      return this.characters
    }
  }
};
</script>