<!-- Barre de filtre -->
<template>
    <div>
        <div v-if="!$vuetify.breakpoint.xs">
            <v-toolbar dense class="elevation-1 blue-grey lighten-5">
                <v-row align="center" no-gutters style="height: 150px">
                    <v-col>
                        <v-btn-toggle
                            id="levels"
                            v-model="levelToggle"
                            color="white"
                            class="mr-1 mb-1 mt-1 elevation-1"
                            mandatory
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
                    <v-col>
                        <v-text-field
                            v-model="searchInput"
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
                    <v-col class="text-right">
                        <v-btn
                            outlined
                            :ripple="false"
                            class="z-icon-btn mr-6"
                            :title="$t('cmdRefresh')"
                            @click="$emit('refresh')"
                        >
                            <v-icon>mdi-table-refresh</v-icon>
                        </v-btn>
                    </v-col>
                </v-row>
            </v-toolbar>
        </div>
    </div>
</template>

<script>
import { gotoRoute } from '@/plugins/utils';

export default {
    name: 'FilterBar',
    data() {
        return {
            levelToggle: null,
            searchInput: null,
            setFilterEventTimeout: null,
        };
    },
    watch: {
        '$route.query': {
            immediate: true,
            handler(q) {
                this.levelToggle = q.level; // FIXME: check
                this.searchInput = q.search;
                this.$emit('filter', {
                    level: this.levelToggle,
                    search: this.searchInput,
                });
            },
        },
        levelToggle(level) {
            gotoRoute(this, { query: { level } });
        },
        searchInput(search) {
            if (this.setFilterEventTimeout)
                clearTimeout(this.setFilterEventTimeout);
            /* search is null when the clear icon was clicked, in that
             * case do not temporize */
            this.setFilterEventTimeout = setTimeout(
                () => gotoRoute(this, { query: { search } }),
                search === null ? 0 : 500);
        },
    },
};
</script>

<style lang="scss">
/* levels */
#levels.v-btn-toggle .v-btn.v-btn.v-size--default {
    height: 38px !important;
    min-height: 0;
    width: 38px;
    &:not(.v-btn--active) {
        border-top-color: #bbb !important;
    }
}
/* buttons */
.z-icon-btn.v-btn.v-size--default {
    min-width: 0;
    padding: 0 8px;
    height: 37px;
    margin-bottom: 2px;
    background-color: #f7f7f7;
    border-color: #bbb;
    box-shadow: 0 3px 1px -2px rgb(0 0 0 / 5%),
                0 2px 2px 0 rgb(0 0 0 / 6%),
                0 1px 5px 0 rgb(0 0 0 / 10%);
}
.z-icon-btn.v-btn.v-size--default:active {
    box-shadow: inset 0 0 10px rgb(0 0 0 / 12%);
}

.z-icon-btn.v-btn:hover:before {
    opacity: 0.02;
    border-color: #666;
}
}
</style>
