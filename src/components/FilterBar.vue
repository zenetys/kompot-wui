<!-- Barre de filtre -->
<template>
    <div>
        <div v-if="!$vuetify.breakpoint.xs">
            <v-toolbar dense class="elevation-1 blue-grey lighten-5">
                <v-row align="center" no-gutters style="height: 150px">
                    <v-col cols="12" md="4" lg="3">
                        <v-btn-toggle
                            v-model="toggleFilter"
                            color="white"
                            class="mr-1 mb-1 elevation-2"
                            mandatory
                            @change="setFilterLevel"
                        >
                            <v-btn value="critical" active-class="red lighten-1" :title="$t('filters.critical')">
                                <v-icon>mdi-numeric-1-circle-outline</v-icon>
                            </v-btn>
                            <v-btn value="recent" active-class="yellow lighten-4" :title="$t('filters.recent')">
                                <v-icon>mdi-numeric-2-circle-outline</v-icon>
                            </v-btn>
                            <v-btn value="known" active-class="orange darken-4" :title="$t('filters.known')">
                                <v-icon>mdi-numeric-3-circle-outline</v-icon>
                            </v-btn>
                            <v-btn
                                value="all-problems"
                                active-class="orange darken-1"
                                :title="$t('filters.allProblems')"
                            >
                                <v-icon>mdi-numeric-4-circle-outline</v-icon>
                            </v-btn>
                            <v-btn value="any" active-class="blue lighten-1" :title="$t('filters.any')">
                                <v-icon>mdi-numeric-5-circle-outline</v-icon>
                            </v-btn>
                        </v-btn-toggle>
                    </v-col>
                    <v-col cols="12" md="4" lg="5">
                        <v-text-field
                            id="id"
                            v-model="searchBox"
                            :label="$t('filterBoxPlaceholder')"
                            solo
                            dense
                            class="mt-6"
                            prepend-inner-icon="mdi-magnify"
                            clearable
                        >
                            <!-- Help icon -->
                            <template slot="append-outer">
                                <v-icon class="mr-1" :title="$t('helpFilterQueryFormat')">
                                    mdi-help-circle-outline
                                </v-icon>
                            </template>
                        </v-text-field>
                    </v-col>
                    <v-col cols="12" md="4" lg="4" class="text-right" />
                </v-row>
            </v-toolbar>
        </div>
    </div>
</template>

<script>
import i18n from '../plugins/i18n';
export default {
    name: 'FilterBar',
    i18n: i18n,
    data() {
        return {
            toggleFilter: 'all',
            searchBox: null,
            setFilterEventTimeout: null,
        };
    },
    watch: {
        searchBox() {
            if (this.setFilterEventTimeout)
                clearTimeout(this.setFilterEventTimeout);
            this.setFilterEventTimeout = setTimeout(() => {
                this.setFilterEvent();
            }, 500);
        },
    },
    mounted() {
        this.toggleFilter = this.$route.query.level;
        this.searchBox = this.$route.query.filter;
    },
    methods: {
        setFilterEvent() {
            this.$emit('set-filter-event', this.setFilter());
        },
        setFilter() {
            return {
                level: this.toggleFilter,
                box: this.searchBox,
            };
        },
        setFilterLevel() {
            this.setFilterEvent();
        },
    },
};
</script>

<style lang="scss">
.v-btn-toggle:not(.v-btn-toggle--dense) .v-btn.v-btn.v-size--default {
    height: 39px !important;
    min-height: 0;
    min-width: 40px;
}
</style>
