<template>
    <v-dialog v-model="dialog" transition="dialog-top-transition" width="auto" persistent>
        <template v-slot:activator="{ props }">
            <v-btn variant="tonal" color="red" v-bind="props">
                <v-icon>mdi-delete</v-icon>
                Delete
            </v-btn>
        </template>
        <v-card class="mx-auto" max-width="500">
            <v-card-title class="text-h6 font-weight-regular justify-space-between">
                <v-avatar color="primary" size="24" v-text="step"></v-avatar>
                <span>{{ currentTitle[step-1] }}</span>
            </v-card-title>

            <v-window v-model="step">
                <v-window-item :value="1">
                    <div class="pa-4 text-center">
                        <h3 class="text-h6 font-weight-light mb-2">
                            Deleting a project is an irreversible action!
                        </h3>
                        <h3 class="text-h6 font-weight-light mb-2">
                            If you still want to proceed type DELETE in the field below and the project deletion will be enabled.
                        </h3>
                        <v-text-field label="Type DELETE here" type="text" v-model="fieldSafeWord"></v-text-field>
                    </div>
                </v-window-item>

                <v-window-item :value="2">
                    <div class="pa-4 text-center">
                        <v-icon color="green-lighten-2" icon="mdi-recycle" size="x-large" variant="text"></v-icon>
                        <h3 class="text-h6 font-weight-light mb-2">
                           Project deleted
                        </h3>
                    </div>
                </v-window-item>
            </v-window>

            <v-divider v-if="step === 1"></v-divider>

            <v-card-actions>
                <v-btn v-if="step === 1" color="error" variant="flat" @click.stop="close">
                    Cancel
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn v-if="step === 1" color="primary" variant="flat" @click="deleteProject" :disabled="!typedSafeWord">
                    DELETE
                </v-btn>
                <v-btn v-if="step === 2" color="red" variant="flat" block @click.stop="close">
                    Close
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    props: ['projectId'],
    data: () => ({
        step: 1,
        currentTitle: ['Are you sure?', 'Success'],
        safeWord: 'DELETE',
        dialog: false,
        fieldSafeWord: ''
    }),
    computed: {
        typedSafeWord() {
            return this.safeWord === this.fieldSafeWord
        }
    },
    methods: {
        close() {
            this.dialog = false;
            this.$emit('modalClosed');
        },
        async deleteProject() {
            const files = await this.listProjectFiles();
            await files.forEach(async file => {
                await this.deleteFile(file);
            });
            this.step = 2
            //noveldocs_project_${name}
            //noveldocs_${id}_data
            //noveldocs_${id}_document
            //noveldocs_${id}_chapters
            //noveldocs_${id}_scenes
            //noveldocs_${id}_locations
            //noveldocs_${id}_characters
        },
        async deleteFile(file) {
            let response;
            try{
                response = await gapi.client.drive.files.delete({
                    fileId: file.id
                })
                console.log(`DELETED ${file.name} - ${file.id}`)
                console.log(JSON.stringify(response))
            }catch(err){
                console.log(err.message)
            }
        },
        async listProjectFiles() {
            let response;
            try {
                response = await gapi.client.drive.files.list({
                    "pageSize": 50,
                    "fields": "files(id, name)",
                });
                console.log(JSON.stringify(response))
            }
            catch (err) {
                console.log(err.message)
                return
            }
            const files = response.result.files
            console.log(JSON.stringify(files))
            console.log(this.projectId)
            let project = files.find(file => file.id === this.projectId)
            console.log(JSON.stringify(project))
            let projectFiles = files.filter(file => file.name.includes(`noveldocs_${this.projectId}_`))
            console.log(JSON.stringify(projectFiles))
            projectFiles.push(project)

            if (!files || files.length == 0) {
                console.log("No files found.")
                return
            }
            const output = projectFiles.reduce((str, file) => `${str}${file.name} (${file.id})\n`, "Files:\n");
            console.log(output);
            return projectFiles;
        },
    }
}
</script>