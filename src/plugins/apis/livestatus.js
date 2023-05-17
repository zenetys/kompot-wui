import axios from 'axios';
import { apiConfig } from '@/plugins/apis/api-manager';

/**
 * Livestatus status texts and their respective values.
 */
export const statusVariables = {
    UP: 2,
    HOST_PENDING: 1,
    HOST_DOWN: 4,
    HOST_UNREACHABLE: 8,
    HARD_STATE: 1,
    SOFT_STATE: 1,
};

/**
 * Format LiveStatus data for AutoTable.
 * @param {object} rawData - the raw data from the LiveStatus API
 * @param {array} headers - headers config to help format the data
 * @returns {array} the formatted data
 */
export function fetchAndFormatData(headers, filters) {
    /** @TODO handle filters */
    filters;
    return axios
        .get(getQueryUrls().COMBINED_LIST)
        .then((result) => {
            const rawData = result.data;
            // oraganise raw Nagios data and format it for the table
            return formatData(rawData, headers);
        })
        .catch(() => {});
}

function getNagiosState(type, state) {
    if (type == 1 && state == 0) return 2;  // Host UP
    if (type == 1 && state == 1) return 4;  // Host DOWN
    if (type == 1 && state == 2) return 8;  // Host UNREACHABLE
    if (type == 0 && state == 0) return 2;  // Service UP
    if (type == 0 && state == 1) return 4;  // Service WARNING
    if (type == 0 && state == 2) return 16; // Service CRITICAL
    if (type == 0 && state == 3) return 8;  // Service UNKNOWN
    return 8;
}

/**
 * Format LiveStatus data for AutoTable.
 * @param {object} rawData - the raw data from the LiveStatus API
 * @param {array} headers - headers config to help format the data
 * @returns {array} the formatted data
 */
export function formatData(rawData, headers) {
    const formattedData = [];

    // formatting loop
    for (const [key, value] of Object.entries(rawData)) {
        const element = value;

        // add priority column
        const time_indice = element.last_check / new Date();
        const priority_indice = getPriorityIndice(element);
        const priority = time_indice + priority_indice;

        const data = {
            id: key,
            name: element.host_name,
            display_name: element.description === "-" ? "PING" : element.description,
            priority,
            problem_has_been_acknowledged: element.acknowledged,
            outage: element.state === statusVariables.HOST_UNREACHABLE,
            TYPE: element.custom_variables ? element.custom_variables.TYPE : '',
            state_type: element.state_type,
            auto_track: element.__AUTOTRACK === '0;' || element.__AUTOTRACK === '1;0' ? false : typeof(element.__AUTOTRACK)!="undefined",
            track: element.__TRACK === '0;' || element.__TRACK === '1;0' ? false : typeof(element.__TRACK)!="undefined",
            status: getNagiosState(element.description === "-", element.state),
            accept_passive_checks: true,
            address: element.host_address,
        };

        // apply formatting loop from each header
        formatDataPerHeader(headers, element, data);

        formatDate(data, ["last_state_change", "last_check"]);

        formattedData.push(data);
    }

    return formattedData;
}

/**
 * Format date to javascript format (seconds to milliseconds).
 */
function formatDate(data, keys) {
    keys.forEach((key) => {
        data[key] = data[key] * 1000;
    });
}

/**
 * Compute the priority indice of an element.
 * @param {object} element - the element to compute the priority indice
 * @returns {number} the priority indice
 */
function getPriorityIndice(element) {
    if (element.notifications_enabled == false) return 0;
    if (element.display_name != 'PING' && element.state == 1) return 1;
    if (element.display_name == 'PING' && element.state == 1) return 2;
    if (element.display_name != 'PING' && element.state == 2) return 3;
    if (element.display_name == 'PING' && element.state == 2) return 4;
    if (element.display_name != 'PING' && element.state == 4) return 5;
    if (element.display_name == 'PING' && element.state == 8) return 6;
    if (element.display_name != 'PING' && element.state == 8) return 7;
    if (element.display_name == 'PING' && element.state == 4) return 8;
    if (element.display_name != 'PING' && element.state == 16) return 9;
}

/**
 * Format data per header.
 * @param {array} headers - headers config to help format the data
 * @param {object} element - the element to format
 * @param {object} data - the data to format
 */
function formatDataPerHeader(headers, element, data) {
    headers.forEach((h) => {
        const elem = h.value.split('.').reduce((obj, i) => {
            return typeof obj == 'undefined' ? undefined : obj[i];
        }, element);
        if (typeof elem !== 'undefined') {
            data[h.value] = elem;
        }
    });
}

/** 
 * Get the query urls for the LiveStatus API.
 * @returns {object} the query urls by type
 * */
export function getQueryUrls() {
    return { COMBINED_LIST: `${apiConfig.livestatusBaseUrl}action=combined` };
}
