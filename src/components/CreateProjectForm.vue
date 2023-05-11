<template>
    <v-dialog v-model="dialog" transition="dialog-top-transition" width="auto" persistent>
        <template v-slot:activator="{ props }">
            <v-btn v-bind="props" @click.stop="resetSteps">
                <v-icon>mdi-plus</v-icon>
                Create a new project
            </v-btn>
        </template>
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
                        <v-text-field label="Description"></v-text-field>
                        <span class="text-caption text-grey-darken-1">
                            Brief description about the project
                        </span>
                    </v-card-text>
                </v-window-item>

                <v-window-item :value="3">
                    <v-card-text>
                        <v-text-field label="Finish writing date" type="date"></v-text-field>
                        <v-text-field label="Finish editing date" type="date"></v-text-field>
                        <v-text-field label="Publish date" type="date"></v-text-field>
                        <v-text-field label="Word count" type="number"></v-text-field>
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
                <v-btn v-if="step > 1 && step < 4" variant="text" @click="step--">
                    Back
                </v-btn>
                <v-spacer v-if="step < 4"></v-spacer>
                <v-btn v-if="step < 3" color="primary" variant="flat" @click="step++">
                    Next
                </v-btn>
                <v-btn v-if="step === 3" color="primary" variant="flat" @click="createProject">
                    Done
                </v-btn>
                <v-btn v-if="step === 5" color="primary" variant="flat" block>
                    <router-link :to="'/project/' + this.projectId" @click.stop="this.dialog = false">
                        <v-list-tile-action>
                            <v-icon class="white--text">mdi-book</v-icon>
                        </v-list-tile-action>
                        <v-list-tile-content>
                            <v-list-tile-title class="white--text">Open project</v-list-tile-title>
                        </v-list-tile-content>
                    </router-link>
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    data: () => ({
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
        projectId: ''
    }),

    computed: {
        currentTitle() {
            switch (this.step) {
                case 1: return 'Naming'
                case 2: return 'Description'
                case 3: return 'Goals'
                default: return 'Success'
            }
        },
    },
    methods: {
        resetSteps() {
            this.step = 1
            this.projectName = ''
            this.description = ''
            this.finishWritingDate = ''
            this.finishEditingDate = ''
            this.finishPublishDate = ''
            this.wordCount = 0
        },
        async createProject() {
            this.step++
            this.currentAction = "creating project folder"
            console.log(this.currentAction)
            let response;
            try {
                var fileMetadata = {
                    'name': 'noveldocs_project_' + this.projectName,
                    'mimeType': 'application/vnd.google-apps.folder',
                    'parents': ['1hiBOUViC-pVYSuM5GCvgQ5yMIFXjseaH']
                };
                response = await gapi.client.drive.files.create({
                    resource: fileMetadata,
                    fields: "id"
                });
                console.log("response", JSON.stringify(response))
                this.projectId = response.result.id
                await this.createDocument(this.projectId, this.projectName)
                await this.createProjectData(this.projectId)
                await this.createSubfolder(this.projectId, "chapters")
                await this.createSubfolder(this.projectId, "scenes")
                await this.createSubfolder(this.projectId, "locations")
                await this.createSubfolder(this.projectId, "characters")

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
        async createDocument(id) {
            this.currentAction = `creating document`
            console.log(this.currentAction)
            let response;
            try {
                var fileMetadata = {
                    'name': `noveldocs_${id}_document`,
                    'mimeType': 'application/vnd.google-apps.document',
                    'parents': [id],
                    'publishAuto': true
                };
                response = await gapi.client.drive.files.create({
                    resource: fileMetadata,
                    fields: "id"
                });
                console.log("response", JSON.stringify(response))
            }
            catch (err) {
                console.log(err.message);
                return;
            }
            console.log(`Document ${this.projectName} created`)
        },
        async createProjectData(id) {
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
                }

                const jsonContent = JSON.stringify(content);
                console.log('content', jsonContent)

                var file = new Blob([jsonContent], {type: 'text/plain'})
                var metadata = {
                    'name': `noveldocs_${id}_data.json`,
                    'mimeType': 'text/plain', 
                    'parents': [id], 
                }

                var accessToken = gapi.auth.getToken().access_token
                var form = new FormData()
                form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
                form.append('file', file)

                let response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', {
                    method: 'POST',
                    headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
                    body: form,
                })

                console.log("response", JSON.stringify(response))
            }
            catch (err) {
                console.log(err.message);
                return;
            }
            console.log(`project data saved`)
        },
        async createSubfolder(id, type) {
            this.currentAction = `creating ${type} folder`
            console.log(this.currentAction)
            let response;
            try {
                var fileMetadata = {
                    'name': `noveldocs_${id}_${type}`,
                    'mimeType': 'application/vnd.google-apps.folder',
                    'parents': [id]
                };
                response = await gapi.client.drive.files.create({
                    resource: fileMetadata,
                    fields: "id"
                });
                console.log("response", JSON.stringify(response))
            }
            catch (err) {
                console.log(err.message);
                return;
            }
            console.log(`Folder ${type} created`)
        }
    }
}
</script>