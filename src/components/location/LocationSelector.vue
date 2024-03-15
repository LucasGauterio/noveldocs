<template>
        <v-autocomplete
            v-model="selectedLocations"
            :items="locations"
            :label="label"
            item-title="name"
            item-value="item.raw"
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
    props: ['locations','label'],
    emits: ['locationsSelected'],
    data() {
      return {
        selectedLocations: [],
      };
    },
    methods: {
      removeScene(index) {
        this.selectedLocations.splice(index, 1);
      },
    },
    watch: {
      selectedLocations(){
        this.$emit('locationsSelected', { locations: this.locations.filter(loc => this.selectedLocations.includes(loc.name)) })
      }
    }
  };
  </script>