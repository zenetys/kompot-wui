import Vue from 'vue'

import { apiConfig } from '@/plugins/apis/api-manager';

export const data = new Vue.observable({
    serverLastFetchStatus: undefined,
    serverLastDataUpdate: undefined,
    serverHealthy: undefined,
    counters: {
        hosts: {
            pending: undefined,
            up: undefined,
            unreachable: undefined,
            down: undefined,
        },
        services: {
            pending: undefined,
            ok: undefined,
            warning: undefined,
            unknown: undefined,
            critical: undefined,
        },
    },
    isMonitor: false,
});

export function updateServer() {
    apiConfig.fetchServerState()
        .then(([ hostResponse, serviceResponse ]) => {
            data.serverLastFetchStatus = true;
            data.serverLastDataUpdate = Math.max(
                hostResponse.data.result.last_data_update,
                serviceResponse.data.result.last_data_update,
            );
            data.counters.hosts.pending = hostResponse.data.data.count.pending;
            data.counters.hosts.up = hostResponse.data.data.count.up;
            data.counters.hosts.down = hostResponse.data.data.count.down;
            data.counters.hosts.unreachable = hostResponse.data.data.count.unreachable;
            data.counters.services.pending = serviceResponse.data.data.count.pending;
            data.counters.services.ok = serviceResponse.data.data.count.ok;
            data.counters.services.warning = serviceResponse.data.data.count.warning;
            data.counters.services.critical = serviceResponse.data.data.count.critical;
            data.counters.services.unknown = serviceResponse.data.data.count.unknown;
        })
        .catch(() => {
            data.serverLastFetchStatus = false;
        })
        .finally(() => {
            /* last fetch must have succeed and data must be fresh */
            data.serverHealthy = (data.serverLastFetchStatus &&
                (Date.now() - data.serverLastDataUpdate) < 60000);
        });
}
