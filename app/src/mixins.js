import Vue from "vue";

Vue.mixin({
    methods: {
        reach(url) {
            if (this.$route.path !== url)
                this.$router.push(url);
        }
    }
});

