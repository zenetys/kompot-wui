<!-- Barre de filtre -->
<template class="">
    <div>
        <div v-if="!$vuetify.breakpoint.xs" class="d-flex">
            <v-toolbar dense class="elevation-1 blue-grey lighten-5">
                <v-row
                    align="center"
                    no-gutters
                    style="height: 150px;">
                    <v-col cols="12" md="4" lg="3">
                        <v-btn-toggle
                            v-model="toggleFilter"
                            color="white"
                            class="mr-1 mb-1 elevation-2"
                            mandatory
                            @change="setFilterLevel">
                            <v-btn value="critical" active-class="red lighten-1" :title="$t('filters.critical')">
                                <v-icon>mdi-numeric-1-circle-outline</v-icon>
                            </v-btn>
                            <v-btn value="recent" active-class="yellow lighten-4" :title="$t('filters.recent')">
                                <v-icon>mdi-numeric-2-circle-outline</v-icon>
                            </v-btn>
                            <v-btn value="known" active-class="orange darken-4" :title="$t('filters.known')">
                                <v-icon>mdi-numeric-3-circle-outline</v-icon>
                            </v-btn>
                            <v-btn value="all-problems" active-class="orange darken-1" :title="$t('filters.allProblems')">
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
                            clearable>
                            <!-- Help icon -->
                            <template slot="append-outer">
                                <v-icon class="mr-1" :title="$t('helpFilterQueryFormat')">
                                    mdi-help-circle-outline
                                </v-icon>
                            </template>
                        </v-text-field>
                    </v-col>
                    <v-col
                        cols="12" md="4" lg="4"
                        class="text-right" />
                </v-row>
            </v-toolbar>
        </div>
    </div>
</template>

<script>
import { setUserFilterConfig, getUserSessionConfig, deleteUserFilter, updateUserFilter, saveHistoricFilter } from "../plugins/user-session-config";
import i18n from '../plugins/i18n';
export default {
    name: 'FilterBar',
    i18n: i18n,
    data() {
        return {
            filterItems: [],
            toggleFilter: "all",
            selectFilter: "",
            searchInput: null,
            selectedItem: null,
            saveFilterDialog: null,
            updateFilterDialog: null,
            dialogType: null,
            searchBox: null,
            menuProps: { value: false },
            dialog: false,
            filterId: null,
            filterTitle: null,
            filterDescription: null,
            filterContent: null,
            filterLevel: null,
            filterSavingErros: [],
            formValid: true,
            checkedFilter: [],
            setFilterEventTimeout: null,
        }
    },
    watch: {
        searchBox() {
            if (this.setFilterEventTimeout)
                clearTimeout(this.setFilterEventTimeout);
            this.setFilterEventTimeout = setTimeout(() => {
                this.setFilterEvent();
            }, 500);
        },
        checkedFilter() {
            this.searchBox = (this.checkedFilter) ? this.checkedFilter.box : "";
            this.toggleFilter = (this.checkedFilter) ? this.checkedFilter.level : "all";
            this.setFilterEvent();
        },
    },
    mounted() {
        this.toggleFilter = this.$route.query.level;
        this.searchBox = this.$route.query.filter;

        this.filterItems = JSON.parse(getUserSessionConfig()).filters

        document.addEventListener('click', () => {
            this.menuProps.value = false;
        } );
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
        // get level filter
        getLevelPartOfFilter(){
            if (this.toggleFilter) {
                if (this.toggleFilter=="all")
                    return "";
                if (this.toggleFilter=="incident")
                    // return "(( state!=0 AND checks_enabled!=true AND acknowledged!=true ) OR ( _TRACK=1 ))";
                    return "q=///(state!=0 and checks_enabled!=1 and acknowledged!=1)///";
                if (this.toggleFilter=="maintenance")
                    // return "(( state!=0 AND checks_enabled!=true AND acknowledged=true ) OR ( _TRACK=1 ))";
                    return "q=///(state!=0 and checks_enabled!=1 and acknowledged=1)///";
                if (this.toggleFilter=="all-problems")
                    // return "( state=0 ) OR ( _TRACK=1 )";
                    return "q=///(state=0)///";
                if (this.toggleFilter=="inventory")
                    return "";
            }
            return "";

        },
        // get search filter
        getSearchBoxPartOfFilter() {
            var search = new Array();
            if (this.searchBox) {
                var boxArray = this.searchBox.split(' ');
                for (let i = 0; i < boxArray.length; i++) {
                    var searchInfo = boxArray[i].split(':');
                    if (searchInfo.length>1) {
                        if (searchInfo[0]=="d") {
                            search.push('name[regex]='+searchInfo[1]);
                        } else if (searchInfo[0]=="ip"){
                            search.push("device_ip[regex]="+searchInfo[1]);
                        } else if (searchInfo[0]=="i") {
                            search.push("display_name[regex]="+searchInfo[1]);
                        } else if (searchInfo[0]=="o") {
                            search.push("plugin_output[regex]="+searchInfo[1]);
                        } else {
                            search.push(boxArray[i]);
                        }

                    }
                }
                return search.join('&');
            }
            return "";

        },
        setQuery() {
            // level filter
            var level = this.getLevelPartOfFilter();

            // box
            var box = this.getSearchBoxPartOfFilter();

            // filters selected
            var filtersSelected;

            if (this.checkedFilter) {
                if (this.checkedFilter.length!=0) {
                    // filtersSelected = "q=///" + this.checkedFilter.join(" or ") + "///";
                    filtersSelected = this.checkedFilter.content;
                } else {
                    filtersSelected = '';
                }
            } else {
                filtersSelected = ''
            }

            // format the query string
            var querryArray = [];
            (level!='') ? querryArray.push(level) : querryArray;
            (box!='') ? querryArray.push(box) : querryArray;
            (level=='' && box=='' && !filtersSelected) ? querryArray.push("") : querryArray;

            // this.filterContent = querryArray.join(" AND ");
            return querryArray.join("&");
        },
        getKeyCode: function (event) {
            if (event.keyCode === 13) {
                this.menuProps.value = false;
                this.setFilterEvent();
            } else if(event.keyCode === 27) {
                this.menuProps.value = false;
            } else {
                this.menuProps.value = true;
            }
        },
        setFilterLevel() {
            this.setFilterEvent();
        },
        setDialogType(type, item) {
            this.saveFilterDialog = true;
            this.dialogType = type;
            if (type=='update') {
                this.filterId = item.id;
                this.filterTitle = item.title;
                this.filterDescription = item.description;
                this.filterContent = item.content;
            }
        },
        saveHistoricFilter() {
            var historicFilter = {box:this.searchBox, id: Date.now(), title: this.searchBox, type: 'historic'};
            this.saveHistoric(historicFilter);
        },
        saveFilter() {

            if (this.$refs.formFilter.validate()) {
                var filter = {
                    id: Date.now(),
                    title: this.filterTitle,
                    description: this.filterDescription,
                    content: this.getSearchBoxPartOfFilter(),
                    box: this.searchBox,
                    level: this.toggleFilter,
                };
                setUserFilterConfig(filter);
                this.saveFilterDialog = false;
                this.$refs.formFilter.reset();
                this.searchBox = '';
                this.filterItems = JSON.parse(getUserSessionConfig()).filters;
            }
        },
        updateFilter() {
            if (this.$refs.formFilter.validate()) {
                var filter = {
                    id: this.filterId,
                    title: this.filterTitle,
                    description: this.filterDescription,
                    content: this.getSearchBoxPartOfFilter(),
                    box: this.searchBox,
                };
                updateUserFilter(filter);
                this.saveFilterDialog = false;
                this.$refs.formFilter.reset();
                this.searchBox = '';
                this.selectFilter = '';
                this.filterItems = JSON.parse(getUserSessionConfig()).filters;
            }
        },
        deleteFilter(item) {
            var found = this.filterItems.findIndex(data => data.id === item.id);
            deleteUserFilter(item, found);
            this.searchBox = '';
            this.selectFilter = '';
            this.filterItems = JSON.parse(getUserSessionConfig()).filters;
        },
        saveHistoric(historicFilter) {
            // this.filterItems.unshift(historicFilter)
            saveHistoricFilter(historicFilter);
            this.filterItems = JSON.parse(getUserSessionConfig()).filters;
        }
    }
}
</script>

<style lang="scss">
    .v-btn-toggle:not(.v-btn-toggle--dense) .v-btn.v-btn.v-size--default {
        height: 39px !important;
        min-height: 0;
        min-width: 40px;
    }
    .search-box .v-input__append-inner .v-input__icon > .v-icon {
        padding-bottom: 0px;
    }
    .level-box {
        display:contents;
    }
    // combobox list item height
    .v-list--dense .v-list-item, .v-list-item--dense {
        min-height: 24px !important;
    }
</style>
