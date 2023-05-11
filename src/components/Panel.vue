<template>

<div>

    <FilterBar id="filter-bar" ref="filterBar" @set-filter-event="getFilters" v-if="!$vuetify.breakpoint.smAndDown"></FilterBar>

    <div ref="progressBar" style="height:2px;">
        <v-progress-linear
        v-model="progressValue"
        :active="progressShow"
        :indeterminate="progressQuery"
        :query="true"
        height="2"
        ></v-progress-linear>
    </div>

    <div class="panel-box" ref="panelRow" :style="seletedDetailsView()">

        <div class="send-selected" v-if="this.selected.length>0">
            <ActionButtons :elements="this.selected" @send-data="initializeSelected"> </ActionButtons>
        </div>

        <!-- Go to top of table -->
        <div id="go-to-top" @click="goToTableTop()">
            <v-btn class="mx-2" fab dark small color="blue-grey darken-1">
                <v-icon dark> mdi-chevron-up </v-icon>
            </v-btn>
        </div>

        <v-data-table
            :headers="headers"
            :items="data"
            :show-select="allowSelect()"
            :multi-sort="allowMultiSort()"
            fixed-header
            dense
            ref="table"
            v-model="selected"
            :single-select="false"
            item-key="id"
            :key="anIncreasingNumber"
            @input="selectAllRows($event)"
            @current-items="current = $event"
            @item-selected="multiSelectWithShift"
            grid-lines
            :height="filterBarHeight"
            :item-class="getRowBackgroundClass"
            :no-data-text="$t('noDataText')"
            :search="filters.box"
            :footer-props="{
                'items-per-page-options': [50, 100, 150]
            }"
            :options.sync="options"
            :mobile-breakpoint="0"
        >

            <template v-slot:[`header.data-table-select`]>
                <div class="select-show-column">
                    <v-menu :close-on-content-click="false">
                        <template #activator="{ on: onMenu }">
                            <v-tooltip top>
                                <template #activator="{ on: onTooltip }">
                                    <v-btn icon v-on="{ ...onMenu, ...onTooltip }" height="0" width="0" style="padding: 0 0 0 13px;"> <v-icon size="24">mdi-table</v-icon> </v-btn>
                                </template>

                                <span> Activer / Désactiver les colonnes </span>
                            </v-tooltip>
                        </template>

                        <!-- ...list with menu options... -->
                        <v-card>
                            <v-list>
                                <v-list-item  v-for="(h, index) in headers" :key="index" style="min-height:0px">
                                    <v-list-item-action class="ma-0">
                                        <v-checkbox v-model="h.show" :label="h.label" @change="headerToShow(index)"></v-checkbox>
                                    </v-list-item-action>
                                </v-list-item>
                            </v-list>
                        </v-card>
                    </v-menu>
                </div>
            </template>

            <template v-for="h in headers" v-slot:[`header.${h.value}`]="{ header }">
                <template>
                    <span :title="header.label" :key="h.id">{{header.label}}</span>
                </template>
            </template>

            <template v-for="(h, index) in headers" v-slot:[`item.${h.value}`]="{item}" class="" >
                <div :key="h.id" class="cell pl-1" :class="cellClass(item, h.value, index)" @click="selectOnClick(item)">
                    <span :title="displayRowItem(item, h.value, index)" :class="cellClass(item, h.value, index)"> <v-icon v-if="h.value == 'name'" class="pb-1" size="13" color="black"> {{getIcon(item['info.device_type'])}} </v-icon> {{displayRowItem(item, h.value, index)}} </span>
                    <span v-if="h.value=='state-flag'">
                        <v-icon size="13" :color="setStatusIconColor(item)" :title="$t('stateFlag')">mdi-circle</v-icon>
                        <v-icon
                            @click.stop="onClickGraphIcon(item)"
                            :title="$t('openGraphLabel')"
                            size="13"
                            class="openGraphIcon"
                        >mdi-chart-areaspline-variant</v-icon>
                        <v-icon size="13" :title="$t('recentChange')" v-if="item.auto_track===true">mdi-alert-box-outline</v-icon><v-icon v-else></v-icon>
                        <v-icon size="13" :title="$t('trackLabel')" v-if="item.track===true">mdi-eye</v-icon><v-icon v-else></v-icon>
                        <v-icon size="13" :title="$t('passiveEnabled')" v-if="item.checks_enabled===false">mdi-parking</v-icon><v-icon v-else></v-icon>
                        <v-icon size="13" :title="$t('noAckLabel')" v-if="item.problem_has_been_acknowledged===false"></v-icon><v-icon v-else size="13" :title="$t('ackLabel')">mdi-traffic-cone</v-icon>
                    </span>
                </div>
            </template>
        </v-data-table>

        <InfoPanel :elements="this.openInInfo" @set-info-event="getInfoEvent"></InfoPanel>

    </div>

</div>
</template>

<style lang="scss">

    table {
        width: 100%;
        table-layout: auto;
        position: relative;
    }

    .v-data-table__divider {
        position: relative;
    }

    .v-data-table__divider span {
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

    // Header arrow that define the sort type
    thead .v-data-table__divider .mdi-arrow-up {
        position: absolute;
        right: 12px;
        bottom: 7px;
    }

    // Keep the header to the top
    th {
        position: sticky !important;
    }

    .panel-box {
        position: relative;
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
        -webkit-filter:  grayscale(10%) brightness(95%);
    }

    .v-icon.openGraphIcon { margin-left: 1px; }
    .v-icon.openGraphIcon::after { background-color: transparent; } /* no round background on active */
    .v-icon.openGraphIcon:active { color: #63B5F7; }

</style>



<script>

import axios from 'axios';
import Sortable from "sortablejs";
import FilterBar from './FilterBar';
import InfoPanel from './InfoPanel';
import ActionButtons from './ActionButtons';
import watchClass from '../plugins/watchclass';
import { getRowColor } from '../plugins/status/row-color';
import { getCellColor } from '../plugins/status/cell-color';
import { getIcon } from '../plugins/device-icons';
import i18n from '../plugins/i18n';
import { getHeader } from '../plugins/header';
import resizetable from '../plugins/resizetable'
import * as queryurl from '../plugins/queryurls';

export default {
    i18n: i18n,
    components: {
        FilterBar,
        InfoPanel,
        ActionButtons
    },
    props:{
        api:{
            type: String,
        },
        type_api: {
            type: String,
        },
        id: {
            type:  [Number, String],
        }
    },
    data() {
      return {
        headers: getHeader(this.$props.type_api),
        selected: [],
        openInInfo: [],
        current: [],
        singleSelect: false,
        selectedId: -1,
        bottom: false,
        tempData: [],
        data_by_id_hosts: [],
        data_by_id_services: [],
        data_by_id_final_data: [],
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

        requestLink: this.$props.api,
        languages: ['en', 'fr'],
        shiftKeyOn: false,
        lastRowCheck: null,
        selectedStartIndex: 0,
        selectedEndIndex: 0,
        selectedIndexArray: [],
        showSelectTooltip: false,
        anIncreasingNumber: 1,
        floatingPanel: false,
        filterBarHeight: 0,
        filters: {},

        // status variables
        UP: 2,
        HOST_PENDING: 1,
        HOST_DOWN: 4,
        HOST_UNREACHABLE: 8,
        HARD_STATE: 1,
        SOFT_STATE: 1,

        scrollEnd: false,

      }
    },
    watch: {
        options: {
            handler() {
                this.selected = [];
            },
            deep: true,
        },
        filters() {
            this.$router.push({query: {level: this.filters.level, filter: this.filters.box}}).catch(()=>{});
        },
        loading: function () {
            if (this.loading) {
                document.querySelectorAll('.data-loading').forEach(element => {
                    element.style['display'] = "block";
                });
            } else {
                document.querySelectorAll('.data-loading').forEach(element => {
                    element.style['display'] = "none";
                });
            }
        }
    },
    computed: {
        data: {
            get: function() {
                var returnData = [];
                switch (this.filters.level) {
                    case "critical":
                        returnData = this.tempData.filter( (element) => {
                            if (((element.status != this.UP && element.state_type == this.HARD_STATE && element.problem_has_been_acknowledged==false && element.outage == false) || element.auto_track ) && element.status != this.HOST_PENDING && element.notifications_enabled == true) {
                                return true;
                            }
                            return false;
                        });
                        break;

                    case "recent":
                        returnData = this.tempData.filter( (element) => {
                            if (((element.status != this.UP && element.problem_has_been_acknowledged==false && element.outage == false) || element.auto_track ) && element.status != this.HOST_PENDING && element.notifications_enabled == true) {
                                return true;
                            }
                            return false;
                        });
                    break;

                    case "known":
                        returnData = this.tempData.filter( (element) => {
                            if (((element.status != this.UP && element.outage == false) || element.auto_track ) && element.status != this.HOST_PENDING && element.notifications_enabled == true) {
                                return true;
                            }
                            return false;
                        });
                    break;

                    case "all-problems":
                        returnData = this.tempData.filter( (element) => {
                            if (((element.status != this.UP) || element.auto_track ) && element.status != this.HOST_PENDING && element.notifications_enabled == true) {
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
            set: function() {

            }
        }
    },
    methods: {
        /**
         * Select multilign in the table.
         *
         * @param {object} item: The element which is clicked.
         * @param {boolean} value: Return true if element checkbox is clicked.
         */
        multiSelectWithShift({ item: b, value}) {
            // Get some variable from this element.
            const { selected, current, shiftKeyOn } = this;
            if (value == true && shiftKeyOn) {
                const[a] = selected;
                // Set start and end element's index to select.
                let start = current.findIndex((item) => item.id == a.id);
                let end = current.findIndex((item) => item == b);
                if (start - end > 0) {
                    let temp = start;
                    start = end;
                    end = temp;
                }
                // Add elements in the selected array.
                for (let i = start; i <= end; i++) {
                    selected.push(current[i]);
                }
            }
        },
        selectOnClick: function(item) {
            const { selected } = this;
            var foundIndex = selected.findIndex(element => element == item);
            if (foundIndex==-1) {
                selected.push(item);
            } else {
                selected.splice(foundIndex, 1);
            }
        },
        getInfo(item) {
            (this.openInInfo.length == 0) ? this.openInInfo.push(item) : this.openInInfo = [item];
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
            this.selected = [];
            this.options.page = 1;
            // this.data = [];
            // this.data_by_id = [];
            // this.dataLength = 0;
            // this.fromValue = 0;
            // this.simpleGet();
        },
        // execute after send data to api
        initializeSelected() {
            this.selected = [];
        },
        // active / disable multi sort
        allowMultiSort() {
            return false;
        },
        // to active/disable select checkboxes
        allowSelect()  {
            return true;
        },
        // return state cell color background
        getRowBackgroundClass(item) {
            return getRowColor(this.$props.type_api, item);
        },
        getIcon,
        // return state color for statusIconColor
        setStatusIconColor(item) {
            return getCellColor(this.$props.type_api, item);
        },
        // return row backround color
        displayRowItem(item, attr, index) {
            if (typeof(this.headers[index].render) == 'function') {
                return this.headers[index].render(item[attr], item, this.$props.type_api);
            } else  if (this.headers[index].render == 'state-ext') {
                return "";
            } else {
                if (item[attr]==null) {
                    return "--";
                }
                return item[attr];
            }
        },
        // return cell background
        cellClass(item, attr, index) {
            if (typeof(this.headers[index].shape) == 'function') {
                return this.headers[index].shape(this.$props.type_api, item);
            }
            var returnClass = 'cell-'+this.headers[index].value;
            return returnClass.replace(".", "-");
        },
        // fonction to make header visible or not
        headerToShow(indexField) {
            if (this.headers[indexField].show == false) {
                this.headers[indexField].align = ' d-none';
            } else {
                this.headers[indexField].align = '';
            }
        },
        // function to make all rows selected
        selectAllRows(elements) {
            if (elements.length == this.data.length) {
                for (let i = 0; i < this.data.length; i++) {
                    this.$set(this.data[i], 'selected', true);
                }
            } else if (elements.length == 0) {
                for (let i = 0; i < this.data.length; i++) {
                    this.$set(this.data[i], 'selected', false);
                }
            }

        },
        // function to apply user scroll in the table panel
        infiniteScroll() {
            // console.log('>>> ', this.scrollEnd);
            if (this.scrollEnd)
                return;
            this.scrollEnd = true;

            var scrollDiv = this.$el.querySelector(".v-data-table__wrapper");
            var divOffset = scrollDiv.scrollTop;
            var divVisibleSize = scrollDiv.clientHeight;
            var divTotalSize = scrollDiv.scrollHeight;

            if (divOffset+2*divVisibleSize>divTotalSize) {
                scrollDiv.removeEventListener('scroll', this.infiniteScroll);
                this.fromValue = this.data.length;
                this.simpleGet();
            }
            else
                this.scrollEnd = false;
        },

        // get sort options
        getSortPartOfLink() {
            var sortString = [];
            this.sortFields.field = null;
            this.sortFields.sort = null;
            if(this.options.sortBy) {
                for (let i = 0; i < this.options.sortBy.length; i++) {
                    if(this.options.sortDesc[i]==true) {
                        sortString.push("-"+this.options.sortBy[i]);
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
            // this.fromValue = this.data.length;
            return '&offset='+this.fromValue;
        },
        getLink(host_type="") {

            var defaultLink = this.$props.api;

            if (host_type=="host") {
                defaultLink+="query=hostlist&details=true";
            } else {
                defaultLink+="query=servicelist&details=true";
            }

            // var sortArray = (this.getSortPartOfLink()) ? "sort="+this.getSortPartOfLink() : "";

            // limit and from values
            // var limit = "limit=" + 100 + this.getFromPartOfLink();

            // provisory link
            var link =  defaultLink;
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
            if (element.notifications_enabled == false)
				return 0;
            if (element.display_name!="PING" && element.status==1)
                return 1;
            if (element.display_name=="PING" && element.status==1)
                return 2;
            if (element.display_name!="PING" && element.status==2)
                return 3;
            if (element.display_name=="PING" && element.status==2)
                return 4;
            if (element.display_name!="PING" && element.status==4)
                return 5;
            if (element.display_name=="PING" && element.status==8)
                return 6;
            if (element.display_name!="PING" && element.status==8)
                return 7;
            if (element.display_name=="PING" && element.status==4)
                return 8;
            if (element.display_name!="PING" && element.status==16)
                return 9;
            // return priority_value[status];
        },
        updateFromServer() {

            var data_hosts = [];
            var data_services = [];

            axios.all([
                axios({
                    url: queryurl.OBJECT_HOST_LIST,
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    responseType: 'json'
                }),
                axios({
                    url: queryurl.STATUS_HOST_LIST,
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    responseType: 'json'
                })
            ])
            .then(axios.spread((result1, result2) => {

                // data 2 (status) => source
                // data 1 (object) => target
                var statusData = result2.data.data.hostlist;
                var objectData = result1.data.data.hostlist;

                // merge status data and object data
                for (const key in statusData) {
                    for (const key2 in objectData) {
                        if (statusData[key]['name'] === objectData[key2]['name']) {
                            objectData[key2] = Object.assign(objectData[key2], statusData[key]);
                        }
                    }
                }

                // Nagios loop on return data
                for (const [key, value] of Object.entries(objectData)) {
                    var element = value;
                    var id = key + ":" + "PING";
                    // add priority column
                    var time_indice = element.last_update/new Date();
                    var priority_indice = this.getPriorityIndice(element);
                    var priority = time_indice+priority_indice;
                    var data = {
                        "id": id,
                        'name': element.name,
                        'priority': priority,
                        'problem_has_been_acknowledged': element.problem_has_been_acknowledged,
                        'outage': (element.status==this.HOST_UNREACHABLE) ? true : false,
                        'TYPE': (element.custom_variables) ? element.custom_variables.TYPE : '',
                        'state_type': element.state_type,
                        'auto_track': (element.__AUTOTRACK === "0;" || element.__AUTOTRACK === "1;0") ? false : true,
                        'track': (element.__TRACK === "0;" || element.__TRACK == "1;0") ? false : true,
                    };

                    this.headers.forEach(h => {
                        var elem = h.value.split('.').reduce((obj, i) => { return (typeof(obj)=="undefined"?undefined:obj[i]); }, element);
                        if (typeof(elem) !== "undefined")
                        data[h.value] = elem;
                    });
                    data['display_name'] = "PING";

                    if (typeof(this.data_by_id_hosts[id]) === "undefined") {
                        data_hosts.push(data);
                        this.data_by_id_hosts[id] = data_hosts.length-1;
                    }
                    else {
                        var idx = this.data_by_id_hosts[id];
                        data_hosts[idx] = Object.assign( {}, data_hosts[idx], data);
                    }

                }

            }))
            .catch(()=>{
            });


            axios.all([
                axios({
                    url: queryurl.OBJECT_SERVICE_LIST,
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    responseType: 'json'
                }),
                axios({
                    url: queryurl.STATUS_SERVICE_LIST,
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    responseType: 'json'
                })
            ])
            .then(axios.spread((result1, result2) => {

                // data 2 (status) => source
                // data 1 (object) => target
                var statusData = result2.data.data.servicelist;
                var objectData = result1.data.data.servicelist;

                // merge status data and object data
                // loop on status data
                for (const [key, value] of Object.entries(statusData)) {
                    key;
                    for (let i = 0; i < Object.keys(value).length; i++) {
                        var statusElement = value[Object.keys(value)[i]];

                        // loop on object data
                        for (const [key, value2] of Object.entries(objectData)) {
                            key;
                            for (let j = 0; j < Object.keys(value2).length; j++) {
                                var objectElement = value2[Object.keys(value2)[j]];

                                if (statusElement['host_name'] === objectElement['host_name'] &&
                                    statusElement['description'] === objectElement['description']) {
                                    value2[Object.keys(value2)[j]] = Object.assign(objectElement, statusElement);
                                }
                            }
                        }
                    }
                }

                // Nagios loop on return data
                for (const [key, value] of Object.entries(objectData)) {
                    for (let i = 0; i < Object.keys(value).length; i++) {
                        var element = value[Object.keys(value)[i]];

                        // look for each service parent (host)
                        let foundHostElement = data_hosts.find( hostElement => {
                            return hostElement['name'] == key;
                        });

                        var id = key + ":" + element.description;

                        // add priority column
                        var time_indice = element.last_update/new Date();
                        var priority_indice = this.getPriorityIndice(element);
                        var priority = time_indice+priority_indice;

                        var data2 = {
                            'id': id,
                            'name': element.host_name,
                            'priority': priority,
                            'problem_has_been_acknowledged': element.problem_has_been_acknowledged,
                            'outage': (foundHostElement) ? ((foundHostElement.status==this.HOST_DOWN ||
                                                            foundHostElement.status==this.HOST_UNREACHABLE) ? true : false) : '',
                            'TYPE': (element.custom_variables) ? element.custom_variables.TYPE : '',
                            'state_type': element.state_type,
                            'auto_track': (element.__AUTOTRACK === "0;" || element.__AUTOTRACK === "1;0") ? false : true,
                            'track': (element.__TRACK === "0;" || element.__TRACK == "1;0") ? false : true,
                        };

                        this.headers.forEach(h => {
                            var elem = h.value.split('.').reduce((obj, i) => {
                                return (typeof(obj)=="undefined"?undefined:obj[i]);
                            }, element);
                            if (typeof(elem) !== "undefined")
                                data2[h.value] = elem;
                        });

                        if (typeof(this.data_by_id_services[id]) === "undefined") {
                            data_services.push(data2);
                            this.data_by_id_services[id] = data_services.length-1;
                        }
                        else {
                            var idx = this.data_by_id_services[id];
                            data_services[idx] = Object.assign( {}, data_services[idx], data2);
                        }
                    }
                }

                var concatData = data_hosts.concat(data_services);

                var finalData = [];

                concatData.forEach(element => {
                    var data3 = { 'id': element.id, 'name': element.name };

                    this.headers.forEach(h => {
                        var elem = h.value.split('.').reduce((obj, i) => { return (typeof(obj)=="undefined"?undefined:obj[i]); }, element);
                        if (typeof(elem) !== "undefined")
                        data3[h.value] = elem;
                    });

                    if (typeof(this.data_by_id_final_data[element.id]) === "undefined" ) {
                        finalData.push(data3);
                        this.data_by_id_final_data[element.id] = finalData.length-1;
                    } else {
                        var idx = this.data_by_id_final_data[element.id];
                        finalData[idx] = Object.assign( {}, finalData[idx], data3 );
                    }
                });

                this.tempData = [];
                this.tempData = finalData;

                this.loading = false;
                this.scrollEnd = false;

                if (this.dataLength < this.data.length) {
                    this.dataLength = this.data.length;
                    var scrollDiv = this.$el.querySelector(".v-data-table__wrapper");
                    scrollDiv.addEventListener('scroll', this.infiniteScroll);
                }

            }))
            .catch(() => {
            });
            this.$forceUpdate();
        },

        // send the request
        simpleGet() {
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
                        return setTimeout(this.simpleGet, 2000);
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
            } else if(this.openInInfo.length == 1) {
                // document.querySelector('.info-panel').style['display'] = 'block';
                return 'display:grid;grid-template-columns:80% 20%';
            }
        },
        // function to get the window height minus the filter bar height
        getWindowHeight() {
            let navbarHeight = document.getElementById('navbar') ? document.getElementById('navbar').clientHeight : 0 ;
            if (this.$refs.panelRow) {
                this.filterBarHeight = window.innerHeight - (navbarHeight + this.$refs.filterBar.$el.clientHeight+this.$refs.progressBar.clientHeight+document.getElementsByClassName('v-data-footer')[0].clientHeight);
            }
        },
        goToTableTop() {
            document.querySelector('.v-data-table__wrapper').scrollTop = 0;
            // document.documentElement.scrollTop = 0;
        },
        topButtonDisplay() {
            document.querySelector('.v-data-table__wrapper').addEventListener('scroll', (element)=> {
                if (element.target.scrollTop > 0 ) {
                    document.querySelector('#go-to-top').style.display = "block";
                } else {
                    document.querySelector('#go-to-top').style.display = "none";
                }
            });
        },
        onClickGraphIcon(item) {
            /* this should be in config.json but some refactoring is needed! */
            const GRAPH_URL = './monitoring-graph?device=%device%&indicator=%indicator%';
            const GRAPH_DEVICE_INDICATOR = 'hostcheck';
            const GRAPH_POPUP_OPTIONS = 'directories=no,menubar=no,status=no,location=yes,scrollbars=no,resizable=yes,width=900,height=453';

            const indicator = item.description ?? GRAPH_DEVICE_INDICATOR;
            const name = `${item.name}:${indicator}:graph`;
            const url = GRAPH_URL.replace('%device%', encodeURIComponent(item.name))
                                 .replace('%indicator%', encodeURIComponent(indicator));
            window.open(url, name, GRAPH_POPUP_OPTIONS);
        },
    },
    directives: {
        'sortable-table': {
            inserted: (el, binding) => {
                el.querySelectorAll('th').forEach((draggableEl) => {
                    // Need a class watcher because sorting v-data-table rows asc/desc removes the sortHandle class
                    watchClass(draggableEl, 'sortHandle');
                    draggableEl.classList.add('sortHandle');
                });
                Sortable.create(el.querySelector('tr'), binding.value ? { ...binding.value, handle: '.sortHandle' } : {});
            },
        },
    },
    beforeDestroy () {
        clearInterval(this.progressInterval);
        window.removeEventListener("keydown", this.keyDownHandler);
        window.removeEventListener("keyup", this.keyUpHandler);
    },

    created() {
        const self = this;
        self.keyDownHandler = function ({ key }) {
            if (key == "Shift") self.shiftKeyOn = true;
        };
        self.keyUpHandler = function ({ key }) {
            if (key == "Shift") self.shiftKeyOn = false;
        };
        window.addEventListener("keydown", this.keyDownHandler);
        window.addEventListener("keyup", this.keyUpHandler);

    },
    mounted() {

        this.$nextTick(function() {
            window.addEventListener('resize', this.getWindowHeight);
            this.getWindowHeight();
            this.topButtonDisplay();
            resizetable(document.getElementsByTagName('table').item(0));
        });

        this.simpleGet();

        // document.querySelector('th').style.borderColor = '#ad4444 !important';
        // document.querySelector('th').style.backgroundColor = '#e0e0e0 !important';

    },
  }
</script>
