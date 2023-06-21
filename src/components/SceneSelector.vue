<template>
        <v-autocomplete
            v-model="selectedScenes"
            :items="scenes"
            :label="label"
            item-title="name"
            item-value="file"
            clearable
            outlined
            chips
            multiple
            closable-chips
            >
            <template v-slot:chip="{ props, item }">
                <v-chip class="ma-1" color="primary" label
                    v-bind="props"
                    :prepend-avatar="item.raw.thumbnail"
                    :text="item.raw.name"
                ></v-chip>
            </template>
            <template v-slot:item="{ props, item }">
                <v-list-item
                    v-bind="props"
                    :prepend-avatar="item?.raw?.thumbnail"
                    :title="item?.raw?.name"
                ></v-list-item>
            </template>
        </v-autocomplete>
  </template>
  
  <script>
  export default {
    props: ['scenes','label'],
    data() {
      return {
        selectedScenes: [],
      };
    },
    methods: {
      removeScene(index) {
        this.selectedScenes.splice(index, 1);
      },
      sceneSelected(){
        this.$emit('scenesSelected', { scenes: Array.from(this.selectedScenes) });
      }
    },
  };
  </script>