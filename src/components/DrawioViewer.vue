<template>
    <div>
        <v-row>
            <v-col cols="12">
                <iframe
                    :src="drawioViewUrl"
                    ref="drawioIframe"
                    class="frame"
                    frameborder="0"
                />
            </v-col>
        </v-row>
    </div>
</template>

<script>
export default {
    name: 'DrawioViewer',
    computed: {
        drawioViewUrl() {
            return this.$kConfig.drawioViewUrl.replace('%schema%',
                encodeURIComponent(this.$route.params.schema));
        },
    },
    mounted() {
        this.$ev.$on('kchan.drawio.saved', this.onKChanDrawioSaved);
    },
    destroyed() {
        this.$ev.$off('kchan.drawio.saved', this.onKChanDrawioSaved);
    },
    methods: {
        /**
         * Event handler triggered when a drawio diagram has been saved.
         * Assuming the diagram has changed, try to reload the viewer if
         * the saved diagram matches the active menu item.
         */
        onKChanDrawioSaved(data, ev) {
            if (data?.name === this.$route.params.schema) {
                console.log('DrawioViewer:', data.name, 'change, try reload');
                this.$refs?.drawioIframe?.contentWindow?.location?.reload();
            }
        },
    },
};
</script>

<style lang="scss">
.frame {
    width: 100%;
    height: 92vh;
}
</style>
