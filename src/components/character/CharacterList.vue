<template>
  <v-container>
    <v-toolbar color="white" dense floating>
      <v-text-field single-line hide-details v-model="search" placeholder="Search" variant="underlined"
        prepend-icon="mdi-magnify"></v-text-field>
        <v-btn color="red" @click.stop="close" variant="tonal">
            <v-icon>mdi-close</v-icon>
            Close
        </v-btn>
    </v-toolbar>
    <v-toolbar color="white" dense floating>
      <character-form buttonIcon="mid-plus" buttonText="Create new character" buttonColor="green" :projectId="projectId" :novelDocs="novelDocs" @modalClosed="handleModalClosed"></character-form>
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
    <v-container v-if="loading">
      <v-row>
        <v-col cols="12" sm="12" md="12">
          <v-progress-linear indeterminate height="4" color="secondary"></v-progress-linear>
        </v-col>
      </v-row>
    </v-container>
    <v-container class="overflow-auto">
      <v-row v-if="viewMode === 'list'">
        <v-col v-for="character in filteredCharacters" :key="character.id" cols="12" sm="12" md="12">
          <v-card>
            <template v-slot:prepend>
              <v-card-title>{{ character.name }}</v-card-title>
            </template>

            <template v-slot:append>
              <v-card-actions>
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
        <v-col v-for="character in filteredCharacters" :key="character.id" cols="12" xs="12" :sm="thumbnailColumnsSize" :md="thumbnailColumnsSize" :lg="thumbnailColumnsSize">
          <v-card outlined>
            <v-img :src="character.thumbnail" 
              height="100"
              cover></v-img>
            <v-card-text>{{ character.name }}</v-card-text>
              <v-card-actions>
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

      <v-row v-if="filteredCharacters.length === 0 && !loading">
        <v-col class="text-center">
          <p>No characters found.</p>
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>
<style scoped>
.overflow-auto{
  max-height: 400px;
  overflow-y: auto;
}
</style>
<script>
import UtilsGoogleApi from '@/utils/UtilsGoogleApi.js';
import CharacterForm from './CharacterForm.vue';
export default {
  components: { CharacterForm },
  props: ['projectId', 'novelDocs', 'thumbnailsPerRow'],
  emits: ['modalClosed'],
  data() {
    return {
      /*characters: Array.from({ length: 10 }, (_, index) => ({
        id: index + 1,
        name: `Character ${index + 1}`,
        photo: `https://picsum.photos/512/512?random`
      })),*/
      search: '',
      viewMode: 'list',
      characters: { list: []},
      loading: false,
    };
  },
  methods: {
    close(){
      this.$emit('close','characters')
    },
    handleModalClosed() {
      this.$emit('modalClosed');
      console.log('emitted modalClosed')
      this.characters = { list: []}
      this.refreshCharacters()
    },
    async refreshCharacters() {
      this.loading = true;
      //let projectData = await UtilsGoogleApi.getJson(this.projectJsonFileId)
      let projectData = this.novelDocs.projects.list.find( p => { 
          return p.id == this.projectId
      })
      this.characters = projectData.characters
      this.loading = false;
    }
  },
  mounted() {
    this.refreshCharacters()
  }
  ,
  computed: {
    filteredCharacters() {
      if (this.search.length > 3) {
        return this.characters.list.filter(character =>
          character.name.toLowerCase().includes(this.search.toLowerCase())
        )
      }
      return this.characters.list
    },
    thumbnailColumnsSize() {
      return this.thumbnailsPerRow ? 12/this.thumbnailsPerRow : 4
    }
  }
};
</script>