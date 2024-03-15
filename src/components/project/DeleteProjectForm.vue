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
                        <v-progress-circular color="blue-lighten-3" indeterminate :size="54"
                            :width="12"></v-progress-circular>
                        <h3 class="text-h6 font-weight-light mb-2">
                            Deleting project
                        </h3>
                    </div>
                </v-window-item>

                <v-window-item :value="3">
                    <div class="pa-4 text-center">
                        <v-icon color="green-lighten-2" icon="mdi-recycle" size="x-large" variant="text"></v-icon>
                        <h3 class="text-h6 font-weight-light mb-2">
                           Project deleted
                        </h3>
                    </div>
                </v-window-item>
            </v-window>

            <v-divider v-if="step === 1"></v-divider>

            <v-card-actions v-if="step !== 2">
                <v-btn v-if="step === 1" color="error" variant="flat" @click.stop="close">
                    Cancel
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn v-if="step === 1" color="primary" variant="flat" @click="deleteProject" :disabled="!typedSafeWord">
                    DELETE
                </v-btn>
                <v-btn v-if="step === 3" color="red" variant="flat" block @click.stop="close">
                    Close
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import UtilsGoogleApi from '@/utils/UtilsGoogleApi.js';
export default {
    props: ['novelDocs','projectId'],
    emits: ['modalClosed'],
    data: () => ({
        step: 1,
        currentTitle: ['Are you sure?', 'Processing', 'Success'],
        safeWord: 'DELETE',
        dialog: false,
        fieldSafeWord: '',
        BACKEND_API_URL: import.meta.env.VITE_BACKEND_API_URL,
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
            this.step = 2
            /*try{
                await UtilsGoogleApi.deleteFile(this.projectFolderId);
            }catch(err){
                console.error(err)
            }
            const novelDocsData = await UtilsGoogleApi.getJson(this.novelDocsJsonId)
            novelDocsData.projects = novelDocsData.projects.filter(project => project.projectJsonId !== this.projectJsonId)
            console.log('novelDocsData',JSON.stringify(novelDocsData))
            await UtilsGoogleApi.updateJson(this.novelDocsJsonId, novelDocsData)*/
            let index = this.novelDocs.projects.list.findIndex(p => p.id === this.projectId)
            this.novelDocs.projects.list.splice(index, 1)
            await UtilsGoogleApi.putNovelDocs(this.BACKEND_API_URL,this.novelDocs)

            this.step = 3
        },
    }
}
</script>