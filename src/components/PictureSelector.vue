<template>
  <v-container fluid>
    <v-row>
      <v-file-input v-model="selectedFiles"
        prepend-icon="mdi-image"
        accept="image/png, image/jpeg" :label="labelText" @change="handleFileSelect"
        @drop="handleDrop" @dragover.prevent show-size multiple
        ref="fileInput"></v-file-input>        
    </v-row>
    <v-container fluid class="thumbnail-container">
      <v-row>
        <v-col cols="4" v-for="(file, index) in fileList" :key="index">
          <v-card>
            <v-img :src="file.thumbnail" cover></v-img>
            <v-card-text>{{ file.name }}</v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<script>
export default {
  props: ['label'],
  data() {
    return {
      selectedFiles: [],
      fileList: [],
    };
  },
  computed: {
    labelText() {
      return this.label + " (PNG, JPG)"
    }
  },
  methods: {
    handleFileSelect() {
      this.addFiles(this.selectedFiles);
      this.resetFileInput();
    },
    handleDrop(event) {
      event.preventDefault();
      const files = event.dataTransfer.files;
      this.addFiles(files);
      this.resetFileInput();
    },
    addFiles(files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();

        reader.onload = (e) => {
          const thumbnail = e.target.result;
          this.fileList.push({
            name: file.name,
            thumbnail: thumbnail,
          });
          this.filesSelected();
        };

        reader.readAsDataURL(file);
      }
    },
    resetFileInput() {
      this.$refs.fileInput.reset();
    },
    filesSelected(){
      this.$emit('filesSelected', { pictures: Array.from(this.fileList) });
    },
  },
};
</script>

<style scoped>
.thumbnail-container {
  max-height: 300px;
  overflow-y: auto;
}
</style>
