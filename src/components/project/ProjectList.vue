<template>
    <v-list>
        <v-list-item>
            <v-card v-for="project in projects" :key="project.id" class="mb-2" :title="project.name" :subtitle="project.projectJsonId" max-width="1024px">
                <v-card-actions>
                    <delete-project-form :novelDocsJsonId="novelDocsFileJsonId" :projectFolderId="project.folderId"
                        :projectJsonId="project.projectJsonId" @modalClosed="handleModalClosed"></delete-project-form>
                    <v-col class="text-right">
                        <v-btn variant="tonal" color="blue"
                            @click.stop="openProject(project.projectJsonId)">Open</v-btn>
                    </v-col>
                </v-card-actions>
            </v-card>
        </v-list-item>
    </v-list>
</template>
<style></style>
<script>
import DeleteProjectForm from './DeleteProjectForm.vue';

export default {
    name: 'project-list',
    components: { DeleteProjectForm },
    props: { loading: Boolean, projects: Array, novelDocsFileJsonId: String },
    emits: ['modelClosed'],
    methods: {
        openProject(id){
            this.$router.push({ query: { view: 'book', projectId: id } })
        },
        handleModalClosed(){            
            this.$emit('modalClosed');
        }
    }
}
</script>