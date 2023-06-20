<template>
    <v-list>
        <v-progress-linear v-if="loading" indeterminate height="4" color="secondary"></v-progress-linear>
        <v-list-tile v-for="project in projects" :key="project.id">
            <v-card :title="project.name" :subtitle="project.projectJsonId" max-width="1024px">
                <v-card-actions>
                    <delete-project-form :novelDocsJsonId="novelDocsFileJsonId" :projectFolderId="project.folderId"
                        :projectJsonId="project.projectJsonId" @modalClosed="handleModalClosed"></delete-project-form>
                    <v-col class="text-right">
                        <v-btn variant="tonal" color="blue"
                            @click.stop="this.$router.push({ query: { view: 'book', projectId: project.projectJsonId } })">Open</v-btn>
                    </v-col>
                </v-card-actions>
            </v-card>
        </v-list-tile>
    </v-list>
</template>
<style></style>
<script>
import DeleteProjectForm from '@/components/DeleteProjectForm.vue';

export default {
    name: 'project-list',
    components: { DeleteProjectForm },
    props: { loading: Boolean, projects: Array },
}
</script>