<template>
    <div>
        <v-chip :title="$t('hostUp')" small class="mr-1 elevation-2" color="green lighten-2" label>
            {{ host.up }}
        </v-chip>
        <v-chip :title="$t('hostUnreachable')" small class="mr-1 elevation-2" color="orange lighten-2" label>
            {{ host.unreachable }}
        </v-chip>
        <v-chip :title="$t('hostDown')" small class="mr-1 elevation-2" color="red lighten-2" label>
            {{ host.down }}
        </v-chip>
        <span v-if="!$vuetify.breakpoint.smAndDown">|</span>
        <span v-else><v-divider class="mt-2 mb-2" /></span>
        <v-chip :title="$t('hostUp')" small class="mr-1 ml-1 elevation-2" color="green lighten-2" label>
            {{ service.ok }}
        </v-chip>
        <v-chip :title="$t('serviceWarning')" small class="mr-1 elevation-2" color="orange lighten-2" label>
            {{ service.warning }}
        </v-chip>
        <v-chip :title="$t('serviceCritical')" small class="mr-1 elevation-2" color="red lighten-2" label>
            {{ service.critical }}
        </v-chip>
    </div>
</template>

<script>
import axios from 'axios';
import { apiConfig } from '@/plugins/apis/api-manager';
import { mapActions } from 'vuex';
import i18n from '../plugins/i18n';

export default {
    i18n: i18n,
    name: 'Cartouche',
    data() {
        return {
            // Host number
            host: {
                up: 0,
                down: 0,
                unreachable: 0,
                pending: 0,
            },

            // Service number
            service: {
                ok: 0,
                warning: 0,
                unknown: 0,
                critical: 0,
                pending: 0,
            },
            serviceNumber: 0,
            progressInterval: 0,
            progressValue: 0,
            queryUrls: null,
            apiConfig,
        };
    },
    watch: {
        apiConfig: {
            immediate: true,
            handler(newConfig) {
                if (newConfig.apiType) {
                    this.queryUrls = apiConfig.getQueryUrls();
                    this.refresh();
                }
            }
        },
    },
    methods: {
        ...mapActions(['updateServerProblem', 'updateLastUpdate', 'updateServerState']),
        refresh() {
            this.progressValue = 0;
            clearInterval(this.progressInterval);
            this.getItemNumber();
            this.progressInterval = setInterval(() => {
                if (this.progressValue === 100) {
                    clearInterval(this.progressInterval);
                    return setTimeout(this.refresh, 2000);
                }
                this.progressValue += 10;
            }, 1000);
        },
        getItemNumber() {
            axios
                .all([
                    axios({
                        url: this.queryUrls.HOST_COUNT,
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        responseType: 'json',
                    }),
                    axios({
                        url: this.queryUrls.SERVICE_COUNT,
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        responseType: 'json',
                    }),
                ])
                .then(
                    axios.spread((hostResponse, serviceResponse) => {
                        this.updateLastUpdate(hostResponse.data.result.last_data_update);
                        this.updateServerProblem(0);
                        this.updateServerState();
                        this.host.up = hostResponse.data.data.count.up + hostResponse.data.data.count.pending;
                        this.host.down = hostResponse.data.data.count.down;
                        this.host.unreachable = hostResponse.data.data.count.unreachable;

                        this.service.ok = serviceResponse.data.data.count.ok + serviceResponse.data.data.count.pending;
                        this.service.warning =
                            serviceResponse.data.data.count.warning + serviceResponse.data.data.count.unknown;
                        this.service.critical = serviceResponse.data.data.count.critical;
                    })
                )
                .catch(() => {
                    this.updateServerProblem(1);
                    this.updateServerState();
                });
        },
    },
};
</script>
