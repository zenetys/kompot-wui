<template>
    <div>
        <v-row>
            <v-col cols="12">
                <iframe class="frame" :src="this.getDrawUrl()" frameborder="0"></iframe>
            </v-col>
        </v-row>
    </div>
</template>

<style lang="scss">
    .frame {
        width:100%;
        height:92vh;
    }
</style>

<script>
export default {
    name: 'Drawio',
    props: {
        url: {
            type: String,
        },
    },
    methods: {
        getDrawUrl() {
            return this.$route.fullPath.split('/drawio/')[1];
        }
    }
}
</script>