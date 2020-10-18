import Vue from "vue";

Vue.mixin({
    computed: {
        window() {
            return window;
        }
    },
    methods: {
        reach(url) {
            if (this.$route.path !== url)
                this.$router.push(url);
        }
    }
});

