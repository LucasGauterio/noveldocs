<template>
        <v-autocomplete
            v-model="selectedCharacters"
            :items="characters"
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
                    :prepend-avatar="item.raw.avatar"
                    :text="item.raw.name"
                ></v-chip>
            </template>
            <template v-slot:item="{ props, item }">
                <v-list-item
                    v-bind="props"
                    :prepend-avatar="item?.raw?.photo"
                    :title="item?.raw?.name"
                ></v-list-item>
            </template>
        </v-autocomplete>
  </template>
  
  <script>
  export default {
    props: ['characters','label'],
    emits: ['charactersSelected'],
    data() {
      return {
        selectedCharacters: [],
      };
    },
    methods: {
      removeCharacter(index) {
        this.selectedCharacters.splice(index, 1);
      }
    },
    watch:{
        selectedCharacters(){
          this.$emit('charactersSelected', { characters: this.characters.filter(char => this.selectedCharacters.includes(char.name)) })
        }
    }
  };
  </script>