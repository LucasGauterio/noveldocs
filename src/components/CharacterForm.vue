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
                        <v-text-field label="Name" placeholder="Anne Watson" v-model="characterName"></v-text-field>
                        <v-text-field label="Nickname" placeholder="Anne" v-model="characterNickname"></v-text-field>
                        <v-text-field label="Birthdate" type="date" v-model="characterBirthdate" ></v-text-field>
                        <v-text-field label="Photo" v-model="characterPhoto" type="url"></v-text-field>
                        <iframe v-if="documentPath" :src="documentPath" style="width: 100%; height: 100%" frameborder="0"
                            allowfullscreen></iframe>
                    </v-card-text>
                </v-window-item>
                <v-window-item :value="2">
                    <div class="pa-4 text-center">
                        <v-progress-circular color="blue-lighten-3" indeterminate :size="54"
                            :width="12"></v-progress-circular>
                        <h3 class="text-h6 font-weight-light mb-2">
                            Saving character
                        </h3>
                        <span class="text-caption text-grey">{{ currentAction }}</span>
                    </div>
                </v-window-item>

                <v-window-item :value="3">
                    <div class="pa-4 text-center">
                        <v-icon color="blue-lighten-2" icon="mdi-thumb-up" size="x-large" variant="text"></v-icon>
                        <h3 class="text-h6 font-weight-light mb-2">
                            Character saved
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
                <v-btn v-if="step === 1" variant="flat" @click="createCharacter">
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
export default {
    props: ['projectJsonFileId', 'buttonIcon', 'buttonText', 'buttonColor', 'characterId'],
    emits: ['modalClosed'],
    data: () => ({
        step: 1,
        characterName: '',
        characterNickname: '',
        characterBirthdate: '',
        characterPhoto: '',
        currentAction: '',
        dialog: false,
        projectId: '',
    }),
    computed: {
        documentPath(){
            if(this.characterId)
                return 'https://docs.google.com/document/d/1Y-K7jLgMJI5jDaSmY5X_rp-zJ3dDt0ugfhrpleVQIRQ/edit?rm=embedded'
        },
        currentTitle() {
            switch (this.step) {
                case 1: return 'Character'
                case 2: return 'Processing'
                default: return 'Success'
            }
        },
        isNew(){
            return this.characterId ? false : true
        },
    },
    methods: {
        close() {
            this.dialog = false;
            this.$emit('modalClosed');
        },
        resetSteps() {
            this.step = 1
            this.characterName = ''
            this.characterNickname = ''
            this.characterBirthdate = ''
            this.characterPhoto = ''
            this.currentAction = ''
        },
        async saveCharacter(){
            if(this.isNew){
                await this.createCharacter()
            }else{
                await this.updateCharacter()
            }
        },
        async updateCharacter() {
        },
        async createCharacter() {
            this.step++
            this.currentAction = "creating character"
            console.log(this.currentAction)
            console.log(this.projectJsonFileId)
            try {
                let projectData = await UtilsGoogleApi.getJson(this.projectJsonFileId)

                this.currentAction = "creating character document"
                const characterDocument = await UtilsGoogleApi.createDocument(this.characterName, projectData.characters.id)
                
                this.currentAction = "saving character data"
                let content = {
                    name: this.characterName,
                    nickname: this.characterNickname,
                    birthdate: this.characterBirthdate,
                    photo: this.characterPhoto,
                    document: characterDocument.id
                }

                const characterData = await UtilsGoogleApi.createJson(this.characterName, projectData.characters.id, content)
                
                this.currentAction = `updating project character list`
                projectData = await UtilsGoogleApi.getJson(this.projectJsonFileId)
                projectData.characters.list.push(
                    {
                        name: this.characterName,
                        thumbnail: this.characterPhoto,
                        file: characterData.id,
                    }
                )

                console.log('projectData',JSON.stringify(projectData))

                await UtilsGoogleApi.updateJson(this.projectJsonFileId, projectData)

                this.currentAction = "character created"
                console.log(this.currentAction)
                this.step++
            }
            catch (err) {
                console.error(err);
                this.currentAction = "error creating character"
                console.log(this.currentAction)
                this.dialog = false
                return;
            }

        },
    }
}
</script>