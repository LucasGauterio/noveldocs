<template>
    <v-layout class="overflow-visible" style="height: 56px;">
        <v-bottom-navigation bg-color="indigo" :disabled="loading">
            <create-project-form :novelDocsJsonId="novelDocsFileJsonId" :novelDocsFolderId="novelDocsFolderId" @modalClosed="handleModalClosed"></create-project-form>
            <v-btn @click.stop="listFiles">
                <v-icon>mdi-refresh</v-icon>
                Refresh
            </v-btn>
        </v-bottom-navigation>
    </v-layout>
    <v-container class="content" fluid>
    <v-list>
        <v-progress-linear
            v-if="loading"
            indeterminate
            height="4"
            color="secondary"
            ></v-progress-linear>
        <v-list-tile v-for="project in projects" :key="project.id">
            <v-card :title="project.name" :subtitle="project.projectJsonId" max-width="1024px">
                <v-card-actions>
                    <delete-project-form :novelDocsJsonId="novelDocsFileJsonId" :projectFolderId="project.folderId" :projectJsonId="project.projectJsonId" @modalClosed="handleModalClosed"></delete-project-form>
                    <v-col class="text-right">
                        <router-link :to="'/projects/' + project.projectJsonId">
                            <v-btn variant="tonal" color="blue">Open</v-btn>
                        </router-link>
                    </v-col>
                </v-card-actions>
            </v-card>
        </v-list-tile>
    </v-list>
    </v-container>
</template>
<style scoped>
.content {
    max-width: 1024px;
}

</style>
<script>
import CreateProjectForm from '@/components/CreateProjectForm.vue';
import DeleteProjectForm from '@/components/DeleteProjectForm.vue';
import UtilsGoogleApi from '@/utils/UtilsGoogleApi.js';

export default {
    components: { CreateProjectForm, DeleteProjectForm },
    data: () => ({
        tokenClient: null,
        CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        API_KEY: import.meta.env.VITE_API_KEY,
        DISCOVERY_DOC: import.meta.env.VITE_DISCOVERY_DOC,
        SCOPES: import.meta.env.VITE_SCOPES.split(','),
        bGapiLoaded: false,
        bGisLoaded: false,
        projects: [],
        loading: true,
        novelDocsFolder: null,
        novelDocsFileJson: null,
        novelDocsFolderId: null,
        novelDocsFileJsonId: null,
    }),
    mounted() {
        this.loadGoogleScripts();
    },
    computed: {
    },
    methods: {
        handleModalClosed() {
            this.listFiles();
        },
        askPermission() {
            if (this.bGisLoaded && this.bGapiLoaded) {
                let accessToken = localStorage.getItem("accessToken");
                if (accessToken) {
                    gapi.client.setToken(accessToken);
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
                this.bGapiLoaded = true;
                this.askPermission();
            });
        },
        async authCallback(resp) {
            if (resp.error !== undefined) {
                throw (resp);
            }
            console.log("authCallback", JSON.stringify(resp));
            console.log("getAuthInstance", JSON.stringify(gapi.auth2.getAuthInstance()));

            localStorage.setItem("accessToken", resp.access_token);

            await this.listFiles();
        },
        gisLoaded() {
            this.tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: this.CLIENT_ID,
                scope: this.SCOPES,
                callback: this.authCallback, // defined later
            });
            this.bGisLoaded = true;
            this.askPermission();
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
        async listFiles() {
            this.loading=true;
            this.projects = []
            try {
                const novelDocsFiles = await this.getNovelDocsFiles()
                this.novelDocsFolder = novelDocsFiles.find(file => file.name === 'noveldocs')
                this.novelDocsFileJson = novelDocsFiles.find(file => file.name === 'noveldocs.json')
                const novelDocsJson = await UtilsGoogleApi.getJson(this.novelDocsFileJson.id)
                this.projects = novelDocsJson.projects
                this.novelDocsFolderId= this.novelDocsFolder.id
                this.novelDocsFileJsonId= this.novelDocsFileJson.id
            }
            catch (err) {
                console.error(err);
            }
            this.loading=false;
        },
        async getNovelDocsFiles(){
            var driveFiles = await UtilsGoogleApi.getFiles();
            var novelDocsFiles = []
            let novelDocsFolder = driveFiles.find(file => file.name === 'noveldocs')
            if(!novelDocsFolder){
                novelDocsFolder = await UtilsGoogleApi.createFolder('noveldocs')
            }
            novelDocsFiles.push(novelDocsFolder)
            let novelDocsFileJson = driveFiles.find(file => file.name === 'noveldocs.json')
            if(!novelDocsFileJson){
                const content = {
                    novelDocsFolderId: novelDocsFolder.id,
                    projects: []
                }
                novelDocsFileJson = await UtilsGoogleApi.createJson('noveldocs', novelDocsFolder.id, content)
            }
            novelDocsFiles.push(novelDocsFileJson)
            return novelDocsFiles
        }
    },
}
</script>
