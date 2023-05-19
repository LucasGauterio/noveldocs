<template>
    <v-layout class="overflow-visible" style="height: 56px;">
        <v-bottom-navigation bg-color="indigo">
            <create-project-form @modalClosed="handleModalClosed"></create-project-form>
            <v-btn @click.stop="listFiles">
                <v-icon>mdi-refresh</v-icon>
                Refresh
            </v-btn>
        </v-bottom-navigation>
    </v-layout>
    <v-list>
        <v-list-tile v-for="project in projects" :key="project.id">
            <v-card :title="project.title" :subtitle="project.id" max-width="1024px">
                <v-card-actions>
                    <delete-project-form :projectId="project.id" @modalClosed="handleModalClosed"></delete-project-form>
                    <v-col class="text-right">
                        <router-link :to="'/project/' + project.id">
                            <v-btn variant="tonal" color="blue">Open</v-btn>
                        </router-link>
                    </v-col>
                </v-card-actions>
            </v-card>
        </v-list-tile>
    </v-list>
</template>
<style>


</style>
<script>
import CreateProjectForm from '@/components/CreateProjectForm.vue';
import DeleteProjectForm from '@/components/DeleteProjectForm.vue';

export default {
    components: { CreateProjectForm, DeleteProjectForm },
    data: () => ({
        tokenClient: null,
        CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        API_KEY: import.meta.env.VITE_API_KEY,
        DISCOVERY_DOC: import.meta.env.VITE_DISCOVERY_DOC,
        SCOPES: import.meta.env.VITE_SCOPES,
        bGapiLoaded: false,
        bGisLoaded: false,
        projects: []
    }),
    mounted() {
        this.loadGoogleScripts();
    },
    computed() {
    },
    methods: {
        handleModalClosed() {
            this.listFiles();
        },
        askPermission() {
            if (this.bGisLoaded && this.bGapiLoaded) {
                let accessToken = localStorage.getItem("accessToken");
                if (accessToken) {
                    console.log("session token", accessToken);
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
                console.log("gapiLoaded");
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
            console.log("gisLoaded");
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
            let response;
            try {
                response = await gapi.client.drive.files.list({
                    "pageSize": 50,
                    "fields": "files(id, name)",
                });
            }
            catch (err) {
                console.log(err.message);
                return;
            }
            const files = response.result.files;
            if (!files || files.length == 0) {
                console.log("No files found.");
                return;
            }
            // Flatten to string to display
            this.projects = files.filter(file => file.name.includes("noveldocs_project_")).map((file) => ({ ...file, title: file.name.replace("noveldocs_project_", "") }));
            const outputFolder = files.filter(file => file.name === "noveldocs_").reduce((str, file) => `${str}${file.name} (${file.id})\n`, "Folder:\n");
            console.log(outputFolder);
            const output = this.projects.reduce((str, file) => `${str}${file.name} (${file.id})\n`, "Files:\n");
            console.log(output);
        },
    },
}
</script>
