<template>
    <v-layout class="overflow-visible" style="height: 56px;">
        <app-toolbar :currentView="view" :options="menuOptions" @toolbar-click="toolbarAction"></app-toolbar>
        <create-project-form v-model="createProjectDialog" :novelDocs="novelDocs"
            @modalClosed="handleModalClosed"></create-project-form>
    </v-layout>
    <v-container class="content" fluid>
        <v-progress-linear v-if="loading" indeterminate height="4" color="secondary"></v-progress-linear>
        <project-list v-if="isViewVisible('projects')" :projects="projects" :novelDocs="novelDocs" @modalClosed="handleModalClosed"></project-list>
        <character-list v-if="isCategoryVisible('characters')" :projectId="projectId" :novelDocs="novelDocs" @close="closeCategory" @modalClosed="handleModalClosed"></character-list>
        <chapter-list v-if="isCategoryVisible('chapters')" :projectId="projectId" :novelDocs="novelDocs" @close="closeCategory" @modalClosed="handleModalClosed"></chapter-list>
        <location-list v-if="isCategoryVisible('locations')" :projectId="projectId" :novelDocs="novelDocs" @close="closeCategory" thumbnailsPerRow="3" @modalClosed="handleModalClosed"></location-list>
        <scene-list v-if="isCategoryVisible('scenes')" :projectId="projectId" :novelDocs="novelDocs" @close="closeCategory" thumbnailsPerRow="3" @modalClosed="handleModalClosed"></scene-list>
        <project v-if="isViewVisible('book')" :projectId="projectId" :novelDocs="novelDocs"></project>
    </v-container>
</template>
<style scoped>
.content {
    max-width: 1024px;
}
</style>
<script>
import AppToolbar from '@/components/AppToolbar.vue';
import CreateProjectForm from '@/components/project/CreateProjectForm.vue';
import DeleteProjectForm from '@/components/project/DeleteProjectForm.vue';
import CharacterList from '@/components/character/CharacterList.vue';
import ChapterList from '@/components/chapter/ChapterList.vue';
import LocationList from '@/components/location/LocationList.vue';
import ProjectList from '@/components/project/ProjectList.vue';
import SceneList from '@/components/scene/SceneList.vue';
import Project from '@/components/project/Project.vue';
import UtilsGoogleApi from '@/utils/UtilsGoogleApi.js';

export default {
    components: { CreateProjectForm, DeleteProjectForm, AppToolbar, ProjectList, Project, CharacterList, ChapterList, LocationList, SceneList },
    data: () => ({
        tokenClient: null,
        CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        API_KEY: import.meta.env.VITE_API_KEY,
        DISCOVERY_DOC: import.meta.env.VITE_DISCOVERY_DOC,
        SCOPES: import.meta.env.VITE_SCOPES,
        BACKEND_API_URL: import.meta.env.VITE_BACKEND_API_URL,
        bGapiLoaded: false,
        bGisLoaded: false,
        projects: [],
        loading: true,
        novelDocs: null,
        novelDocsFolder: null,
        novelDocsFileJson: null,
        novelDocsFolderId: null,
        novelDocsFileJsonId: null,
        createProjectDialog: false,
        categories: ['chapters', 'scenes', 'characters', 'locations']
    }),
    mounted() {
        this.loading = true;
        this.listFiles();
    },
    computed: {
        projectId() {
            return this.$route.query.projectId
        },
        category() {
            return this.$route.query.category
        },
        menuOptions() {
            return {
                'projects': ['new-project', 'refresh'],
                'book': ['projects', 'book', 'chapters', 'scenes', 'characters', 'locations'],
            }[this.view]
        },
        view() {
            return this.$route.query.view || 'projects'
        },
    },
    methods: {
        content() {
            const content = [
                {
                    view: 'projects',
                    component: 'project-list',
                    props: {
                        loading: this.loading,
                        projects: this.projects
                    },
                },
            ].find(content => content.view === this.view())
            return content
        },
        isViewVisible(view) {
            if(!this.loading){
                return this.view == view
            }
            return false
        },
        isCategoryVisible(category) {
            if(!this.loading && this.isViewVisible('book')){
                return this.category == category
            }
            return false
        },
        closeCategory(){
            this.listFiles();
            this.$router.push({ query: { view: 'book', projectId: this.projectId } })
        },
        toolbarAction(action) {
            const toolbarActions = {
                "new-project": this.createNewProject,
                "refresh": this.listFiles,
                "projects": () => this.$router.push({ query: { view: 'projects' } }),
                "characters": () => this.$router.push({ query: { view: 'book', projectId: this.projectId, category: 'characters' } }),
                "chapters": () => this.$router.push({ query: { view: 'book', projectId: this.projectId, category: 'chapters' } }),
                "locations": () => this.$router.push({ query: { view: 'book', projectId: this.projectId, category: 'locations' } }),
                "scenes": () => this.$router.push({ query: { view: 'book', projectId: this.projectId, category: 'scenes' } }),
                "close-category": () => this.$router.push({ query: { view: 'book', projectId: this.projectId, } }),
            }

            toolbarActions[action]()
        },
        handleModalClosed() {
            this.createProjectDialog = false
            this.listFiles()
        },
        createNewProject() {
            this.createProjectDialog = true
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
        async authCallback(resp) {
            if (resp.error !== undefined) {
                throw (resp);
            }
            localStorage.setItem("accessToken", resp.access_token);
            await this.listFiles();
        },        
        async listFiles() {
            console.log('retrieve updated data')
            this.loading = true;
            this.projects = []
            try {
                this.novelDocs = await this.getNovelDocs()
                this.projects = this.novelDocs.projects?.list ? this.novelDocs.projects?.list : []
                /*const novelDocsFiles = await this.getNovelDocsFiles()
                this.novelDocsFolder = novelDocsFiles.find(file => file.name === 'noveldocs')
                this.novelDocsFileJson = novelDocsFiles.find(file => file.name === 'noveldocs.json')
                const novelDocsJson = await UtilsGoogleApi.getJson(this.novelDocsFileJson.id)
                this.projects = novelDocsJson.projects
                this.novelDocsFolderId = this.novelDocsFolder.id
                this.novelDocsFileJsonId = this.novelDocsFileJson.id*/
            }
            catch (err) {
                console.error(err);
            }
            this.loading = false;
        },
        async getNovelDocs() {

            var novelDocs = await UtilsGoogleApi.getNovelDocs(this.BACKEND_API_URL)
            if(!novelDocs){
                novelDocs = await UtilsGoogleApi.postNovelDocs(this.BACKEND_API_URL,{projects: {list: []}})
            }
            //var driveFiles = await UtilsGoogleApi.getFiles();
            //var novelDocsFiles = []
            /*
            let novelDocsFolder = driveFiles.find(file => file.name === 'noveldocs')
            if (!novelDocsFolder) {
                novelDocsFolder = await UtilsGoogleApi.createFolder('noveldocs')
            }
            novelDocsFiles.push(novelDocsFolder)
            let novelDocsFileJson = driveFiles.find(file => file.name === 'noveldocs.json')
            if (!novelDocsFileJson) {
                const content = {
                    novelDocsFolderId: novelDocsFolder.id,
                    projects: []
                }
                novelDocsFileJson = await UtilsGoogleApi.createJson('noveldocs', novelDocsFolder.id, content)
            }*/
            //novelDocsFiles.push(novelDocsFileJson)
            //return novelDocsFiles
            return novelDocs
        }
    },
}
</script>
