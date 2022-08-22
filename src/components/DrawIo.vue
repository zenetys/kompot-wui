<template>
    <div>
        <v-row>
            <v-col cols="12">
                <iframe class="frame" :src="getDrawUrl()" frameborder="0" />
            </v-col>
        </v-row>
    </div>
</template>

<script>
export default {
    name: 'Drawio',
    props: {
        url: {
            type: String,
            required: true,
        },
    },
    methods: {
        getDrawUrl() {
            return this.$route.fullPath.split('/drawio/')[1];
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
