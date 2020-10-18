<template>
    <v-btn :color="color" :outlined="outlined" @click.stop="dialog = true" :disabled="disabled" :small="small">
        <slot></slot>

        <v-dialog v-model="dialog" max-width="500">
            <v-card elevation="0">
                <v-card-title class="headline">{{ title }}</v-card-title>

                <v-card-text>{{ text }}</v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>

                    <v-btn color="white" text @click="dialog = false">Annuler</v-btn>

                    <v-btn @click.stop="$emit('confirm')" color="error" text @click="dialog = false">Confirmer</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-btn>
</template>

<script>
    export default {
        name: "btn-confirm",
        props: {
            color: {
                type: String,
                default: 'primary'
            },
            title: String,
            text: String,
            outlined: Boolean,
            disabled: Boolean,
            small: Boolean
        },
        data() {
            return {
                dialog: false
            }
        }
    }
</script>

<style lang="scss" scoped>

</style>
