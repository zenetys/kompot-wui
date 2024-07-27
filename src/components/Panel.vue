<template>
    <div>
        <FilterBar
            :is-playing="playOn"
            :page-current="pageSpecs.page || 1"
            :page-count="pageSpecs.pageCount || 1"
            :page-start="pageSpecs.itemsLength ? pageSpecs.pageStart + 1 : 0"
            :page-stop="pageSpecs.pageStop"
            :total-rows="pageSpecs.itemsLength"
            @filter="onFiltersChange"
            @play="onCmdPlay"
            @pause="onCmdPause"
            @refresh="onCmdRefresh"
            @previous="onCmdPagePrevious"
            @next="onCmdPageNext"
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
                :page="pageWanted"
            >
                <template #state_flag="{ item }">
                    <span>
                        <v-icon size="13" class="saturated text" :title="$t('stateFlag')"
                        >mdi-circle</v-icon>
                        <v-icon
                            size="13" class="openGraphIcon" :title="$t('openGraphLabel')"
                            @click.stop="onClickGraphIcon(item)"
                        >mdi-chart-areaspline-variant</v-icon>
                        <v-icon v-if="item.has_auto_track" size="13" :title="$t('recentChange')"
                        >mdi-alert-box-outline</v-icon>
                        <v-icon v-if="item.has_track" size="13" :title="$t('trackLabel')"
                        >mdi-eye</v-icon>
                        <v-icon v-if="item.is_passive_check" size="12" :title="$t('passiveEnabled')"
                        >mdi-parking</v-icon>
                        <v-icon v-if="item.is_acknowledged" size="13" :title="$t('ackLabel')"
                        >mdi-traffic-cone</v-icon>
                        <v-icon v-if="!item.has_notifications_enabled" size="13" :title="$t('disabledNotificationsLabel')"
                        >mdi-bell-off</v-icon>
                    </span>
                </template>
                <template #search_link="{ header, item }">
                    <v-icon v-if="header.value === 'device'" size="13" class="mr-1">
                        {{ getIcon(item.device_type) }}
                    </v-icon>
                    <router-link v-slot="{ navigate, href }" :to="getSearchRoute(item[header.value])" custom>
                        <!-- stop is important to avoid row click event -->
                        <a :href="href" @click.stop="navigate">{{ item[header.value] }}</a>
                    </router-link>
                </template>
                <template #array_links="{ header, item }">
                    <span v-if="item[header.value].length === 0">&mdash;</span>
                    <router-link
                        v-else
                        v-for="(tag, i) in item[header.value]" :key="i"
                        v-slot="{ navigate, href }" :to="getSearchRoute(tag)" custom
                    >
                        <!-- stop is important to avoid row click event -->
                        <a :href="href" @click.stop="navigate">{{ tag }}</a>
                    </router-link>
                </template>
            </AutoTable>
        </div>
    </div>
</template>

<script>
import FilterBar from '@/components/FilterBar.vue';
import ActionButtons from '@/components/ActionButtons.vue';
import { kConfig } from '@/plugins/config.js';
import { apiConfig } from '@/plugins/apis/api-manager';
import { getIcon } from '@/plugins/device-icons';
import i18n from '@/plugins/i18n';
import AutoTable from '@zenetys/ztable';
import { compactFormat, deriveRoute } from '@/plugins/utils';

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

function isObjectEmpty(o) {
    for (const i in o)
        return false;
    return true;
}

const { cmpFloat, cmpInt } = AutoTable.utils;

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
                id: 'kompot-table-events',
                api: '',
                height: 'auto',
                paginated: true,
                hideFooter: true,
                footerProps: { 'items-per-page-options': [ kConfig.perPage ] },
                syncPagination: (specs) => this.onPaginationSync(specs),
                selectable: (...args) => this.onSelectedItems(...args),
                showSelect: true,
                itemClass: (x) => 'status-' + x.status +
                    ' is-hard-state-' + x.is_hard_state +
                    ' has-notifications-enabled-' + x.has_notifications_enabled +
                    ' has-track-' + x.has_track,
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
                        formatText: getStatusText,
                        cssClass: () => 'saturated background border',
                        sortable: (a, b) => cmpInt(a.priority, b.priority),
                        order: 3,
                    },
                    device: {
                        slotName: 'search_link',
                        label: i18n.t('device'),
                        order: 4,
                    },
                    device_address: {
                        slotName: 'search_link',
                        label: i18n.t('ipAddress'),
                        sortable: (a, b) => cmpInt(a.device_address, b.device_address),
                        order: 5,
                    },
                    indicator: {
                        slotName: 'search_link',
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
                    tags: {
                        slotName: 'array_links',
                        label: i18n.t('tags'),
                        order: 8,
                        copyable: false,
                    },
                    last_check: {
                        label: i18n.t('lastCheck'),
                        formatText: compactFormat,
                        sortable: (a, b) => cmpInt(a.last_check, b.last_check),
                        order: 9,
                        copyable: false,
                    },

                    priority: {
                        sortable: (a, b) => cmpFloat(a.priority, b.priority),
                        enabled: false,
                    },
                    groups: {
                        label: i18n.t('groups'),
                        formatText: (v) => v.join(', '),
                        enabled: false,
                    },
                },
                text: {
                    noData: i18n.t('ztableNoData'),
                    loading: i18n.t('ztableLoading'),
                    copied: i18n.t('ztableCopied'),
                    error: i18n.t('ztableError'),
                    noRender: i18n.t('ztableNoRender'),
                },
            },

            selectedItems: {},

            normalizedData: undefined,
            filteredData: [],

            // Progress bar data
            progressValue: 0,
            progressTimer: null,
            playOn: true,
            userExplicitPlayOn: undefined,

            filters: {},
            tableWrapperElement: undefined,
            showGoToTop: false,
            pageSpecs: {},
            pageWanted: 1,

            apiConfig,
        };
    },
    watch: {
        filters: {
            handler(cur, prev) {
                this.handleStateChange(cur !== prev);
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
        playOn: {
            handler(value) {
                if (value)
                    this.restartFetchInterval();
                else
                    this.stopTimer();
            }
        },
        selectedItems: {
            handler(value) {
                if (!isObjectEmpty(value))
                    this.playOn = false;
                else if (this.userExplicitPlayOn !== false)
                    this.playOn = true;
            }
        }
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
        onCmdRefresh() {
            this.restartFetchInterval();
        },
        onCmdPlay() {
            this.playOn = true;
            this.userExplicitPlayOn = this.playOn;
        },
        onCmdPause() {
            this.playOn = false;
            this.userExplicitPlayOn = this.playOn;
        },
        onCmdPagePrevious() {
            this.pageWanted--;
        },
        onCmdPageNext() {
            this.pageWanted++;
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
        onPaginationSync(pageSpecs) {
            this.pageSpecs = pageSpecs;
        },

        getSearchRoute(search) {
            return deriveRoute({ query: { search } }, this.$route);
        },

        getIcon,
        getStatusText,
        isObjectEmpty,
    },
};
</script>

<style lang="scss">
/* ZTable column width constraints */
#kompot-table-events {
    &.sizable {
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

        .col_tags {
            min-width: 80px;
            width: 80px;
            max-width: 150px;
        }

        .col_last_check {
            width: 100px;
            max-width: 100px;
        }
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

    .col_tags a + a {
        margin-left: 5px;
    }

    a {
        color: #00219f;
    }
    a:hover {
        text-decoration: underline;
    }

    tbody {
        .status--1 {
            background-color: #b3e5fc;
            .saturated {
                &.text { color: #80d8ff; }
                &.background { background-color: #80d8ff; }
                &.border { border-color: #7bcff5; }
            }
        }
        .status-0 {
            background-color: #c8e6c9;
            .saturated {
                &.text { color: #4caf50; }
                &.background { background-color: #4caf50; }
                &.border { border-color: #47a34b; }
            }
        }
        .status-1 {
            background-color: #fff59d;
            .saturated {
                &.text { color: #ffc400; }
                &.background { background-color: #ffc400; }
                &.border { border-color: #f2cb00; }
            }
        }
        .status-2 {
            background-color: #ef9a9a;
            .saturated {
                &.text { color: #e53935; }
                &.background { background-color: #e53935; }
                &.border { border-color: #d93632; }
            }
        }
        .status-3 {
            background-color: #ffcc80;
            .saturated {
                &.text { color: #f57c00; }
                &.background { background-color: #f57c00; }
                &.border { border-color: #e87500; }
            }
        }
        .has-track-true {
            background-color: #a2e8d2;
        }
        /* :not(.status--1,.status-0) not working on FF 76 */
        .has-track-true:not(.status--1):not(.status-0) {
            background-color: #add0ff;
        }
        .has-notifications-enabled-false /* increase specificity */[class] {
            background-color: #e0e0e0;
        }
        .is-hard-state-false {
            color: #5d5d5d;
            font-style: italic;
            a {
                color: #3857ce;
            }
        }
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

</style>
