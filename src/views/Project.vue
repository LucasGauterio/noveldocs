<template>
    <v-layout class="overflow-visible" style="height: 56px;">
        <v-bottom-navigation v-model="view" bg-color="indigo">
            <v-btn @click.stop="navigateToProjects">
                <v-icon>mdi-book-alphabet</v-icon>
                Projects
            </v-btn>
            <v-btn value="book">
                <v-icon>mdi-book-open-variant</v-icon>
                Novel
            </v-btn>
            <v-btn value="chapters">
                <v-icon>mdi-format-list-numbered</v-icon>
                Chapters
            </v-btn>
            <v-btn value="scenes">
                <v-icon>mdi-movie-open-edit</v-icon>
                Scenes
            </v-btn>
            <v-btn value="characters">
                <v-icon>mdi-account-group</v-icon>
                Characters
            </v-btn>
            <v-btn value="locations">
                <v-icon>mdi-city</v-icon>
                Locations
            </v-btn>
        </v-bottom-navigation>
    </v-layout>
    <v-container fluid v-if="projectMetadata">
        <v-row>
            <v-col cols="12" xs="12" sm="12" md="12" lg="12" class="category-viewer">
                <character-list v-if="view === 'characters'" :projectJsonFileId="projectId" @close-category="closeCategory"></character-list>
                <character-list v-if="view === 'locations'"  :projectJsonFileId="projectId" @close-category="closeCategory"></character-list>
                <character-list v-if="view === 'chapters'"  :projectJsonFileId="projectId" @close-category="closeCategory"></character-list>
                <character-list v-if="view === 'scenes'"  :projectJsonFileId="projectId" @close-category="closeCategory"></character-list>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-card class="mx-auto document-card" height="calc(100vh - 200px)">
                    <v-card-title>{{ this.projectMetadata.projectName }}</v-card-title>
                    <v-card-text class="iframe-wrapper">
                        <iframe v-if="documentPath !== ''" :src="documentPath" style="width: 100%; height: 100%" frameborder="0"
                            allowfullscreen></iframe>
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
import CharacterList from '@/components/CharacterList.vue';
import UtilsGoogleApi from '@/utils/UtilsGoogleApi.js';
export default {
    components: { CharacterList },
    data: () => ({
        view: 'book',
        bookLoaded: false,
        documentFile: null,
        metadataFile: null,
        projectMetadata: null,
        tokenClient: null,
        CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        API_KEY: import.meta.env.VITE_API_KEY,
        DISCOVERY_DOC: import.meta.env.VITE_DISCOVERY_DOC,
        SCOPES: import.meta.env.VITE_SCOPES,
        bGapiLoaded: false,
        bGisLoaded: false,
        projects: [],
        createProjectDialog: false,
        documentPath: '',
        sidebar: null,
    }),
    mounted() {
        console.log("loading")
        this.loadGoogleScripts()
    },
    computed: {
        projectId() {
            return this.$route.params.projectId
        },
    },
    methods: {
        navigateToProjects() {
            this.$router.push('/projects');
        },
        closeCategory(){
            this.view = 'book'
        },
        async findDocument() {
            this.view = 'book';
            this.projectMetadata = await UtilsGoogleApi.getJson(this.projectId)
            //console.log('projectMetadata', JSON.stringify(this.projectMetadata))
            //console.log('projectMetadata', JSON.stringify(this.projectMetadata.document.id))
            // Flatten to string to display
            this.documentFile = this.projectMetadata.document.id
            this.documentPath = `https://docs.google.com/document/d/${this.projectMetadata.document.id}/edit?rm=embedded`
            //console.log("document ", this.documentFile)
            //console.log("data ", this.projectMetadata)
        },
        async askPermission() {
            if (this.bGisLoaded && this.bGapiLoaded) {
                let accessToken = localStorage.getItem("accessToken")
                if (accessToken) {
                    //console.log("session token", accessToken)
                    gapi.client.setToken(accessToken)
                }
                if (gapi.client.getToken() === null) {
                    // Prompt the user to select a Google Account and ask for consent to share their data
                    // when establishing a new session.
                    this.tokenClient.requestAccessToken({ prompt: "consent" });
                }
                else {
                    // Skip display of account chooser and consent dialog for an existing session.
                    this.tokenClient.requestAccessToken({ prompt: "" });
                }
            }
        },
        gapiLoaded() {
            gapi.load("client", async () => {
                await gapi.client.init({
                    apiKey: this.API_KEY,
                    discoveryDocs: [this.DISCOVERY_DOC],
                });
                //console.log("gapiLoaded")
                this.bGapiLoaded = true
                this.askPermission()
            });
        },
        async authCallback(resp) {
            if (resp.error !== undefined) {
                throw (resp);
            }
            //console.log("authCallback", JSON.stringify(resp));
            //console.log("getAuthInstance", JSON.stringify(gapi.auth2.getAuthInstance()));

            localStorage.setItem("accessToken", resp.access_token);

            this.findDocument();
        },
        gisLoaded() {
            this.tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: this.CLIENT_ID,
                scope: this.SCOPES,
                callback: this.authCallback, // defined later
            });
            //console.log("gisLoaded")
            this.bGisLoaded = true
            this.askPermission()
        },
        loadGoogleScripts() {
            var scripts = [
                {
                    src: "https://apis.google.com/js/api.js",
                    onload: this.gapiLoaded
                },
                {
                    src: "https://accounts.google.com/gsi/client",
                    onload: this.gisLoaded
                }
            ];
            scripts.forEach(script => {
                let tag = document.createElement("script");
                tag.setAttribute("src", script.src);
                tag.onload = script.onload;
                tag.async = true;
                tag.defer = true;
                document.head.appendChild(tag);
            });
        },
    },
}
</script>
