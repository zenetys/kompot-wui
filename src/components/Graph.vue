<template>
    <div class="ml-5 mr-5 mt-1">
        <v-row>
            <v-col cols="12">
                <v-chip-group v-model="timeSelected" mandatory active-class="primary--text" class="mb-4">
                    <v-chip
                        v-for="item in timeButtons"
                        :key="item.text"
                        small
                        outlined
                        label
                        @click="getGraphData(site, item.value)"
                    >
                        <span>{{ item.text }}</span>
                    </v-chip>
                </v-chip-group>
                <v-row>
                    <v-col cols="12">
                        <v-card class="pa-1" outlined elevation="0">
                            <line-chart class="line-chart" :options="dataOptions" :chart-data="fillData()" />
                        </v-card>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
    </div>
</template>

<script>
// @ is an alias to /src
import LineChart from '../library/chartjs/LineChart.js';
import { data } from '../plugins/chart-data';
import { getQueryUrls } from '@/plugins/apis/api-manager';
import axios from 'axios';

export default {
    name: 'Graph',
    components: {
        LineChart,
    },
    data() {
        return {
            site: this.$route.params.site,
            timeButtons: [
                { text: 'Année', value: 'year' },
                { text: 'Mois', value: 'month' },
                { text: 'Semaine', value: 'week' },
                { text: 'Jour', value: 'day' },
            ],
            timeSelected: 2,
            dataCollection: null,
            data: [],
            config: {},
            queryUrls: getQueryUrls(),
        };
    },
    computed: {
        timeValue() {
            return this.timeButtons[this.timeSelected].value;
        },
        // get list of all site
        siteList() {
            let tab = [];
            data.forEach((element) => {
                return tab.push(element.site);
            });
            return tab.filter(function (item, prop) {
                return tab.indexOf(item) == prop;
            });
        },
        // get data by each site
        siteData() {
            let tab = [];
            data.forEach((element) => {
                if (element.site == this.site) {
                    tab.push(element);
                }
            });
            return tab;
        },
        dataOptions() {
            return {
                legend: {
                    display: true,
                    position: 'bottom',
                },
                scales: {
                    yAxes: [
                        {
                            id: 'duration',
                            type: 'linear',
                            position: 'left',
                            scaleLabel: {
                                display: true,
                                labelString: 'Latence (ms) & Gigue (ms)',
                                fontSize: 10,
                            },
                        },
                        {
                            id: 'loss',
                            type: 'linear',
                            position: 'right',
                            scaleLabel: {
                                display: true,
                                labelString: 'Paquets perdus (%)',
                                fontSize: 10,
                            },
                        },
                    ],
                    xAxes: [
                        {
                            type: 'time',
                            time: {
                                unit: this.timeValue,
                                displayFormats: {
                                    day: 'HH:mm',
                                    week: 'D/MM',
                                    month: 'D/MM/YYYY',
                                    year: 'MM/YYYY',
                                },
                            },
                            distribution: 'series',
                        },
                    ],
                },
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
            };
        },
    },
    watch: {
        $route(to) {
            this.site = to.params.site;
            this.getGraphData(this.site, this.timeValue);
            this.$forceUpdate();
        },
    },
    mounted() {
        this.fillData();
        this.setConfig();
    },
    methods: {
        setConfig() {
            axios({
                url: 'static/config.json',
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                responseType: 'json',
            }).then((response) => {
                this.config = response.data;
                this.getGraphData(this.site, this.timeValue);
            });
        },
        /**
         * This getGraphData() method get the chart data.
         */
        getGraphData(database, start) {
            let timeInterval = '-1' + start;
            let datasources = [];
            this.config.menu.forEach((element1) => {
                if (element1.name == 'IPSLA') {
                    element1.subMenus.forEach((element2) => {
                        if (element2.database == database) {
                            datasources = element2.datasources;
                        }
                    });
                }
            });
            axios({
                url: this.queryUrls.setGraphUri(database, timeInterval, datasources.join(',')),
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                responseType: 'json',
            }).then((response) => {
                this.data = response.data.data;
            });
        },
        getDurationData() {
            var tab = [];
            this.data.forEach((element) => {
                tab.push({
                    x: parseInt(element[0] * 1000), // time
                    y: element[1], // gigue
                });
            });
            return tab;
        },
        getLossData() {
            var tab = [];
            this.data.forEach((element) => {
                tab.push({
                    x: parseInt(element[0] * 1000), // time
                    y: element[3], // loss
                });
            });
            return tab;
        },
        getLatencyData() {
            var tab = [];
            this.data.forEach((element) => {
                tab.push({
                    x: parseInt(element[0] * 1000), // time
                    y: element[2], // latency
                });
            });
            return tab;
        },
        fillData() {
            return {
                datasets: [
                    {
                        type: 'bar',
                        label: 'Gigue',
                        backgroundColor: 'rgba(255, 99, 132, 0.1)',
                        borderColor: 'rgb(255, 99, 132)',
                        borderWidth: 1,
                        yAxisID: 'duration',
                        data: this.getDurationData(),
                    },
                    {
                        type: 'line',
                        label: 'Loss',
                        backgroundColor: 'rgba(54, 162, 235, 0)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1,
                        yAxisID: 'loss',
                        data: this.getLossData(),
                        pointRadius: 0,
                    },
                    {
                        type: 'line',
                        label: 'Latency',
                        backgroundColor: 'rgba(255, 206, 86, 0)',
                        borderColor: 'rgba(255, 206, 86, 1)',
                        borderWidth: 1,
                        data: this.getLatencyData(),
                        pointRadius: 0,
                    },
                ],
            };
        },
        getRandomInt() {
            return Math.floor(Math.random() * (50 - 5 + 1)) + 5;
        },
    },
};
</script>

<style lang="scss">
.small {
    max-width: 400px;
    margin: 0px;
    padding: 20px 0;
    text-align: center;
}
.card {
    float: left;
    clear: left;
    background-color: #dadde121 !important;
}

/* chart css */
.line-chart {
    height: 300px;
}
</style>
