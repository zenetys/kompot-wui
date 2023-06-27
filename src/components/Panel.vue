<template>
    <div>
        <FilterBar
            v-if="!$vuetify.breakpoint.smAndDown"
            @filter="onFiltersChange"
        />

        <v-progress-linear
            v-model="progressValue"
            height="2"
        />

        <div>
            <div v-if="!isObjectEmpty(selectedItems)" class="action-panel">
                <ActionButtons :elements="selectedItems" @sent="onActionSent" />
            </div>

            <!-- Go to top of table -->
            <div v-if="showGoToTop" id="go-to-top" @click="onGoToTopClick()">
                <v-btn class="mx-2" fab dark small color="blue-grey darken-1">
                    <v-icon dark>mdi-chevron-up</v-icon>
                </v-btn>
            </div>

            <AutoTable
                ref="autotable"
                :config="config"
                :search="apiConfig.useZTableSearch ? filters.search : ''"
                :selected-items="selectedItems"
            >
                <template #state_flag="{ item }">
                    <span>
                        <v-icon size="13" :color="getStatusColor(item)" :title="$t('stateFlag')"
                        >mdi-circle</v-icon>
                        <v-icon
                            size="13" class="openGraphIcon" :title="$t('openGraphLabel')"
                            @click.stop="onClickGraphIcon(item)"
                        >mdi-chart-areaspline-variant</v-icon>
                        <v-icon v-if="item.has_auto_track" size="13" :title="$t('recentChange')"
                        >mdi-alert-box-outline</v-icon>
                        <v-icon v-if="item.has_track" size="13" :title="$t('trackLabel')"
                        >mdi-eye</v-icon>
                        <v-icon v-if="item.is_passive_check" size="13" :title="$t('passiveEnabled')"
                        >mdi-parking</v-icon>
                        <v-icon v-if="item.is_acknowledged" size="13" :title="$t('noAckLabel')"
                        >mdi-traffic-cone</v-icon>
                    </span>
                </template>
                <template #device="{ item }">
                    <v-icon size="13">{{ getIcon(item.device_type) }}</v-icon>
                    <span>{{ item.device }}</span>
                </template>
            </AutoTable>
        </div>
    </div>
</template>

<script>
import FilterBar from '@/components/FilterBar.vue';
import ActionButtons from '@/components/ActionButtons.vue';
import { apiConfig } from '@/plugins/apis/api-manager';
import { getIcon } from '@/plugins/device-icons';
import i18n from '@/plugins/i18n';
import AutoTable from '@zenetys/ztable';
import { compactFormat } from '@/plugins/utils';

function getStatusText(status, item) {
    if (item.status === apiConfig.STATUS_PENDING)
        return i18n.t('pending');
    if (item.entry_kind === apiConfig.KIND_DEVICE) {
        switch (item.status) {
            case apiConfig.STATUS_OK: return i18n.t('hostUp');
            case apiConfig.STATUS_CRITICAL: return i18n.t('hostDown');
            case apiConfig.STATUS_UNKNOWN: return i18n.t('hostUnreachable');
        }
    }
    switch (item.status) {
        case apiConfig.STATUS_OK: return i18n.t('serviceOk');
        case apiConfig.STATUS_WARNING: return i18n.t('serviceWarning');
        case apiConfig.STATUS_CRITICAL: return i18n.t('serviceCritical');
    }
    return i18n.t('serviceUnknown');
}

function getStatusColor(item) {
    if (item.status === apiConfig.STATUS_OK)
        return 'green';
    if (item.status === apiConfig.STATUS_PENDING)
        return 'light-blue accent-1';
    if (item.status === apiConfig.STATUS_WARNING)
        return 'yellow accent-4';
    if (item.status === apiConfig.STATUS_CRITICAL)
        return 'red darken-1';
    return 'orange darken-2';
}

function getRowColor(item) {
    if (item.has_notifications_enabled === false)
        return 'grey lighten-1';
    if (item.has_track === true) {
        if (item.status > apiConfig.STATUS_OK)
            return 'blue lighten-4';
        return 'teal lighten-3';
    }
    if (item.status == apiConfig.STATUS_PENDING)
        return 'light-blue accent-1';
    if (item.status == apiConfig.STATUS_OK)
        return 'green lighten-4';
    if (item.status == apiConfig.STATUS_WARNING)
        return 'yellow lighten-4';
    if (item.status == apiConfig.STATUS_CRITICAL)
        return 'red lighten-3';
    return 'orange lighten-3'
}

function isObjectEmpty(o) {
    for (const i in o)
        return false;
    return true;
}

const { cmpInt } = AutoTable.utils;

export default {
    i18n: i18n,
    components: {
        FilterBar,
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
                selectable: (...args) => this.onSelectedItems(...args),
                showSelect: true,
                itemClass: (x) => this.getRowColor(x),
                customHeadersComputation: (headers) => {
                    headers.unshift({ value: 'state_flag' });
                },
                columns: {
                    state_flag: {
                        slotName: 'state_flag',
                        label: '',
                        sortable: false,
                        order: 1,
                        truncable: false,
                        /* Explicitly disable copy icon. Anyway it would not
                         * show-up, since there is no text content here. */
                        copyable: false,
                    },
                    status: {
                        label: i18n.t('state'),
                        formatText: (x, y) => getStatusText(x, y),
                        cssClass: (x) => this.getStatusColor(x),
                        sortable: (a, b) => cmpInt(a.priority, b.priority),
                        order: 3,
                    },
                    device: {
                        slotName: 'device',
                        label: i18n.t('device'),
                        order: 4,
                    },
                    device_address: {
                        label: i18n.t('ipAddress'),
                        sortable: (a, b) => cmpInt(a.device_address, b.device_address),
                        order: 5,
                    },
                    indicator: {
                        label: i18n.t('indicator'),
                        order: 6,
                    },
                    last_state_change: {
                        label: i18n.t('duration'),
                        formatText: compactFormat,
                        sortable: (a, b) => cmpInt(a.last_state_change, b.last_state_change),
                        order: 2,
                        copyable: false,
                    },
                    check_information: {
                        label: i18n.t('output'),
                        order: 7,
                    },
                    last_check: {
                        label: i18n.t('lastCheck'),
                        formatText: compactFormat,
                        sortable: (a, b) => cmpInt(a.last_check, b.last_check),
                        order: 8,
                        copyable: false,
                    },
                }
            },

            selectedItems: {},

            normalizedData: undefined,
            filteredData: [],

            // Progress bar data
            progressValue: 0,
            progressTimer: null,

            filters: {},
            tableWrapperElement: undefined,
            showGoToTop: false,

            apiConfig,
        };
    },
    watch: {
        filters: {
            handler(cur, prev) {
                this.handleStateChange( cur !== prev);
            }
        },
        normalizedData: {
            handler() {
                this.handleStateChange(false);
            }
        },
        filteredData: {
            handler(newData) {
                this.selectedItems = {};
                this.config.api = newData instanceof Error
                    ? Promise.reject(Error(this.$t('dataFetchError')))
                    : Promise.resolve({ data: newData });
            }
        },
    },
    mounted() {
        this.tableWrapperElement = this.$refs.autotable.$el.querySelector('.v-data-table__wrapper');
        if (this.tableWrapperElement)
            this.tableWrapperElement.addEventListener('scroll', this.onTableScroll);
    },
    beforeDestroy() {
        clearInterval(this.progressTimer);
        if (this.tableWrapperElement)
            this.tableWrapperElement.removeEventListener('scroll', this.onTableScroll);
    },
    methods: {
        handleStateChange(filtersHaveChanged) {
            /* The component should preselect a default level, another event should
             * come later. Ignore this one assuming it's an unfinished transition. */
            if (this.filters.level === undefined) {
                console.log('Panel: handleStateChange: this.filters.level === undefined, skip');
                return;
            }
            /* Don't have data yet?
             * Need to fetch it from the server and wait for next run. */
            if (this.normalizedData === undefined) {
                console.log('Panel: handleStateChange: this.normalizedData === undefined, fetch');
                this.restartFetchInterval();
                return;
            }
            /* Case where filtering is done server-side and filters have changed.
             * Need to fetch it from the server and wait for next run. */
            if (filtersHaveChanged && !apiConfig.filterAndSortNormalizedData) {
                console.log('Panel: handleStateChange: filters have changed and filtering is server-side, fetch');
                this.restartFetchInterval();
                return;
            }
            /* Otherwise, rebuild filteredData if API implements it client-side,
             * or pass it through to refresh rendering. */
            console.log('Panel: handleStateChange: update filteredData');
            if (apiConfig.filterAndSortNormalizedData) {
                this.filteredData = this.apiConfig.filterAndSortNormalizedData(this.normalizedData, this.filters);
            }
            else {
                this.filteredData = this.normalizedData;
            }
        },
        stopTimer() {
            clearInterval(this.progressTimer);
            this.progressTimer = null;
        },
        // send the request
        restartFetchInterval() {
            const scheduleNext = () => {
                this.stopTimer();
                this.progressValue = 0;
                if (!this.playOn)
                    return;

                this.progressTimer = setInterval(() => {
                    if (this.progressValue >= 100) {
                        this.progressValue = 0;
                        this.stopTimer();
                        this.restartFetchInterval();
                        return;
                    }
                    this.progressValue += 10;
                }, 1000);
            };

            this.apiConfig.fetchAndNormalizeData(this.filters)
                .then((formattedApiData) => { this.normalizedData = formattedApiData; })
                .catch((error) => { this.normalizedData = error; })
                .finally(() => { scheduleNext(); });
        },

        // filters update notification from filter bar
        onFiltersChange(payload) {
            this.filters = payload;
        },
        onSelectedItems(item, newSelectedItems) {
            this.selectedItems = newSelectedItems;
        },
        onClickGraphIcon(item) {
            apiConfig.getGraph(item).popup();
        },
        onActionSent() {
            this.selectedItems = {};
        },
        onTableScroll(ev) {
            this.showGoToTop = (ev.target.scrollTop > 0);
        },
        onGoToTopClick() {
            if (this.tableWrapperElement)
                this.tableWrapperElement.scrollTop = 0;
        },

        getIcon,
        getStatusText,
        getStatusColor,
        getRowColor,
        isObjectEmpty,
    },
};
</script>

<style lang="scss">
/* ZTable column width constraints */
.sizable {
    /* default */
    .v-data-table__divider {
        width: 4%;
        max-width: 100px;
    }

    /* column specific */
    .col_state_flag {
        width: 75px;
        max-width: 75px;
    }

    .col_last_state_change {
        width: 100px;
        max-width: 100px;
    }

    .col_status {
        width: 130px;
        max-width: 130px;
    }

    .col_device {
        min-width: 140px;
        width: 170px;
        max-width: 240px;
    }

    .col_device_address {
        width: 130px;
        max-width: 160px;
    }

    .col_indicator {
        width: 200px;
        max-width: 230px;
    }

    .col_check_information {
        width: auto;
    }

    .col_last_check {
        width: 100px;
        max-width: 100px;
    }
}

.v-progress-linear {
    transition: none;
}

// Position Action button after select a row
.action-panel {
    position: absolute;
    bottom: 50px;
    right: 57px;
    z-index: 10;
}

#go-to-top {
    position: absolute;
    bottom: 50px;
    right: 0;
    z-index: 10;
}

.v-icon.openGraphIcon {
    margin-left: 1px;
}
.v-icon.openGraphIcon::after {
    /* no round background on active */
    background-color: transparent;
}
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

.col_state_flag .resizeElement {
    display: none;
}

.col_device .v-icon {
    vertical-align: baseline;
    margin-right: 2px;
}
</style>
