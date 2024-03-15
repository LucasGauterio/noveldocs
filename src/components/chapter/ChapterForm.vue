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
                        <v-text-field label="Order" placeholder="1" type="number" v-model="chapterOrder"></v-text-field>
                        <v-text-field label="Title" placeholder="The beginning" v-model="chapterTitle"></v-text-field>
                        
                        <character-selector label="Featured characters" :characters="allCharacters" @charactersSelected="handleSelectedCharacters"></character-selector>
                        <scene-selector label="Featured scenes" :scenes="allScenes" @scenesSelected="handleSelectedScenes"></scene-selector>
                        <location-selector label="Featured locations" :locations="allLocations" @locationsSelected="handleSelectedLocations"></location-selector>
                        
                    </v-card-text>
                </v-window-item>
                <v-window-item :value="2">
                    <div class="pa-4 text-center">
                        <v-progress-circular color="blue-lighten-3" indeterminate :size="54"
                            :width="12"></v-progress-circular>
                        <h3 class="text-h6 font-weight-light mb-2">
                            Saving chapter
                        </h3>
                        <span class="text-caption text-grey">{{ currentAction }}</span>
                    </div>
                </v-window-item>

                <v-window-item :value="3">
                    <div class="pa-4 text-center">
                        <v-icon color="blue-lighten-2" icon="mdi-thumb-up" size="x-large" variant="text"></v-icon>
                        <h3 class="text-h6 font-weight-light mb-2">
                            Chapter saved
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
                <v-btn v-if="step === 1" variant="flat" @click="saveChapter">
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
import CharacterSelector from '@/components/character/CharacterSelector.vue';
import SceneSelector from '@/components/scene/SceneSelector.vue';
import LocationSelector from '@/components/location/LocationSelector.vue';
export default {
    props: ['projectId', 'novelDocs', 'buttonIcon', 'buttonText', 'chapterId', 'buttonColor'],
    emits: ['modalClosed'],
    components: { CharacterSelector, SceneSelector, LocationSelector },
    data: () => ({
        step: 1,
        chapterOrder: '',
        chapterTitle: '',
        chapterCharacters: [],
        chapterScenes: [],
        chapterLocations: [],
        dialog: false,
        allCharacters: [],
        allScenes: [],
        allLocations: [],
        BACKEND_API_URL: import.meta.env.VITE_BACKEND_API_URL,
    }),

    computed: {
        documentPath(){
            if(this.chapterId)
                return `https://docs.google.com/document/d/${this.chapterId}/edit?rm=embedded`
        },
        currentTitle() {
            switch (this.step) {
                case 1: return 'Chapter'
                case 2: return 'Processing'
                default: return 'Success'
            }
        },
        isNew() {
            return this.chapterId ? false : true
        },
    },
    async mounted(){
        //let projectData = await UtilsGoogleApi.getJson(this.projectJsonFileId)
        console.log(this.novelDocs)
        let projectData = this.novelDocs.projects.list.find( p => { 
            console.log(p.id)
            console.log(this.projectId)
            return p.id == this.projectId
        })
        console.log(projectData)
        this.allCharacters = projectData.characters.list
        this.allScenes = projectData.scenes.list
        this.allLocations = projectData.locations.list
    }
    ,
    methods: {
        handleSelectedCharacters(e){
            this.chapterCharacters = e.characters
        },
        handleSelectedCharacters(e){
            this.chapterScenes = e.scenes
        },
        handleSelectedLocations(e){
            this.chapterLocations = e.locations
        },
        close() {
            this.dialog = false;
            this.$emit('modalClosed');
        },
        resetSteps() {
            this.step = 1
            this.chapterOrder = null
            this.chapterTitle = ''
            this.chapterCharacters = []
            this.chapterScenes = []
            this.chapterLocations = []
        },
        async saveChapter() {
            if (this.isNew) {
                await this.createChapter()
            } else {
                await this.updateChapter()
            }
        },
        async updateChapter() {
        },
        async createChapter() {
            this.step++
            this.currentAction = "creating chapter"

            //console.log(this.currentAction)
            //console.log(this.projectJsonFileId)

            try {
                console.log(this.novelDocs)
                let projectData = this.novelDocs.projects.list.find( p => { 
                    return p.id == this.projectId
                })
                console.log(projectData)
                let content = {
                    chapterOrder: this.chapterOrder,
                    title: this.chapterTitle,
                    scenes: this.chapterScenes,
                    characters: this.chapterCharacters,
                    locations: this.chapterLocations,
                    document: ""
                }
                projectData.chapters.list.push(content)
                this.currentAction = "saving chapter"
                console.log(this.novelDocs)
                await UtilsGoogleApi.putNovelDocs(this.novelDocs)
                this.currentAction = "chapter saved"

                /*let projectData = await UtilsGoogleApi.getJson(this.projectJsonFileId)

                this.currentAction = "creating chapter document"
                const chapterDocument = await UtilsGoogleApi.createDocument(this.chapterTitle, projectData.chapters.id)

                this.currentAction = "saving chapter data"
                let content = {
                    order: this.chapterOrder,
                    title: this.chapterTitle,
                    scenes: this.chapterScenes,
                    characters: this.chapterCharacters,
                    locations: this.chapterLocations,
                    document: chapterDocument.id
                }

                const chapterData = await UtilsGoogleApi.createJson(this.chapterTitle, projectData.chapters.id, content)

                this.currentAction = `updating project chapter list`
                projectData = await UtilsGoogleApi.getJson(this.projectJsonFileId)
                projectData.chapters.list.push(
                    {
                        order: this.chapterOrder,
                        title: this.chapterTitle,
                        file: chapterData.id,
                    }
                )

                console.log('projectData', JSON.stringify(projectData))

                await UtilsGoogleApi.updateJson(this.projectJsonFileId, projectData)

                this.currentAction = "chapter created"
                console.log(this.currentAction)*/
                this.step++
            }
            catch (err) {
                console.error(err);
                this.currentAction = "error creating chapter"
                console.log(this.currentAction)
                this.dialog = false
                return;
            }

        },
    }
}
</script>