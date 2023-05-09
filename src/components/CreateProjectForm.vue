<template>
    <v-dialog transition="dialog-top-transition" width="auto">
        <template v-slot:activator="{ props }">
            <v-btn v-bind="props" @click.stop="resetSteps">
                <v-icon>mdi-plus</v-icon>
                Create a new project
            </v-btn>
        </template>
        <template v-slot:default="{ isActive }">
            <v-card class="mx-auto" max-width="500">
                <v-card-title class="text-h6 font-weight-regular justify-space-between">
                    <v-avatar color="primary" size="24" v-text="step"></v-avatar>
                    <span>{{ currentTitle }}</span>
                </v-card-title>

                <v-window v-model="step">
                    <v-window-item :value="1">
                        <v-card-text>
                            <v-text-field label="Project name" placeholder="My book"></v-text-field>
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
                            <v-icon color="blue-lighten-2" icon="mdi-thumb-up" size="x-large" variant="text"></v-icon>
                            <h3 class="text-h6 font-weight-light mb-2">
                                New project created
                            </h3>
                            <span class="text-caption text-grey">It's time to start writing!</span>
                        </div>
                    </v-window-item>
                </v-window>

                <v-divider></v-divider>

                <v-card-actions>
                    <v-btn v-if="step > 1 && step < 4" variant="text" @click="step--">
                        Back
                    </v-btn>
                    <v-spacer v-if="step < 4"></v-spacer>
                    <v-btn v-if="step < 3" color="primary" variant="flat" @click="step++">
                        Next
                    </v-btn>
                    <v-btn v-if="step === 3" color="primary" variant="flat" @click="step++">
                        Done
                    </v-btn>
                    <v-btn v-if="step === 4" color="primary" variant="flat" block>
                        <router-link to="/projects">
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
        </template>
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
    }),

    computed: {
        currentTitle() {
            switch (this.step) {
                case 1: return 'Naming'
                case 2: return 'Description'
                case 3: return 'Goals'
                case 999: return 'Error'
                default: return 'Success'
            }
        },
    },
    methods: {
        resetSteps() {
            this.step=1
            this.projectName=''
            this.description=''
            this.finishWritingDate=''
            this.finishEditingDate=''
            this.finishPublishDate=''
            this.wordCount=0
        },
    }
}
</script>