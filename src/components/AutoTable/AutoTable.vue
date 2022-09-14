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
                <v-list-item
                    v-for="header in orderedHeaders"
                    :key="header.value"
                    class="__column-menu"
                >
                    <v-row>
                        <v-col cols="5" align-self="center">
                            {{ header.text }}
                        </v-col>
                        <v-col cols="2" class="__column-menu--visible-switch">
                            <v-switch
                                v-model="header.visible"
                                dense
                                hide-details
                                @change="
                                    StorageConfigManager.updateStorageColumnOptions(
                                        header,
                                        configId,
                                        'visible'
                                    )
                                "
                            ></v-switch>
                        </v-col>
                        <v-col cols="2" class="__column-menu--width-field">
                            <v-text-field
                                v-model="header.width"
                                :disabled="!header.visible"
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
                                :disabled="
                                    isFirstHeader(header.hid) ||
                                        header.value === '__index'
                                "
                                @click="changeHeaderOrder(header, 'up')"
                            >
                                <v-icon>mdi-arrow-up</v-icon>
                            </v-btn>
                            <v-btn
                                icon
                                x-small
                                color="primary"
                                :disabled="
                                    isLastHeader(header.hid) ||
                                        header.value === '__index'
                                "
                                @click="changeHeaderOrder(header, 'down')"
                            >
                                <v-icon>mdi-arrow-down</v-icon>
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-list-item>
            </v-list>
        </v-menu>

        <!-- DATA TABLE -->
        <v-data-table
            v-if="computedHeaders && formattedTableItems"
            id="auto-table"
            :headers="computedHeaders"
            :items="formattedTableItems"
            class="elevation-2"
            dense
            :item-class="itemClass"
            item-key="__zid"
            :search="search"
            fixed-header
            :height="tableHeight"
            :footer-props="tableFooterProps"
            mobile-breakpoint="0"
        >
            <template
                v-for="header in computedHeaders"
                #[`item.${header.value}`]="{ item }"
            >
                <span
                    v-if="
                        item[header.value] ||
                            item[header.value] === 0 ||
                            header.value === '__index'
                    "
                    :key="header.hid"
                    :class="header.getCellClasses(header, item)"
                    :title="header.getCellContent(header, item).text"
                >
                    <span
                        v-if="
                            header.getCellContent(header, item) && header.getCellContent(header, item).isHtml
                        "
                    >{{ header.getCellContent(header, item).value }}</span>
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
    },
    data() {
        return {
            StorageConfigManager,
            selected: [],
            search: '',
            tableFooterProps: { 'items-per-page-options': [50, 100, 150, -1] },
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
            return this.orderedHeaders.filter((header) => header.visible);
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
            /* HANDLE TABLE HEIGHT */
            /* Calculate the height of the Breadcrumbs component */
            const breadcrumbsElement = document.getElementById('__breadcrumbs');
            const breadcrumbsHeight = breadcrumbsElement
                ? breadcrumbsElement.clientHeight
                : 0;
            /* Calculate the height of the table footer component */
            const footerElements =
                document.getElementsByClassName('v-data-footer');
            const footerHeight =
                footerElements?.length > 0 ? footerElements[0].clientHeight : 0;

            this.tableHeight =
                window.innerHeight - breadcrumbsHeight - footerHeight;

            /* HANDLE COLUMN BUTTON POSITIONNING */
            this.columnButtonClasses =
                window.innerWidth < 900 && this.apiType === 'generic'
                    ? '__column-options-button--offset-top'
                    : '';
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
                const updatedHeader = headers.find(
                    (h) => h.value === header.value
                );
                /* Update header's width in the table */

                updatedHeader.width = header.width;
                this.orderedHeaders = headers;
                /* Save the column options in storage */
                StorageConfigManager.updateStorageColumnOptions(
                    header,
                    this.configId,
                    'width'
                );
            }, 400);
        },
        /**
         * Assess whether a header is the first header in order or not.
         * @param {number} headerId - the id of the header to check
         * @returns {boolean} true if the header is the first header
         */
        isFirstHeader(headerId) {
            // index of 1 instead of 0 because [0] is always the "index" header and is not sortable
            return headerId === this.orderedHeaders[1].hid;
        },
        /**
         * Assess whether a header is the last header in order or not.
         * @param {number} headerId - the id of the header to check
         * @returns {boolean} true if the header is the last header
         */
        isLastHeader(headerId) {
            return (
                headerId ===
                this.orderedHeaders[this.orderedHeaders.length - 1].hid
            );
        },
        /**
         * Move a header in the table order.
         * @param {*} header - the header to move
         * @param {string} direction - the direction of the movement
         */
        changeHeaderOrder(header, direction) {
            const headerPosition = this.orderedHeaders.findIndex(
                (h) => h.hid === header.hid
            );

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
            this.orderedHeaders = swapElementsInArray(
                this.orderedHeaders,
                position1,
                position2
            );

            /* Save the column order in storage */
            StorageConfigManager.saveOrderedHeadersInStorage(
                this.orderedHeaders,
                this.configId
            );
        },
        /**
         * Toggle the active color class of the column config button.
         */
        toggleActiveClass() {
            if (
                this.$refs['options-button']?.$el.classList.value.includes(
                    '__column-options-button--active'
                )
            ) {
                this.$refs['options-button'].$el.classList.remove(
                    '__column-options-button--active'
                );
            } else {
                this.$refs['options-button']?.$el.classList.add(
                    '__column-options-button--active'
                );
            }
        },
        /**
         * Remove the active color class from the column config button.
         */
        removeActiveClass() {
            this.$refs['options-button']?.$el.classList.remove(
                '__column-options-button--active'
            );
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
</style>
