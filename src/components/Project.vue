<template>
    <v-progress-linear v-if="loading" indeterminate height="4" color="secondary"></v-progress-linear>
    <v-container fluid v-if="!loading">
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
    props: ['projectId'],
    data: () => ({
        loading: true,
    }),
    async mounted(){
        await this.findDocument();
        this.loading = false;
    },
    methods: {
        async findDocument() {
            this.projectMetadata = await UtilsGoogleApi.getJson(this.projectId)
            this.documentPath = `https://docs.google.com/document/d/${this.projectMetadata.document.id}/edit?rm=embedded&embedded=true`
        },
    }
}
</script>