<template>
    <iframe :src="url" frameBorder="0" style="border-radius: inherit" allowfullscreen></iframe>
</template>

<script>
    export default {
        name: "MediaPreview",
        props: {
            id: {
                type: String,
                required: true
            }
        },
        computed: {
            url() {
                return 'https://drive.google.com/file/d/' + this.id + '/preview';
            }
        }
    }
</script>

<style scoped>

</style>
