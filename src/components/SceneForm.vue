<template>
    <v-dialog v-model="dialog" transition="dialog-top-transition" width="auto" persistent @input="handleModalInput">
        <template v-slot:activator="{ props }">
            <v-btn v-bind="props" @click.stop="resetSteps" :color="buttonColor">
                {{ buttonText }}
            </v-btn>
        </template>
        <v-card class="mx-auto" width="500">
            <v-card-title class="text-h6 font-weight-regular justify-space-between">
                <span>{{ currentTitle }}</span>
            </v-card-title>

            <v-window v-model="step">
                <v-window-item :value="1">
                    <v-card-text>
                        <v-text-field label="Name" placeholder="" v-model="sceneName"></v-text-field>
                        <picture-selector label="Select or drop images of the scene here" @filesSelected="handlePictures" ></picture-selector>
                        <iframe v-if="documentPath" :src="documentPath" style="width: 100%; height: 100%" frameborder="0"
                            allowfullscreen></iframe>
                    </v-card-text>
                </v-window-item>
                <v-window-item :value="2">
                    <div class="pa-4 text-center">
                        <v-progress-circular color="blue-lighten-3" indeterminate :size="54"
                            :width="12"></v-progress-circular>
                        <h3 class="text-h6 font-weight-light mb-2">
                            Saving scene
                        </h3>
                        <span class="text-caption text-grey">{{ currentAction }}</span>
                    </div>
                </v-window-item>

                <v-window-item :value="3">
                    <div class="pa-4 text-center">
                        <v-icon color="blue-lighten-2" icon="mdi-thumb-up" size="x-large" variant="text"></v-icon>
                        <h3 class="text-h6 font-weight-light mb-2">
                            Scene saved
                        </h3>
                    </div>
                </v-window-item>
            </v-window>

            <v-divider v-if="step !== 2"></v-divider>

            <v-card-actions v-if="step !== 2">
                <v-btn v-if="step === 1" @click="close">
                    Cancel
                </v-btn>
                <v-spacer v-if="step !== 2"></v-spacer>
                <v-btn v-if="step === 1" variant="flat" @click="createScene">
                    Save
                </v-btn>
                <v-btn v-if="step === 3" @click="close" block>
                    Close
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import UtilsGoogleApi from '@/utils/UtilsGoogleApi.js';
import PictureSelector from '@/components/PictureSelector.vue';

export default {
    components: { PictureSelector },
    props: ['projectJsonFileId', 'buttonIcon', 'buttonText', 'buttonColor', 'sceneId'],
    data: () => ({
        step: 1,
        sceneName: '',
        scenePictures: [],
        sceneCharacters: [],
        sceneLocation: '',
        currentAction: '',
        dialog: false,
        projectId: '',
    }),
    computed: {
        documentPath(){
            if(this.sceneId)
                return 'https://docs.google.com/document/d/1Y-K7jLgMJI5jDaSmY5X_rp-zJ3dDt0ugfhrpleVQIRQ/edit?rm=embedded'
        },
        currentTitle() {
            switch (this.step) {
                case 1: return 'Scene'
                case 2: return 'Processing'
                default: return 'Success'
            }
        },
        isNew(){
            return this.sceneId ? false : true
        },
    },
    methods: {
        handlePictures(e){
            this.scenePictures = e.pictures
            console.log(e.pictures[0].thumbnail)
        },
        close() {
            this.dialog = false;
            this.$emit('modalClosed');
        },
        resetSteps() {
            this.step = 1
            this.sceneName = ''
            this.scenePictures = []
            this.sceneCharacters = []
            this.sceneLocation = ''
            this.currentAction = ''
        },
        async saveScene(){
            if(this.isNew){
                await this.createScene()
            }else{
                await this.updateScene()
            }
        },
        async updateScene() {
        },
        async createScene() {
            this.step++
            this.currentAction = "creating scene"
            console.log(this.currentAction)
            console.log(this.projectJsonFileId)
            try {
                let projectData = await UtilsGoogleApi.getJson(this.projectJsonFileId)

                this.currentAction = "creating scene document"
                const sceneDocument = await UtilsGoogleApi.createDocument(this.sceneName, projectData.scenes.id)
                
                this.currentAction = "saving scene data"
                let content = {
                    name: this.sceneName,
                    pictures: this.scenePictures,
                    document: sceneDocument.id
                }

                const sceneData = await UtilsGoogleApi.createJson(this.sceneName, projectData.scenes.id, content)
                
                this.currentAction = `updating project scene list`
                projectData = await UtilsGoogleApi.getJson(this.projectJsonFileId)
                projectData.scenes.list.push(
                    {
                        name: this.sceneName,
                        thumbnail: this.scenePictures.length > 0 ? this.scenePictures[0].thumbnail : '',
                        file: sceneData.id,
                    }
                )

                console.log('projectData',JSON.stringify(projectData))

                await UtilsGoogleApi.updateJson(this.projectJsonFileId, projectData)

                this.currentAction = "scene created"
                console.log(this.currentAction)
                this.step++
            }
            catch (err) {
                console.error(err);
                this.currentAction = "error creating scene"
                console.log(this.currentAction)
                this.dialog = false
                return;
            }

        },
    }
}
</script>