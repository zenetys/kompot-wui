<template>
    <div>
        <FilterBar
            v-if="!$vuetify.breakpoint.smAndDown"
            id="filter-bar"
            ref="filterBar"
            @set-filter-event="getFilters"
        />

        <div ref="progressBar" style="height: 2px">
            <v-progress-linear
                v-model="progressValue"
                :active="progressShow"
                :indeterminate="progressQuery"
                :query="true"
                height="2"
            />
        </div>

        <div ref="panelRow" class="panel-box" :style="seletedDetailsView()">
            <div v-if="selectedItems.length > 0" class="send-selected">
                <ActionButtons :elements="selectedItems" @send-data="initializeSelected" />
            </div>

            <!-- Go to top of table -->
            <div id="go-to-top" @click="goToTableTop()">
                <v-btn class="mx-2" fab dark small color="blue-grey darken-1">
                    <v-icon dark> mdi-chevron-up </v-icon>
                </v-btn>
            </div>

            <AutoTable
                :config="config"
                :search="filters.box"
                :tableOptions="tableOptions"
                :selectedItems="selectedItems"
            >
                <template #state_flag="{ item }">
                    <span>
                        <v-icon size="13" :color="setStatusIconColor(item)" :title="$t('stateFlag')">mdi-circle</v-icon>
                        <v-icon
                            :title="$t('openGraphLabel')"
                            size="13"
                            class="openGraphIcon"
                            @click.stop="onClickGraphIcon(item)"
                        >mdi-chart-areaspline-variant</v-icon>
                        <v-icon v-if="item.auto_track === true" size="13" :title="$t('recentChange')"
                        >mdi-alert-box-outline</v-icon>
                        <v-icon v-else />
                        <v-icon v-if="item.track === true" size="13" :title="$t('trackLabel')">mdi-eye</v-icon
                        ><v-icon v-else />
                        <v-icon v-if="item.checks_enabled === false" size="13" :title="$t('passiveEnabled')"
                        >mdi-parking</v-icon>
                        <v-icon v-else />
                        <v-icon
                            v-if="item.problem_has_been_acknowledged === false"
                            size="13"
                            :title="$t('noAckLabel')"
                        /><v-icon v-else size="13" :title="$t('ackLabel')">mdi-traffic-cone</v-icon>
                    </span>
                </template>
            </AutoTable>
            <InfoPanel :elements="openInInfo" @set-info-event="getInfoEvent" />
        </div>
    </div>
</template>

<script>
import { fetchAndFormatData, getStatusTexts, apiConfig } from '@/plugins/apis/api-manager';
import FilterBar from '@/components/FilterBar.vue';
import InfoPanel from '@/components/InfoPanel.vue';
import ActionButtons from '@/components/ActionButtons.vue';
import { getRowColor } from '@/plugins/status/row-color';
import { getCellColor } from '@/plugins/status/cell-color';
import { getIcon } from '@/plugins/device-icons';
import i18n from '@/plugins/i18n';
import { getHeaders } from '@/plugins/header';
import AutoTable from '@zenetys/ztable';
import { compactFormat, frenchFormat } from '@/plugins/utils';

const getStateText = (status, item) => {
    // HOST
    if (status == 2) return i18n.t('hostUp');
    if (status == 4 && item.display_name == 'PING') return i18n.t('hostDown');
    if (status == 4 && item.display_name != 'PING') return i18n.t('serviceWarning');
    if (status == 8 && item.display_name == 'PING') return i18n.t('hostUnreachable');
    if (item.status == 8 && item.display_name != 'PING') {
        return i18n.t('serviceUnknown');
    }
    if (status == 1) return i18n.t('pending');
    if (status == 16) return i18n.t('serviceCritical');
}

export default {
    i18n: i18n,
    components: {
        FilterBar,
        InfoPanel,
        ActionButtons,
        AutoTable,
    },
    data() {
        return {
            config: {
                id: 'table-network',
                api: '',
                height: 'auto',
                paginated: false,
                clickable: (item) => {
                    this.selectOnClick(item);
                },
                itemClass: this.getRowBackgroundClass,
                customHeadersComputation: (headers) => {
                    headers.unshift({ value: 'state_flag' });
                },
                columns: {
                    state_flag: {
                        slotName: 'state_flag',
                        label: '',
                        sortable: false,
                        enabled: true,
                        order: 1,
                    },
                    status: {
                        label: 'Etat',
                        enabled: true,
                        formatText: getStateText,
                        cssClass: this.setStatusIconColor,
                        order: 2,
                    },
                    name: {
                        label: 'Equipement',
                        enabled: true,
                        order: 3,
                    },
                    address: {
                        label: 'Adresse IP',
                        //align: ' d-none',
                        enabled: true,
                        order: 4,
                    },
                    display_name: {
                        label: 'Indicateur',
                        enabled: true,
                        order: 5,
                    },
                    priority: {
                        label: 'Priorite',
                        enabled: false,
                    },
                    description: {
                        label: 'Description',
                        enabled: false,
                    },
                    last_state_change: {
                        label: 'Dernier changement',
                        enabled: true,
                        formatText: frenchFormat,
                        order: 6,
                    },
                    last_check: {
                        label: 'Durée',
                        enabled: true,
                        formatText: compactFormat,
                        order: 7,
                    },
                    plugin_output: {
                        label: 'Sortie',
                        enabled: true,
                        order: 8,
                    },

                    id: {
                        enabled: false,
                    },
                    TYPE: {
                        enabled: false,
                    },
                    notifications_enabled: {
                        label: 'notificationsEnabled',
                        enabled: false,
                    },
                    check_type: {
                        label: 'checkType',
                        enabled: false,
                    },
                    accept_passive_checks: {
                        label: 'passiveEnabled',
                        enabled: false,
                    },
                    checks_enabled: {
                        label: 'checksEnabled',
                        enabled: false,
                    },
                    problem_has_been_acknowledged: {
                        label: 'ack',
                        enabled: false,
                    },
                    outage: {
                        label: 'outage',
                        enabled: false,
                    },
                    state_type: {
                        label: 'stateType',
                        enabled: false,
                    },
                    auto_track: {
                        label:'autoTrack',
                        enabled: false,
                    },
                    track: {
                        label: 'track',
                        enabled: false,
                    },
                }
            },
            selectedItems: [],
            openInInfo: [],
            singleSelect: false,
            selectedId: -1,
            bottom: false,
            tempData: [],
            sortFields: { field: null, sort: null },
            tab: [],
            loading: true,
            options: {},
            dataLength: 0,
            fromValue: 0,

            // Progress bar data
            progressValue: 100,
            progressQuery: false,
            progressShow: true,
            progressInterval: 0,

            languages: ['en', 'fr'],
            shiftKeyOn: false,
            lastRowCheck: null,
            selectedStartIndex: 0,
            selectedEndIndex: 0,
            selectedIndexArray: [],
            showSelectTooltip: false,
            anIncreasingNumber: 1,
            floatingPanel: false,
            filters: {},

            // status variables
            statusTexts: null,
            UP: this.statusTexts?.UP,
            HOST_PENDING: this.statusTexts?.HOST_PENDING,
            HOST_DOWN: this.statusTexts?.HOST_DOWN,
            HOST_UNREACHABLE: this.statusTexts?.HOST_UNREACHABLE,
            HARD_STATE: this.statusTexts?.HARD_STATE,
            SOFT_STATE: this.statusTexts?.SOFT_STATE,

            scrollEnd: false,
            tableTopOffset: 0,
            /**
             * An object used to pass custom options to the AutoTable component.
             */
            tableOptions: {
                showSelect: true,
                singleSelect: false,
                footerProps: {
                    itemsPerPageOptions: [50, 100, 150, -1],
                },
                mobileBreakpoint: 0,
                handlers: {
                    handleItemSelect: (item) => { this.selectOnClick(item) },
                },
                vDataTableProps: {
                    noDataText: this.$t('noDataText'),
                    'options.sync': this.options,
                },
            },
            apiConfig,
        };
    },
    computed: {
        customSlots() {
            const slots = [];

            this.headers.forEach((header) => {
                this.formattedItems.forEach((item) => {
                    if (header.getCellContent(header, item)?.html) {
                        slots.push({
                            name: `item.${header.value}`,
                            content: header.getCellContent(header, item).value,
                        });
                    }
                });
            });

            return slots;
        },
        /**
         * Returns the computed headers for the AutoTable component, with a custom cell formatting callback.
         * @returns {Array}
         */
        headers() {
            return getHeaders(apiConfig?.apiType);
        },
        filterBarHeight() {
            return this.$refs?.filterBar?.clientHeight || this.$refs?.filterBar?.$el.clientHeight;
        },
        progressBarHeight() {
            return this.$refs?.progressBar?.clientHeight || this.$refs?.progressBar?.$el.clientHeight;
        },
        formattedItems: {
            get: function () {
                var returnData = [];
                switch (this.filters.level) {
                    case 'critical':
                        returnData = this.tempData.filter((element) => {
                            if (
                                ((element.status != this.UP &&
                                    element.state_type == this.HARD_STATE &&
                                    element.problem_has_been_acknowledged == false &&
                                    element.outage == false) ||
                                    element.auto_track) &&
                                element.status != this.HOST_PENDING &&
                                element.notifications_enabled == true
                            ) {
                                return true;
                            }
                            return false;
                        });
                        break;

                    case 'recent':
                        returnData = this.tempData.filter((element) => {
                            if (
                                ((element.status != this.UP &&
                                    element.problem_has_been_acknowledged == false &&
                                    element.outage == false) ||
                                    element.auto_track) &&
                                element.status != this.HOST_PENDING &&
                                element.notifications_enabled == true
                            ) {
                                return true;
                            }
                            return false;
                        });
                        break;

                    case 'known':
                        returnData = this.tempData.filter((element) => {
                            if (
                                ((element.status != this.UP && element.outage == false) || element.auto_track) &&
                                element.status != this.HOST_PENDING &&
                                element.notifications_enabled == true
                            ) {
                                return true;
                            }
                            return false;
                        });
                        break;

                    case 'all-problems':
                        returnData = this.tempData.filter((element) => {
                            if (
                                (element.status != this.UP || element.auto_track) &&
                                element.status != this.HOST_PENDING &&
                                element.notifications_enabled == true
                            ) {
                                return true;
                            }
                            return false;
                        });
                        break;

                    default:
                        returnData = this.tempData;
                        break;
                }
                return returnData.sort((a, b) => {
                    if (a.priority < b.priority) {
                        return 1;
                    }
                    if (a.priority > b.priority) {
                        return -1;
                    }
                    // a must be equal to b
                    return 0;
                });
            },
            set: function () {},
        },
    },
    watch: {
        formattedItems: {
            handler(data) {
                const promise = new Promise((resolve)=>{
                    const res = {
                        data
                    }
                    resolve(res);
                });
                this.config = { ...this.config, api: promise };
            },
            immediate: true
        },
        options: {
            handler() {
                this.selectedItems = [];
            },
            deep: true,
        },
        filters: {
            handler(filters) {
                this.$router
                    .push({
                        query: {
                            level: filters.level,
                            filter: filters.box,
                        },
                    })
                    .catch(() => {});
            }
        },
        loading: function () {
            if (this.loading) {
                document.querySelectorAll('.data-loading').forEach((element) => {
                    element.style['display'] = 'block';
                });
            } else {
                document.querySelectorAll('.data-loading').forEach((element) => {
                    element.style['display'] = 'none';
                });
            }
        },
        apiConfig: {
            immediate: true,
            handler(newConfig) {
                if (newConfig.apiType) {
                    this.startFetchInterval();
                    this.statusTexts = getStatusTexts(this.apiType);
                }
            }
        },
    },
    beforeDestroy() {
        clearInterval(this.progressInterval);
        window.removeEventListener('keydown', this.keyDownHandler);
        window.removeEventListener('keyup', this.keyUpHandler);
    },

    created() {
        const self = this;
        self.keyDownHandler = function ({ key }) {
            if (key == 'Shift') self.shiftKeyOn = true;
        };
        self.keyUpHandler = function ({ key }) {
            if (key == 'Shift') self.shiftKeyOn = false;
        };
        window.addEventListener('keydown', this.keyDownHandler);
        window.addEventListener('keyup', this.keyUpHandler);
    },
    mounted() {
        const navBarHeight = document.getElementById('navbar').clientHeight;
        this.tableTopOffset = navBarHeight + this.progressBarHeight + this.filterBarHeight + 2;
        this.topButtonDisplay();
    },
    methods: {
        /**
         * Select or deselect a table item on row click
         * @param {Object} item the item to select
         */
        selectOnClick(item) {
            const foundIndex = this.selectedItems.findIndex((found) => found === item.id);

            if (foundIndex === -1) {
                this.selectedItems.push(item.id);
            } else {
                this.selectedItems.splice(foundIndex, 1);
            }
        },
        /**
         * Update the selected items array on an item checkbox click
         * @param {Array} newSelectedItems the up-to-date selected items
         */
        updateSelectedItems(newSelectedItems) {
            this.selectedItems = newSelectedItems;
        },
        getInfo(item) {
            this.openInInfo.length == 0 ? this.openInInfo.push(item) : (this.openInInfo = [item]);
        },
        getInfoEvent(payload) {
            if (payload.elements == 0) {
                this.openInInfo = [];
            }
            this.seletedDetailsView();
        },
        // get all filters from filter bar
        getFilters(payload) {
            this.filters = payload;
            this.selectedItems = [];
            this.options.page = 1;
            // this.formattedItems = [];
            // this.data_by_id = [];
            // this.dataLength = 0;
            // this.fromValue = 0;
            // this.startFetchInterval();
        },
        // execute after send data to api
        initializeSelected() {
            this.selectedItems = [];
        },
        // active / disable multi sort
        allowMultiSort() {
            return false;
        },
        // to active/disable select checkboxes
        allowSelect() {
            return true;
        },
        // return state cell color background
        getRowBackgroundClass(item) {
            return getRowColor(apiConfig?.apiType, item);
        },
        getIcon,
        // return state color for statusIconColor
        setStatusIconColor(item) {
            return getCellColor(apiConfig?.apiType, item);
        },
        // return cell background
        cellClass(item, attr, index) {
            if (typeof this.headers[index].shape == 'function') {
                return this.headers[index].shape(apiConfig?.apiType, item);
            }
            var returnClass = 'cell-' + this.headers[index].value;
            return returnClass.replace('.', '-');
        },
        /** @TODO deprecated, to remove */
        // // fonction to make header visible or not
        // headerToShow(indexField) {
        //     if (this.headers[indexField].show == false) {
        //         this.headers[indexField].align = ' d-none';
        //     } else {
        //         this.headers[indexField].align = '';
        //     }
        // },
        // function to make all rows selected
        /** @TODO deprecated, to remove */
        // selectAllRows(elements) {
        //     if (elements.length == this.formattedItems.length) {
        //         for (let i = 0; i < this.formattedItems.length; i++) {
        //             this.$set(this.formattedItems[i], 'selected', true);
        //         }
        //     } else if (elements.length == 0) {
        //         for (let i = 0; i < this.formattedItems.length; i++) {
        //             this.$set(this.formattedItems[i], 'selected', false);
        //         }
        //     }
        // },
        // function to apply user scroll in the table panel
        infiniteScroll() {
            // console.log('>>> ', this.scrollEnd);
            if (this.scrollEnd) return;
            this.scrollEnd = true;

            var scrollDiv = this.$el.querySelector('.v-data-table__wrapper');
            var divOffset = scrollDiv.scrollTop;
            var divVisibleSize = scrollDiv.clientHeight;
            var divTotalSize = scrollDiv.scrollHeight;

            if (divOffset + 2 * divVisibleSize > divTotalSize) {
                scrollDiv.removeEventListener('scroll', this.infiniteScroll);
                this.fromValue = this.formattedItems.length;
                this.startFetchInterval();
            } else this.scrollEnd = false;
        },

        // get sort options
        getSortPartOfLink() {
            var sortString = [];
            this.sortFields.field = null;
            this.sortFields.sort = null;
            if (this.options.sortBy) {
                for (let i = 0; i < this.options.sortBy.length; i++) {
                    if (this.options.sortDesc[i] == true) {
                        sortString.push('-' + this.options.sortBy[i]);
                        this.sortFields.field = this.options.sortBy[i];
                        this.sortFields.sort = true;
                    } else {
                        sortString.push(this.options.sortBy[i]);
                        this.sortFields.field = this.options.sortBy[i];
                        this.sortFields.sort = false;
                    }
                }
                return sortString.join(',');
            }
            return null;
        },
        // get from number for the request
        getFromPartOfLink() {
            // this.fromValue = this.formattedItems.length;
            return '&offset=' + this.fromValue;
        },
        getLink(host_type = '') {
            var defaultLink = this.$props.api;

            if (host_type == 'host') {
                defaultLink += 'query=hostlist&details=true';
            } else {
                defaultLink += 'query=servicelist&details=true';
            }

            // var sortArray = (this.getSortPartOfLink()) ? "sort="+this.getSortPartOfLink() : "";

            // limit and from values
            // var limit = "limit=" + 100 + this.getFromPartOfLink();

            // provisory link
            var link = defaultLink;
            // + "?" +
            // sortArray + "&" +
            // limit + "&" +
            // this.filters;

            // format filters
            // if (host_type=="services" && this.filters.search("name")!=-1 && this.filters.search("_name")==-1) {
            //     return link.replace("name", "host_name");
            // }
            return link;
        },
        getPriorityIndice(element) {
            if (element.notifications_enabled == false) return 0;
            if (element.display_name != 'PING' && element.status == 1) return 1;
            if (element.display_name == 'PING' && element.status == 1) return 2;
            if (element.display_name != 'PING' && element.status == 2) return 3;
            if (element.display_name == 'PING' && element.status == 2) return 4;
            if (element.display_name != 'PING' && element.status == 4) return 5;
            if (element.display_name == 'PING' && element.status == 8) return 6;
            if (element.display_name != 'PING' && element.status == 8) return 7;
            if (element.display_name == 'PING' && element.status == 4) return 8;
            if (element.display_name != 'PING' && element.status == 16) return 9;
            // return priority_value[status];
        },
        updateFromServer() {
            // Fetch all data from API
            fetchAndFormatData(this.headers).then(formattedApiData => {
                this.tempData = formattedApiData;

                this.loading = false;
                this.scrollEnd = false;

                if (this.dataLength < this.formattedItems.length) {
                    this.dataLength = this.formattedItems.length;
                    const scrollDiv = this.$el.querySelector('.v-data-table__wrapper');
                    scrollDiv.addEventListener('scroll', this.infiniteScroll);
                }
            }).catch(() => {
                this.loading = false;
                this.scrollEnd = false;
            });
            this.$forceUpdate();
        },

        // send the request
        startFetchInterval() {
            this.progressQuery = true;
            this.progressShow = true;
            this.progressValue = 0;
            clearInterval(this.progressInterval);

            this.loading = true;

            this.updateFromServer();

            this.progressQuery = false;
            this.progressInterval = setInterval(() => {
                if (this.progressValue === 100) {
                    clearInterval(this.progressInterval);
                    this.progressShow = true;
                    return setTimeout(this.startFetchInterval, 2000);
                }
                this.progressValue += 10;
            }, 1000);
        },
        // reorder the headers keys
        sortTheHeadersAndUpdateTheKey(evt) {
            const headersTmp = this.headers;
            const oldIndex = evt.oldIndex - 1;
            const newIndex = evt.newIndex - 1;
            if (newIndex >= headersTmp.length) {
                let k = newIndex - headersTmp.length + 1;
                while (k--) {
                    headersTmp.push(undefined);
                }
            }
            headersTmp.splice(newIndex, 0, headersTmp.splice(oldIndex, 1)[0]);
            this.table = headersTmp;
            this.anIncreasingNumber += 1;
        },
        // function to manage panel grid to show/hide info panel
        seletedDetailsView() {
            if (this.openInInfo.length == 0) {
                return 'display:grid;grid-template-columns:100%';
            } else if (this.openInInfo.length == 1) {
                return 'display:grid;grid-template-columns:80% 20%';
            }
        },
        goToTableTop() {
            document.querySelector('.v-data-table__wrapper').scrollTop = 0;
        },
        topButtonDisplay() {
            document.querySelector('.v-data-table__wrapper').addEventListener('scroll', (element) => {
                if (element.target.scrollTop > 0) {
                    document.querySelector('#go-to-top').style.display = 'block';
                } else {
                    document.querySelector('#go-to-top').style.display = 'none';
                }
            });
        },
        onClickGraphIcon(item) {
            /* this should be in config.json but some refactoring is needed! */
            const GRAPH_URL = './monitoring-graph?device=%device%&indicator=%indicator%';
            const GRAPH_DEVICE_INDICATOR = 'hostcheck';
            const GRAPH_POPUP_OPTIONS =
                'directories=no,menubar=no,status=no,location=yes,scrollbars=no,resizable=yes,width=900,height=453';

            const indicator = item.description ?? GRAPH_DEVICE_INDICATOR;
            const name = `${item.name}:${indicator}:graph`;
            const url = GRAPH_URL.replace('%device%', encodeURIComponent(item.name)).replace(
                '%indicator%',
                encodeURIComponent(indicator)
            );
            window.open(url, name, GRAPH_POPUP_OPTIONS);
        },
    },
};
</script>

<style lang="scss">
table {
    width: 100%;
    table-layout: auto;
    position: relative;
}

.panel-box {
    position: relative;
}

/* ZTable personnalizable column width */
.sizable {
    /* default max column width */
    .v-data-table__divider {
        max-width: 100px;
    }

    /* column specific constraints */
    .col_state_flag {
        width: 75px;
    }

    .col_status,
    .col_name {
        max-width: 130px;
        width: 130px;
    }

    .col_display_name,
    .col_last_state_change {
        max-width: 65px;
    }

    .col_last_check {
        width: 50px;
    }

    .col_plugin_output {
        width: 450px;
        max-width: 500px;
    }

}

// Position Action button after select a row
.send-selected {
    position: absolute;
    bottom: 50px;
    right: 50px;
    z-index: 10;
}

#go-to-top {
    position: absolute;
    bottom: 50px;
    right: 0;
    display: none;
    z-index: 10;
}

// Color on hover each table tr
.v-data-table tbody tr:hover:not(.v-data-table__expanded__content) {
    filter: grayscale(10%) brightness(95%);
    -webkit-filter: grayscale(10%) brightness(95%);
}

.v-icon.openGraphIcon {
    margin-left: 1px;
}
.v-icon.openGraphIcon::after {
    background-color: transparent;
} /* no round background on active */
.v-icon.openGraphIcon:active {
    color: #63b5f7;
}

th[data-col-name="data-table-select"],
td[data-col-name="data-table-select"] {
    width: 25px !important;
    max-width: 25px !important;
}
td[data-col-name="data-table-select"] input {
    vertical-align: middle;
    position: relative;
    top: -0.5px;
}
/* make columns not resizable, this option is not available in ztable */
.col_data-table-select .resizeElement {
    display: none;
}
.sizable .col_address {
    width: 130px;
    max-width: 130px;
}
.sizable .col_display_name {
    width: 150px;
    max-width: 150px;
}

.sizable .col_last_state_change {
    width: 150px;
    max-width: 150px;
}

.sizable .col_last_check {
    width: 100px;
    max-width: 100px;
}
.sizable .col_status {
    width: 100px;
    max-width: 100px;
}
</style>
