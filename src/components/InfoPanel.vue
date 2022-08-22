<template>
    <div v-if="elements.length==1" class="info-panel" style="z-index:30;">
        <v-card
            outlined :height="panelInfoHeight" style="overflow:hidden;"
            class="info-panel-card px-1">
            <!-- Icon and device name -->
            <div class="pl-1 elevation-2" style="display:grid;grid-template-columns: 30% 70%;margin-bottom:10px;z-index: 30;background-color: #ffffff;">
                <v-btn
                    icon class="ml-3" style="position:absolute;right:0;top:0;z-index:32;"
                    @click="setInfoEvent()">
                    <v-icon size="17">
                        mdi-close-circle
                    </v-icon>
                </v-btn>
                <div style="margin-top: 5px;">
                    <v-icon :color="getColor(elements[0])" size="70">
                        {{ getElementIcon(elements[0]["info.device_type"]) }}
                    </v-icon>
                </div>
                <div class="three-dots">
                    <span style="font-size:30px;" :title="elements[0].name.split('.')[0]"> {{ elements[0].name.split('.')[0] }} </span>
                    <!-- <p style="margin-bottom: 0px;"> <v-chip x-small label> {{elements[0]["device_ip"]}} </v-chip> </p>  -->
                    <p style="margin-bottom: 0px;">
                        <v-chip x-small label>
                            {{ elements[0]["_SITE"] }}
                        </v-chip>
                    </p>
                </div>
            </div>


            <!-- Other information -->
            <div>
                <v-divider />
                <div>
                    <table>
                        <tbody>
                            <tr>
                                <td>
                                    <v-chip x-small label>
                                        Output
                                    </v-chip>
                                </td>
                                <td>
                                    <div class="text-caption three-dots" style="width:300px;" :title="elements[0]['plugin_output']">
                                        {{ elements[0]["plugin_output"] }}
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <v-chip x-small label>
                                        Sla
                                    </v-chip>
                                </td>
                                <td>
                                    <div class="text-caption three-dots" style="width:300px;">
                                        {{ elements[0]["info.sla"] }}
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <v-chip x-small label>
                                        Email
                                    </v-chip>
                                </td>
                                <td>
                                    <div class="text-caption three-dots" style="width:300px;">
                                        {{ elements[0]["info.contact_email"] }}
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <v-chip x-small label>
                                        Phone
                                    </v-chip>
                                </td>
                                <td>
                                    <div class="text-caption three-dots" style="width:300px;">
                                        {{ elements[0]["info.contact_phone"] }}
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <v-divider />

            <!-- Indicator information -->
            <div style="overflow-y:scroll;height:250px;">
                <v-alert
                    v-for="item in data"
                    :key="item._id" outlined
                    :color="getColor(item)"
                    :if="item.indicator!=null"
                    class="elevation-1 mb-1 pa-2"
                    tile
                    text>
                    <div class="title three-dots">
                        <!-- indicator -->
                        {{ item.display_name }} 
                    </div>
                    <span class="" :title="item.plugin_output"> {{ item.plugin_output }}  </span>
                </v-alert>
            </div>
        </v-card>
    </div>
</template>

<script>

import axios from 'axios';
import { getCellColor } from '../plugins/status/cell-color'
import { getIcon } from "../plugins/device-icons";
import * as queryurl from '../plugins/queryurls';

export default {
    name: 'InfoPanel',
    props: {
        elements: {
            type: Array,
            required: true
        }
    },
    data() {
        return {
            floatingPanel: false,
            selected: this.elements,
            data: [],
            iconTab: [
                { type: 'Centos7', icon: 'mdi-centos' },
                { type: 'IP', icon: 'mdi-access-point' },
                { type: 'VIP', icon: 'mdi-centos' },
                { type: 'SW-Cisco', icon: 'mdi-access-point-network' },
                { type: 'ALOHA', icon: 'mdi-server' },
                { type: 'BARRACUDA', icon: 'mdi-barn' },
                { type: 'OlfeoBox', icon: 'mdi-laptop-mac' }
            ],
            panelInfoHeight: 0,
            infoEvent: { elements: 0 },
        }
    },
    watch: {
        elements() {
            if (this.elements.length==0) {
                this.floatingPanel = false;
            } else {
                this.data = [];
                // Nagios getting services by hostname
                this.getDeviceData(queryurl.HOST_DETAILS + this.elements[0].name );
            }
        }
    },
    mounted() {
        this.$nextTick(function() {
            window.addEventListener('resize', this.getWindowHeight);
            this.getWindowHeight();
        });
    },

    beforeDestroy() {
        window.removeEventListener('resize', this.getWindowHeight);
    },
    methods: {
        setInfoEvent() {
            this.$emit('set-info-event', this.infoEvent );
        },
        getElementIcon(type) {
            return getIcon(type);
        },
        getColor(item) {
            return getCellColor(this.$typeApi, item);
        },
        getRowStateColor(item) {
            if (item.state==0 && (item.indicator=='' || item.indicator!=''))
                return 'green lighten-4';
            if (item.state==1 && (item.indicator=='' || item.indicator!=''))
                return 'blue lighten-4';
            if (item.state==2 && (item.indicator=='' || item.indicator!=''))
                return 'yellow lighten-4';
            if (item.state==3 && (item.indicator=='' || item.indicator!=''))
                return 'red lighten-4';
        },
        toggleInfoPanel() {
            this.floatingPanel = !this.floatingPanel;
            if (this.floatingPanel==true) {
                // var newHeight = this.getHeight()-50;
                // document.querySelector('.info-panel').style['display'] = 'block';
                // document.querySelector('.info-panel-card').style['display'] = 'block';
                document.querySelector('.info-panel').style['position'] = 'absolute';
                document.querySelector('.info-panel').style['right'] = '0px';
                document.querySelector('.panel-row').style['display'] = 'grid';
                document.querySelector('.panel-row').style['grid-template-columns'] = '100%';
            } else {
                document.querySelector('.info-panel').style['position'] = '';
                document.querySelector('.info-panel-card').style['margin-top'] = '0px';
                document.querySelector('.panel-row').style['display'] = 'grid';
                document.querySelector('.panel-row').style['grid-template-columns'] = '80% 20%';
            }

        },
        /**
         * Function to get data from api
         * @param requestDeviceLink - the formated link to make http request
         */
        getDeviceData (requestDeviceLink) {
            axios({
                url: requestDeviceLink,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                responseType: 'json'
            })
                .then(response => {
                    for (const [key, value] of Object.entries(response.data.data.servicelist[this.elements[0].name])) {
                        var data = { name: key };
                        this.data.push(Object.assign(value, data));
                    }
                });
        },
        // function to get the window height minus the filter bar height
        getWindowHeight() {
            this.panelInfoHeight = window.innerHeight - this.$parent.$children[0].$el.clientHeight;
        },
    }
}
</script>

<style lang="scss">
    .info-panel::-webkit-scrollbar {
        z-index: -200;
    }
    .v-alert__content {
        width: 300px;
    }
    .three-dots {
        width: 200px;
    }
    .v-alert__content, .three-dots {
        white-space: nowrap;
        overflow:hidden;
        text-overflow:ellipsis;
    }
</style>
