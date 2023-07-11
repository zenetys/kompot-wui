import axios from 'axios';
import { kConfig } from '@/plugins/config';
import { apiConfig } from '@/plugins/apis/api-manager';

import {
    getQueryUrls as NagiosGetQueryUrls,
    fetchRrd as NagiosFetchRrd,
    getGraph as NagiosGetGraph,
    postActions as NagiosPostActions,
    fetchServerState as NagiosFetchServerState,
} from './nagios';

export const useZTableSearch = false;

/**
 * Get the query urls for the LiveStatus API.
 * @returns {object} the query urls by type
 * */
export function getQueryUrls() {
    return {
        ...NagiosGetQueryUrls(),
        COMBINED_LIST: `${kConfig.livestatusBaseUrl}/livestatus.cgi?action=combined`,
    };
}

/**
 * Fetch Livestatus data and normalize for Kompot.
 * @param {Object|null} filters - Filters, in case the API can handle
 *      it server side. FIXME: specs
 * @returns {Promise} Promise resolving with normalized data,
 *      it's up to the caller to handle the error.
 */
export function fetchAndNormalizeData(filters) {
    let url = getQueryUrls().COMBINED_LIST + '&limit=0&order=-priority&track=1';
    if (filters) {
        if (filters.level)
            url += '&level=' + encodeURIComponent(livestatusLevel(filters.level));
        if (filters.search)
            url += '&query=' + encodeURIComponent(filters.search);
    }
    return axios
        .get(url)
        .then((result) => {
            const rawData = result.data;
            // oraganise raw Nagios data and format it for the table
            return formatData(rawData);
        })
        // let the caller handle the error
}

export function fetchRrd(database, start, datasources) {
    return NagiosFetchRrd(database, start, datasources);
}

export function getGraph(normalizedEntry) {
    return NagiosGetGraph(normalizedEntry);
}

export function postActions(order, data, comment = '') {
    return NagiosPostActions(order, data, comment);
}

export function fetchServerState() {
    return NagiosFetchServerState();
}

// internals

/**
 * Format LiveStatus data for AutoTable.
 * @param {object} rawData - the raw data from the LiveStatus API
 * @param {array} headers - headers config to help format the data
 * @returns {array} the formatted data
 */
function formatData(rawData) {
    const normalizedData = [];

    for (const id in rawData) {
        const rawElement = rawData[id];
        const normalized = {
            id,
            device: rawElement.host_name,
            ...(isDevice(rawElement)
                ? { indicator: apiConfig.DEFAULT_DEVICE_INDICATOR,
                    entry_kind: apiConfig.KIND_DEVICE }
                : { indicator: rawElement.description,
                    entry_kind: apiConfig.KIND_INDICATOR }
            ),
            status: getNormalizedStatus(rawElement),
            priority: rawElement.priority,
            device_address: rawElement.host_address,
            device_type: rawElement.icon_image, /* kind of */
            last_state_change: rawElement.last_state_change * 1000,
            last_check: rawElement.last_check * 1000,
            check_information: rawElement.plugin_output,
            is_hard_state: rawElement.state_type === LIVESTATUS_CODES.STATE_TYPE_HARD,
            has_notifications_enabled: rawElement.notifications_enabled === 1,
            is_acknowledged: rawElement.acknowledged === 1,
            is_passive_check: rawElement.check_type === LIVESTATUS_CODES.CHECK_TYPE_PASSIVE,
            is_outage: rawElement.host_state === LIVESTATUS_CODES.HOST_UNREACHABLE ||
                       rawElement.host_state === LIVESTATUS_CODES.HOST_DOWN,
            /* kompot specific custom variables */
            has_track: rawElement._TRACK === '' ||
                       rawElement._TRACK === 0 ? false : true,
            has_auto_track: rawElement._AUTOTRACK === '' ||
                            rawElement._AUTOTRACK === 0 ? false : true,
            /* extra from standard norm */
            groups: rawElement.groups,
            notes: rawElement.notes,
            is_flapping: rawElement.is_flapping,
        }
        normalizedData.push(normalized);
    }

    return normalizedData;
}

function isDevice(rawElement) {
    return rawElement.description === undefined ||
        rawElement.description === '-';
}

function getNormalizedStatus(rawElement) {
    if (rawElement.has_been_checked === 0)
        return apiConfig.STATUS_PENDING;
    if (isDevice(rawElement) && rawElement.state > 0)
        return rawElement.state + 1;
    return rawElement.state;
}

const LIVESTATUS_CODES = {
    HOST_UP: 0,
    HOST_DOWN: 1,
    HOST_UNREACHABLE: 2,
    SERVICE_OK: 0,
    SERVICE_WARNING: 1,
    SERVICE_CRITICAL: 2,
    SERVICE_UNKNOWN: 3,
    STATE_TYPE_SOFT: 0,
    STATE_TYPE_HARD: 1,
    CHECK_TYPE_ACTIVE: 0,
    CHECK_TYPE_PASSIVE: 1,
};

function livestatusLevel(kompotLevel) {
    switch (kompotLevel) {
        case 'critical': return 1;
        case 'recent': return 2;
        case 'known': return 3;
        case 'all-problems': return 4;
        case 'any': return 5;
    }
    return 1;
}
