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
      <location-form buttonIcon="mid-plus" buttonText="Create new location" buttonColor="green" :projectId="projectId" :novelDocs="novelDocs" @modalClosed="handleModalClosed"></location-form>
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
        <v-col v-for="location in filteredLocations" :key="location.id" cols="12" sm="12" md="12">
          <v-card>
            <template v-slot:prepend>
              <v-card-title>{{ location.name }}</v-card-title>
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
        <v-col v-for="location in filteredLocations" :key="location.id" cols="12" xs="12" sm="6" :md="thumbnailColumnsSize" :lg="thumbnailColumnsSize">
          <v-card outlined>
            <v-img :src="location.thumbnail" 
              height="100"
              cover></v-img>
            <v-card-text>{{ location.name }}</v-card-text>
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

      <v-row v-if="filteredLocations.length === 0 && !loading">
        <v-col class="text-center">
          <p>No locations found.</p>
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
import LocationForm from './LocationForm.vue';
export default {
  components: { LocationForm },
  props: ['projectId', 'novelDocs', 'thumbnailsPerRow'],
  data() {
    return {
      search: '',
      viewMode: 'list',
      locations: { list: []},
      loading: false,
    };
  },
  methods: {
    close(){
      this.$emit('close','locations')
    },
    handleModalClosed() {
      this.$emit('modalClosed');
      console.log('emitted modalClosed')
      this.locations = { list: []}
      this.refreshLocations()
    },
    async refreshLocations() {
      this.loading = true;
      //let projectData = await UtilsGoogleApi.getJson(this.projectJsonFileId)
      let projectData = this.novelDocs.projects.list.find( p => { 
          return p.id == this.projectId
      })
      this.locations = projectData.locations
      this.loading = false;
    }
  },
  mounted() {
    this.refreshLocations()
  }
  ,
  computed: {
    filteredLocations() {
      if (this.search.length > 3) {
        return this.locations.list.filter(location =>
          location.name.toLowerCase().includes(this.search.toLowerCase())
        )
      }
      return this.locations.list
    },
    thumbnailColumnsSize() {
      return this.thumbnailsPerRow ? 12/this.thumbnailsPerRow : 4
    }
  }
};
</script>