<template>
    <v-progress-linear v-if="loading" indeterminate height="4" color="secondary"></v-progress-linear>
    <v-container fluid v-if="!loading">
        <v-row>
            <v-col cols="12" xs="12" sm="12" md="12" lg="12" class="category-viewer">
                <character-list v-if="view === 'characters'" :projectJsonFileId="projectId"
                    @close-category="closeCategory"></character-list>
                <character-list v-if="view === 'locations'" :projectJsonFileId="projectId"
                    @close-category="closeCategory"></character-list>
                <character-list v-if="view === 'chapters'" :projectJsonFileId="projectId"
                    @close-category="closeCategory"></character-list>
                <character-list v-if="view === 'scenes'" :projectJsonFileId="projectId"
                    @close-category="closeCategory"></character-list>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-card class="mx-auto document-card" height="calc(100vh - 200px)">
                    <v-card-title>{{ this.projectMetadata.projectName }}</v-card-title>
                    <v-card-text class="iframe-wrapper">
                        <iframe v-if="documentPath !== ''" :src="documentPath" style="width: 100%; height: 100%"
                            frameborder="0" allowfullscreen></iframe>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>
<style>
.document-card {
    max-width: 1024px;
}

.iframe-wrapper {
    width: 100%;
    height: 100%;
}

.category-viewer {
    max-height: 600px;
}
</style>
<script>
import UtilsGoogleApi from '@/utils/UtilsGoogleApi.js';
export default {
    name: 'project',
    components: {},
    props: { projectId: String },
    data: () => ({
        loading: true,
    }),
    async mounted(){
        console.log('lookup start')
        await this.findDocument();
        console.log('lookup end', this.projectMetadata)
        this.loading = false;
    },
    methods: {
        async findDocument() {
            this.projectMetadata = await UtilsGoogleApi.getJson(this.projectId)
            this.documentPath = `https://docs.google.com/document/d/${this.projectMetadata.document.id}/edit?rm=embedded`
        },
    }
}
</script>