<template>
    <v-bottom-navigation v-model="action" bg-color="indigo">
        <v-btn v-for="button in visibleButtons" :value="button.value" @click.stop="emitEvent">
            <v-icon>{{button.icon}}</v-icon>
            {{button.text}}
        </v-btn>
    </v-bottom-navigation>
</template>
<style>
</style>
<script>
export default {
  props: {currentView: String, options: {type: Array, required: true} },
  data: () => ({
    action: null,
    buttons: [
        {value: 'new-project', icon: 'mdi-plus', text: 'Create a new project'},
        {value: 'refresh', icon: 'mdi-refresh', text: 'Refresh'},
        {value: 'projects', icon: 'mdi-book-alphabet', text: 'Projects'},
        {value: 'book', icon: 'mdi-book-open-variant', text: 'Novel'},
        {value: 'chapters', icon: 'mdi-format-list-numbered', text: 'Chapters'},
        {value: 'scenes', icon: 'mdi-movie-open-edit', text: 'Scenes'},
        {value: 'characters', icon: 'mdi-account-group', text: 'Characters'},
        {value: 'locations', icon: 'mdi-city', text: 'Locations'},
    ]
  }),
  methods: {
    emitEvent(){
        this.$emit('toolbar-click', this.action);
        this.action = null;
    }
  },
  computed: {
    visibleButtons(){
        return this.buttons.filter(button => this.options.includes(button.value));
    }
  }
}
</script>