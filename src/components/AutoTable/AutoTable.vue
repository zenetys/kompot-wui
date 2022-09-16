<template>
    <div id="__table-container">
        <!-- COLUMN OPTIONS MENU -->
        <v-menu
            v-if="orderedHeaders && formattedTableItems"
            offset-y
            transition="slide-y-transition"
            :close-on-content-click="false"
            min-width="400"
        >
            <template #activator="{ on: menu, attrs }">
                <v-tooltip bottom>
                    <template #activator="{ on: tooltip }">
                        <v-btn
                            v-bind="attrs"
                            id="__column-options-button"
                            ref="options-button"
                            v-click-outside="removeActiveClass"
                            elevation="0"
                            absolute
                            small
                            icon
                            :class="columnButtonClasses"
                            v-on="{ ...tooltip, ...menu }"
                            @click="toggleActiveClass"
                        >
                            <v-icon>mdi-application-cog</v-icon>
                        </v-btn>
                    </template>
                    <span>Open columns settings</span>
                </v-tooltip>
            </template>
            <v-list dense>
                <v-list-item>
                    <v-row>
                        <v-col cols="5">
                            <strong>Column</strong>
                        </v-col>
                        <v-col cols="2">
                            <strong>Visible</strong>
                        </v-col>
                        <v-col cols="2" class="text-center">
                            <strong>Width</strong>
                        </v-col>
                        <v-col cols="3" class="text-center">
                            <strong>Position</strong>
                        </v-col>
                    </v-row>
                </v-list-item>
                <v-divider></v-divider>
                <v-list-item v-for="header in orderedHeaders" :key="header.value" class="__column-menu">
                    <v-row>
                        <v-col cols="5" align-self="center">
                            {{ header.text }}
                        </v-col>
                        <v-col cols="2" class="__column-menu--visible-switch">
                            <v-switch
                                v-model="header.show"
                                dense
                                hide-details
                                @change="StorageConfigManager.updateStorageColumnOptions(header, configId, 'show')"
                            ></v-switch>
                        </v-col>
                        <v-col cols="2" class="__column-menu--width-field">
                            <v-text-field
                                v-model="header.width"
                                :disabled="!header.show"
                                dense
                                hide-details
                                @input="saveUpdatedWidth(header)"
                            ></v-text-field>
                        </v-col>
                        <v-col cols="3" class="__column-menu--order-buttons">
                            <v-btn
                                icon
                                x-small
                                color="primary"
                                :disabled="isFirstHeader(header.hid) || header.value === '__index'"
                                @click="changeHeaderOrder(header, 'up')"
                            >
                                <v-icon>mdi-arrow-up</v-icon>
                            </v-btn>
                            <v-btn
                                icon
                                x-small
                                color="primary"
                                :disabled="isLastHeader(header.hid) || header.value === '__index'"
                                @click="changeHeaderOrder(header, 'down')"
                            >
                                <v-icon>mdi-arrow-down</v-icon>
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-list-item>
            </v-list>
        </v-menu>

        <!-- VUETIFY DATA TABLE -->
        <v-data-table
            v-if="computedHeaders && formattedTableItems"
            id="auto-table"
            :value="selectedItems"
            :headers="computedHeaders"
            :items="formattedTableItems"
            class="elevation-2"
            dense
            :item-class="itemClass"
            :item-key="itemKey"
            :search="search"
            fixed-header
            :height="tableHeight"
            :footer-props="tableOptions?.footerProps"
            :mobile-breakpoint="tableOptions?.mobileBreakpoint"
            :show-select="tableOptions?.showSelect"
            :single-select="tableOptions?.singleSelect"
            v-bind="tableOptions?.vDataTableProps"
            :multi-sort="tableOptions?.multiSort"
            @input="handleItemSelect"
        >
            <template v-for="header in computedHeaders" #[`item.${header.value}`]="{ item }">
                <span
                    :key="header.hid"
                    :class="header.getCellClasses(header, item)"
                    :title="header.getCellContent(header, item).text"
                    @click="handleItemClick(item)"
                >
                    <template v-if="header.getCellContent(header, item) && header.getCellContent(header, item).isHtml">
                        <slot name="custom-item" v-bind="{ header, item }"></slot>
                    </template>
                    <span v-else>
                        {{ header.getCellContent(header, item).value }}
                    </span>
                </span>
            </template>
        </v-data-table>
    </div>
</template>

<script>
import StorageConfigManager from './storageConfigManager';
import { VDataTable } from 'vuetify/lib';
import { swapElementsInArray } from '@/plugins/utils';

export default {
    name: 'AutoTable',
    components: {
        VDataTable,
    },
    props: {
        /**
         * @prop {Boolean} offsetColumnsButton - If true, the column options button will be offset to the top.
         */
        offsetColumnsButton: {
            type: Boolean,
            default: false,
        },
        /**
         * @prop {Array} selectedItems - Array of items to select in the table
         */
        selectedItems: {
            type: Array,
            default: () => [],
        },
        /**
         * @prop {string} items - the table items to display
         */
        items: {
            type: Array,
            default: () => [],
        },
        /**
         * @prop {Array} headers - the table headers to display
         */
        headers: {
            type: Array,
            default: () => [],
        },
        /**
         * @prop {string} apiType - the type of api the data comes from
         * Can be 'generic' for any generic JSON data object, or specific APIs data types like 'navitia', etc.
         */
        apiType: {
            type: String,
            default: 'generic',
        },
        /**
         * @prop {string} headersUrl - the URL to get designated headers from
         */
        headersUrl: {
            type: String,
            default: null,
        },
        /**
         * @prop {string} configId - the ID of the current data config to use when saving column options modifications in local storage
         */
        configId: {
            type: String,
            default: null,
        },
        /**
         * @prop {string} itemClass - a class or function to apply / call on each item in the table
         */
        itemClass: {
            type: [String, Function],
            default: '',
        },
        /**
         * @prop {number} offsetTop - The height of the page's top element to offset the table's height by
         */
        offsetTop: {
            type: Number,
            default: 0,
        },
        /**
         * @prop {string} itemKey - the key to use as table items' unique identifiers
         */
        itemKey: {
            type: String,
            default: '__zid',
        },
        /**
         * @prop {string} search - the search query to filter the table items by
         */
        search: {
            type: String,
            default: '',
        },
        /**
         * @prop {object} tableOptions - An object used to pass custom options
         * and event callbacks to Vuetify's v-data-table component.
         * @property {object} footerProps - custom options to the table's footer.
         * @property {number} mobileBreakpoint - the breakpoint at which the table will switch to mobile mode.
         * @property {boolean} showSelect - whether to show the select column or not.
         * @property {boolean} singleSelect - whether to allow only one item to be selected at a time.
         * @property {boolean} multiSort - whether to allow multiple columns to be sorted at a time.
         * @property {object} handlers - an object containing event callbacks : ["handleItemClick", "handleItemSelect"].
         * @property {object} vDataTableProps - additional props to add to the vuetify component using v-bind.
         */
        tableOptions: {
            type: Object,
            default: () => ({
                footerProps: {
                    itemsPerPageOptions: [50, 100, 150, -1],
                },
                showSelect: false,
                singleSelect: false,
                mobileBreakpoint: 0,
            }),
        },
    },
    data() {
        return {
            StorageConfigManager,
            tableHeight: null,
            inputTimeout: null,
            orderedHeaders: [],
            columnButtonClasses: '',
        };
    },
    computed: {
        /**
         * Format the table items to display in the table
         * @computed
         * @returns {Array<{__zid: number, [key: string]: any}>} the formatted table items to display in the table
         */
        formattedTableItems() {
            return this.items?.map((item, index) => {
                if (typeof item === 'object') {
                    return {
                        ...item,
                        __zid: index,
                    };
                } else {
                    /* If the data is an array of simple values (like strings or numbers),
                     just create data items with the indexes and values as properties */
                    return {
                        index,
                        value: item,
                        __zid: index,
                    };
                }
            });
        },
        /**
         * Filter the table headers to only display the selected headers
         * @computed
         * @returns {Array} the filtered table headers to display in the table
         */
        computedHeaders() {
            return this.orderedHeaders.filter((header) => header.show);
        },
    },
    watch: {
        headers: {
            handler(newHeaders) {
                if (newHeaders) {
                    this.orderedHeaders = [...newHeaders];
                }
            },
            immediate: true,
        },
    },
    created() {
        window.addEventListener('resize', this.handleWindowResize);
    },
    mounted() {
        this.handleWindowResize();
    },
    updated() {
        this.handleWindowResize();
    },
    destroyed() {
        window.removeEventListener('resize', this.handleWindowResize);
    },
    methods: {
        /**
         * Calculate the height of the table
         */
        handleWindowResize() {
            /* Calculate the height of the table footer component */
            const footerElements = document.getElementsByClassName('v-data-footer');
            const footerHeight = footerElements?.length > 0 ? footerElements[0].clientHeight : 0;
            this.tableHeight = window.innerHeight - (this.offsetTop + footerHeight);

            /* HANDLE COLUMN BUTTON POSITIONNING */
            this.columnButtonClasses =
                this.offsetColumnsButton || (window.innerWidth < 900 && this.apiType === 'generic')
                    ? '__column-options-button--offset-top'
                    : '';
        },
        /**
         * Handle the selection of item(s) in the table via their checkbox,
         * with an optional custom callback from the tableOptions prop
         * @param {array} newSelected - the updated selected items from the table
         */
        handleItemSelect(newSelected) {
            if (this.tableOptions?.handlers?.handleItemSelect) {
                this.tableOptions.handlers.handleItemSelect(newSelected);
            }
        },
        /**
         * Handle the click event on a table row with an optional
         * custom callback from the tableOptions prop
         * @param {object} item - the clicked item
         */
        handleItemClick(item) {
            if (this.tableOptions?.handlers?.handleItemClick) {
                this.tableOptions.handlers.handleItemClick(item);
            }
        },
        /**
         * Update the width of a table header and save its config in local storage
         */
        saveUpdatedWidth(header) {
            if (this.inputTimeout) {
                clearTimeout(this.inputTimeout);
            }

            this.inputTimeout = setTimeout(() => {
                const headers = [...this.headers];
                const updatedHeader = headers.find((h) => h.hid === header.hid);
                /* Update header's width in the table */

                updatedHeader.width = header.width;
                this.orderedHeaders = headers;
                /* Save the column options in storage */
                StorageConfigManager.updateStorageColumnOptions(header, this.configId, 'width');
            }, 400);
        },
        /**
         * Assess whether a header is the first header in order or not.
         * @param {number} headerId - the id of the header to check
         * @returns {boolean} true if the header is the first header
         */
        isFirstHeader(headerId) {
            // index of 1 instead of 0 because [0] is always the "index" header and is not sortable
            return headerId === this.orderedHeaders[0].hid;
        },
        /**
         * Assess whether a header is the last header in order or not.
         * @param {number} headerId - the id of the header to check
         * @returns {boolean} true if the header is the last header
         */
        isLastHeader(headerId) {
            return headerId === this.orderedHeaders[this.orderedHeaders.length - 1].hid;
        },
        /**
         * Move a header in the table order.
         * @param {*} header - the header to move
         * @param {string} direction - the direction of the movement
         */
        changeHeaderOrder(header, direction) {
            const headerPosition = this.orderedHeaders.findIndex((h) => h.hid === header.hid);

            if (direction === 'up') {
                this.swapHeadersPositions(headerPosition, headerPosition - 1);
            } else {
                this.swapHeadersPositions(headerPosition, headerPosition + 1);
            }
        },
        /**
         * Swap two headers positions in the table order and save the config in local storage.
         * @param {number} position1 - the position of the first header
         * @param {number} position2 - the position of the second header
         */
        swapHeadersPositions(position1, position2) {
            this.orderedHeaders = swapElementsInArray(this.orderedHeaders, position1, position2);

            /* Save the column order in storage */
            StorageConfigManager.saveOrderedHeadersInStorage(this.orderedHeaders, this.configId);
        },
        /**
         * Toggle the active color class of the column config button.
         */
        toggleActiveClass() {
            if (this.$refs['options-button']?.$el.classList.value.includes('__column-options-button--active')) {
                this.$refs['options-button'].$el.classList.remove('__column-options-button--active');
            } else {
                this.$refs['options-button']?.$el.classList.add('__column-options-button--active');
            }
        },
        /**
         * Remove the active color class from the column config button.
         */
        removeActiveClass() {
            this.$refs['options-button']?.$el.classList.remove('__column-options-button--active');
        },
    },
};
</script>

<style lang="scss">
#__table-container {
    position: relative;
}

#__column-options-button {
    z-index: 7;
    right: 8px;

    &.theme--light.v-btn:focus:before {
        opacity: 0 !important;
    }
}

.__column-options-button--active {
    color: #1976d2 !important;
}

.__column-options-button--offset-top {
    top: -37px;
}

.v-data-table-header th {
    white-space: nowrap;
}

.v-data-footer {
    margin-right: 0 !important;
}

.__column-menu {
    .col {
        padding: 6px 12px;

        .v-input--switch {
            margin-top: 0;
        }
    }
}

.__column-menu--width-field input {
    text-align: center;
}

.__column-menu--order-buttons {
    display: flex;
    justify-content: center;
}

.v-data-table {
    tbody {
        // Transparent color on hover each table tr
        tr:hover:not(.v-data-table__expanded__content) {
            filter: grayscale(10%) brightness(95%);
            -webkit-filter: grayscale(10%) brightness(95%);
        }

        .v-data-table__divider {
            position: relative;

            span {
                position: absolute;
                top: 1px;
                left: 0;
                right: 0;
                bottom: 0;
                padding: 5px 5px 5px 5px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }
    }
}

.__settings-btn {
    bottom: 2vh !important;
    left: 2vw !important;
}

thead th span {
    position: absolute;
    top: 1;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 5px 5px 5px 5px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

thead .v-data-table__divider .mdi-arrow-up {
    border-radius: 50%;
    background: #1976d2;
    color: white !important;
    position: absolute;
    right: 12px;
    bottom: 7px;
}
</style>
