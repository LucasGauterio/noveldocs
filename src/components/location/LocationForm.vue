<template>
    <v-dialog v-model="dialog" transition="dialog-top-transition" width="auto" persistent>
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
                        <v-text-field label="Name" placeholder="" v-model="locationName"></v-text-field>
                        <v-text-field label="Real world location (if exists)" placeholder="https://goo.gl/maps/qzZHdUFYDSLZQf8NA" v-model="locationRealWord"></v-text-field>
                        <picture-selector  label="Select or drop images of the location here" @filesSelected="handlePictures" ></picture-selector>
                        <iframe v-if="documentPath" :src="documentPath" style="width: 100%; height: 100%" frameborder="0"
                            allowfullscreen></iframe>
                    </v-card-text>
                </v-window-item>
                <v-window-item :value="2">
                    <div class="pa-4 text-center">
                        <v-progress-circular color="blue-lighten-3" indeterminate :size="54"
                            :width="12"></v-progress-circular>
                        <h3 class="text-h6 font-weight-light mb-2">
                            Saving location
                        </h3>
                        <span class="text-caption text-grey">{{ currentAction }}</span>
                    </div>
                </v-window-item>

                <v-window-item :value="3">
                    <div class="pa-4 text-center">
                        <v-icon color="blue-lighten-2" icon="mdi-thumb-up" size="x-large" variant="text"></v-icon>
                        <h3 class="text-h6 font-weight-light mb-2">
                            Location saved
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
                <v-btn v-if="step === 1" variant="flat" @click="createLocation">
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
    props: ['projectJsonFileId', 'buttonIcon', 'buttonText', 'buttonColor', 'locationId'],
    emits: ['modalClosed'],
    data: () => ({
        step: 1,
        locationName: '',
        locationRealWord: '',
        locationPictures: [],
        currentAction: '',
        dialog: false,
        projectId: '',
    }),
    computed: {
        documentPath(){
            if(this.locationId)
                return `https://docs.google.com/document/d/${this.sceneId}/edit?rm=embedded`
        },
        currentTitle() {
            switch (this.step) {
                case 1: return 'Location'
                case 2: return 'Processing'
                default: return 'Success'
            }
        },
        isNew(){
            return this.locationId ? false : true
        },
    },
    methods: {
        handlePictures(e){
            this.locationPictures = e.pictures
            console.log(e.pictures[0].thumbnail)
        },
        close() {
            this.dialog = false;
            this.$emit('modalClosed');
        },
        resetSteps() {
            this.step = 1
            this.locationName = ''
            this.locationRealWord = ''
            this.locationPictures = []
            this.currentAction = ''
        },
        async saveLocation(){
            if(this.isNew){
                await this.createLocation()
            }else{
                await this.updateLocation()
            }
        },
        async updateLocation() {
        },
        async createLocation() {
            this.step++
            this.currentAction = "creating location"
            console.log(this.currentAction)
            console.log(this.projectJsonFileId)
            try {
                let projectData = await UtilsGoogleApi.getJson(this.projectJsonFileId)

                this.currentAction = "creating location document"
                const locationDocument = await UtilsGoogleApi.createDocument(this.locationName, projectData.locations.id)
                
                this.currentAction = "saving location data"
                let content = {
                    name: this.locationName,
                    realWorld: this.locationRealWorld,
                    pictures: this.locationPictures,
                    document: locationDocument.id
                }

                const locationData = await UtilsGoogleApi.createJson(this.locationName, projectData.locations.id, content)
                
                this.currentAction = `updating project location list`
                projectData = await UtilsGoogleApi.getJson(this.projectJsonFileId)
                projectData.locations.list.push(
                    {
                        name: this.locationName,
                        thumbnail: this.locationPictures.length > 0 ? this.locationPictures[0].thumbnail : '',
                        file: locationData.id,
                    }
                )

                console.log('projectData',JSON.stringify(projectData))

                await UtilsGoogleApi.updateJson(this.projectJsonFileId, projectData)

                this.currentAction = "location created"
                console.log(this.currentAction)
                this.step++
            }
            catch (err) {
                console.error(err);
                this.currentAction = "error creating location"
                console.log(this.currentAction)
                this.dialog = false
                return;
            }

        },
    }
}
</script>