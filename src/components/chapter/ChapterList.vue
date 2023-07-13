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
      <chapter-form button-text="Create new chapter" button-color="green" :projectJsonFileId="projectJsonFileId" @modalClosed="handleModalClosed"></chapter-form>
    </v-toolbar>

    <v-container v-if="loading">
      <v-row>
        <v-col cols="12" sm="12" md="12">
          <v-progress-linear indeterminate height="4" color="secondary"></v-progress-linear>
        </v-col>
      </v-row>
    </v-container>
    <v-container class="overflow-auto">
      <v-row>
        <v-col v-for="chapter in filteredChapters" :key="chapter.id" cols="12" sm="12" md="12">
          <v-card>
            <template v-slot:prepend>
              <v-card-title>{{ chapter.order }} - {{ chapter.title }}</v-card-title>
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

      <v-row v-if="filteredChapters.length === 0 && !loading">
        <v-col class="text-center">
          <p>No chapters found.</p>
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
import ChapterForm from './ChapterForm.vue';
export default {
  components: { ChapterForm },
  props: ['projectJsonFileId', 'thumbnailsPerRow'],
  data() {
    return {
      search: '',
      viewMode: 'list',
      chapters: { list: []},
      loading: false,
    };
  },
  methods: {
    close(){
      this.$emit('close','chapters')
    },
    handleModalClosed() {
      this.chapters = { list: []}
      this.refreshChapters()
    },
    async refreshChapters() {
      this.loading = true
      let projectData = await UtilsGoogleApi.getJson(this.projectJsonFileId)
      this.chapters = projectData.chapters
      this.loading = false
    }
  },
  mounted() {
    this.refreshChapters()
  }
  ,
  computed: {
    filteredChapters() {
      if (this.search.length > 3) {
        return this.chapters.list.filter(chapter =>
          chapter.name.toLowerCase().includes(this.search.toLowerCase())
        )
      }
      return this.chapters.list
    },
  }
};
</script>