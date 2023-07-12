<template>
    <v-dialog v-model="dialog" transition="dialog-top-transition" width="auto" persistent>
        <v-card class="mx-auto" max-width="500">
            <v-card-title class="text-h6 font-weight-regular justify-space-between">
                <v-avatar color="primary" size="24" v-text="step"></v-avatar>
                <span>{{ currentTitle }}</span>
            </v-card-title>

            <v-window v-model="step">
                <v-window-item :value="1">
                    <v-card-text>
                        <v-text-field label="Project name" placeholder="My book" v-model="projectName"></v-text-field>
                        <span class="text-caption text-grey-darken-1">
                            This is only the project name, not necessarily the book title
                        </span>
                    </v-card-text>
                </v-window-item>

                <v-window-item :value="2">
                    <v-card-text>
                        <v-text-field label="Description" v-model="description"></v-text-field>
                        <span class="text-caption text-grey-darken-1">
                            Brief description about the project
                        </span>
                    </v-card-text>
                </v-window-item>

                <v-window-item :value="3">
                    <v-card-text>
                        <v-text-field label="Finish writing date" type="date" v-model="finishWritingDate"></v-text-field>
                        <v-text-field label="Finish editing date" type="date" v-model="finishEditingDate"></v-text-field>
                        <v-text-field label="Publish date" type="date" v-model="finishPublishDate"></v-text-field>
                        <v-text-field label="Word count" type="number" v-model="wordCount"></v-text-field>
                        <span class="text-caption text-grey-darken-1">
                            Your project goals
                        </span>
                    </v-card-text>
                </v-window-item>

                <v-window-item :value="4">
                    <div class="pa-4 text-center">
                        <v-progress-circular color="blue-lighten-3" indeterminate :size="54"
                            :width="12"></v-progress-circular>
                        <h3 class="text-h6 font-weight-light mb-2">
                            Creating new project
                        </h3>
                        <span class="text-caption text-grey">{{ currentAction }}</span>
                    </div>
                </v-window-item>

                <v-window-item :value="5">
                    <div class="pa-4 text-center">
                        <v-icon color="blue-lighten-2" icon="mdi-thumb-up" size="x-large" variant="text"></v-icon>
                        <h3 class="text-h6 font-weight-light mb-2">
                            New project created
                        </h3>
                    </div>
                </v-window-item>
            </v-window>

            <v-divider v-if="step !== 4"></v-divider>

            <v-card-actions v-if="step !== 4">
                <v-btn v-if="step <= 3" @click="close">
                    Cancel
                </v-btn>
                <v-btn v-if="step > 1 && step < 4" @click="step--">
                    Back
                </v-btn>
                <v-spacer v-if="step < 4"></v-spacer>
                <v-btn v-if="step < 3" @click="step++">
                    Next
                </v-btn>
                <v-btn v-if="step === 3" variant="flat" @click="createProject">
                    Done
                </v-btn>
                <v-btn v-if="step === 5" color="primary" variant="flat" block @click.stop="openProject">
                    <v-icon>mdi-book</v-icon>
                    Open project
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<style scoped>
.openBook {
    all: unset;    
}
</style>
<script>
import UtilsGoogleApi from '@/utils/UtilsGoogleApi.js';
export default {
    props: ['novelDocsJsonId','novelDocsFolderId','open'],
    emits: ['modalClosed'],
    data: () => ({
        dialog: false,
        step: 1,
        projectName: '',
        description: '',
        finishWritingDate: '',
        finishEditingDate: '',
        finishPublishDate: '',
        wordCount: 0,
        createProjectDialog: false,
        currentAction: '',
        dialog: false,
        projectId: '',
        projectJsonId: '',
    }),
    computed: {
        currentTitle() {
            switch (this.step) {
                case 1: return 'Naming'
                case 2: return 'Description'
                case 3: return 'Goals'
                case 4: return 'Processing'
                default: return 'Success'
            }
        },
    },
    methods: {
        close() {
            this.dialog = false;
            this.$emit('modalClosed');
        },
        openProject(){
            close()
            this.$router.push({ query: { view: 'book', projectId: this.projectId } })
        },
        resetSteps() {
            this.step = 1
            this.projectName = ''
            this.description = ''
            this.finishWritingDate = ''
            this.finishEditingDate = ''
            this.finishPublishDate = ''
            this.wordCount = 0
        },
        async createFolder(folder, parentId, items){
            this.currentAction = `creating ${folder} folder`
            const createdFolder = await UtilsGoogleApi.createFolder( folder, parentId)
            items[folder] = {id: createdFolder.id, list: []}
            return createdFolder
        },
        async createProject() {
            this.step++
            this.currentAction = "creating project folder"
            console.log(this.currentAction)
            try {                
                const projectFolder = await UtilsGoogleApi.createFolder(this.projectName, this.novelDocsFolderId)

                this.projectId = projectFolder.id

                this.currentAction = "creating document"
                let projectDocument = await UtilsGoogleApi.createDocument('book', this.projectId)
                
                var items = {
                    folderId: this.projectId,
                    document: { id: projectDocument.id, },
                };

                await this.createFolder('chapters', this.projectId, items)
                await this.createFolder('scenes', this.projectId, items)
                await this.createFolder('locations', this.projectId, items)
                await this.createFolder('characters', this.projectId, items)
                
                console.log('items', JSON.stringify(items))

                this.currentAction = `saving project data`
                const projectJson = await this.createProjectData(this.projectId, items)
                this.projectJsonId = projectJson.id
                
                const novelDocsData = await UtilsGoogleApi.getJson(this.novelDocsJsonId)
                novelDocsData.projects.push(
                    {
                        folderId: this.projectId,
                        projectJsonId: projectJson.id,
                        name: this.projectName
                    }
                )

                console.log('novelDocsData',JSON.stringify(novelDocsData))

                this.currentAction = `updating project list`
                await UtilsGoogleApi.updateJson(this.novelDocsJsonId, novelDocsData)

                this.currentAction = "project created"
                console.log(this.currentAction)
                this.step++
            }
            catch (err) {
                console.log(err.message);
                this.currentAction = "error creating project"
                console.log(this.currentAction)
                this.dialog = false
                return;
            }

        },
        async createProjectData(id, items) {
            this.currentAction = `saving project data`
            console.log(this.currentAction)
            try {
                const content = {
                    projectName: this.projectName,
                    description: this.description,
                    finishWritingDate: this.finishWritingDate,
                    finishEditingDate: this.finishEditingDate,
                    finishPublishDate: this.finishPublishDate,
                    wordGoal: this.wordGoal,
                    ...items
                }
                
                const novelDocsProjectData = await UtilsGoogleApi.createJson('project', id, content)
                console.log(`project data saved`)
                return novelDocsProjectData
            }
            catch (err) {
                console.log(err.message);
                return;
            }
        },
    }
}
</script>