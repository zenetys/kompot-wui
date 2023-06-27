import axios from 'axios';
import { kConfig } from '@/plugins/config';
import { apiConfig } from '@/plugins/apis/api-manager';

export const useZTableSearch = true;

/**
 * Compute Nagios query urls
 * @returns {object} the Nagios query urls by type
 */
export function getQueryUrls() {
    return {
        OBJECT_HOST_LIST: `${kConfig.nagiosBaseUrl}/objectjson.cgi?query=hostlist&details=true`,
        STATUS_HOST_LIST: `${kConfig.nagiosBaseUrl}/statusjson.cgi?query=hostlist&details=true`,
        HOST_DETAILS: `${kConfig.nagiosBaseUrl}/statusjson.cgi?query=servicelist&details=true&hostname=`,
        OBJECT_SERVICE_LIST: `${kConfig.nagiosBaseUrl}/objectjson.cgi?query=servicelist&details=true`,
        STATUS_SERVICE_LIST: `${kConfig.nagiosBaseUrl}/statusjson.cgi?query=servicelist&details=true`,
        HOST_COUNT: `${kConfig.nagiosBaseUrl}/statusjson.cgi?query=hostcount`,
        SERVICE_COUNT: `${kConfig.nagiosBaseUrl}/statusjson.cgi?query=servicecount`,
        RRD: `${kConfig.graphBaseUrl}/r`,
    };
}

/**
 * Fetch Nagios data and normalize for Kompot.
 * @returns {Promise} Promise resolving with normalized data, it's up to
 *      the caller to handle the error.
 */
export function fetchAndNormalizeData() {
    return axios
        .all([
            axios.get(getQueryUrls().OBJECT_HOST_LIST),
            axios.get(getQueryUrls().OBJECT_SERVICE_LIST),
            axios.get(getQueryUrls().STATUS_HOST_LIST),
            axios.get(getQueryUrls().STATUS_SERVICE_LIST),
        ])
        .then(
            axios.spread((result1, result2, result3, result4) => {
                const rawApiData = {
                    hostObjectData: result1.data.data.hostlist,
                    serviceObjectData: result2.data.data.servicelist,
                    hostStatusData: result3.data.data.hostlist,
                    serviceStatusData: result4.data.data.servicelist,
                };

                // oraganise raw Nagios data and format it for the table
                return formatData(rawApiData);
            })
        )
        // let the caller handle the error
}

/**
 * Filter and sort normalized data client side.
 * @param {Array} normalizedData - Data returned by fetchAndNormalizeData().
 * @param {Object|null} filters - Kompot filters FIXME: specs
 * @returns {Array} New filtered array sorted by descending priority.
 */
export function filterAndSortNormalizedData(normalizedData, filters) {
    let filteredData = [];

    switch (filters?.level) {
        case 'critical':
            filteredData = normalizedData.filter((element) => {
                return (
                    (element.status !== apiConfig.STATUS_OK &&
                     element.is_hard_state &&
                     !element.is_acknowledged &&
                     !element.is_outage &&
                     element.status !== apiConfig.STATUS_PENDING &&
                     element.has_notifications_enabled) ||
                    element.has_track ||
                    element.has_auto_track
                );
            });
            break;

        case 'recent':
            filteredData = normalizedData.filter((element) => {
                return (
                    (element.status !== apiConfig.STATUS_OK &&
                     !element.is_acknowledged &&
                     !element.is_outage &&
                     element.status !== apiConfig.STATUS_PENDING &&
                     element.has_notifications_enabled) ||
                    element.has_track ||
                    element.has_auto_track
                );
            });
            break;

        case 'known':
            filteredData = normalizedData.filter((element) => {
                return (
                    (element.status !== apiConfig.STATUS_OK &&
                     !element.is_outage &&
                     element.status !== apiConfig.STATUS_PENDING) ||
                    element.has_track ||
                    element.has_auto_track
                );
            });
            break;

        case 'all-problems':
            filteredData = normalizedData.filter((element) => {
                return (
                    (element.status !== apiConfig.STATUS_OK &&
                     element.status !== apiConfig.STATUS_PENDING) ||
                    element.has_track ||
                    element.has_auto_track
                );
            });
            break;

        default:
            filteredData = normalizedData.filter(() => true);
            break;
    }

    filteredData.sort((a, b) => {
        if (a.priority < b.priority)
            return 1;
        if (a.priority > b.priority)
            return -1;
        return 0;
    });

    return filteredData;
}

export function fetchRrd(database, start, datasources) {
    if (Array.isArray(datasources))
        datasources = datasources.join(',');
    let url = kConfig.rrdBaseUrl + '/r' +
        '?db=' + encodeURIComponent(database.replace(':', '/')) +
        '&start=' + encodeURIComponent(start) +
        '&ds=' + encodeURIComponent(datasources);
    return axios
        .get(url)
        .then((result) => result.data)
        // let the caller handle the error
}

export function getGraph(normalizedEntry) {
    const indicator = normalizedEntry.entry_kind === apiConfig.KIND_INDICATOR
        ? normalizedEntry.indicator : kConfig.graphDeviceIndicator;
    const name = `${normalizedEntry.device}:${indicator}:graph`;
    const url = kConfig.graphUrl
        .replace('%device%', encodeURIComponent(normalizedEntry.device))
        .replace('%indicator%', encodeURIComponent(indicator));
    return {
        device: normalizedEntry.device,
        indicator,
        url,
        popup: () => window.open(url, name, kConfig.graphPopupOptions),
    };
}

// internals

const NAGIOS_CODES = {
    HOST_PENDING: 1,
    HOST_UP: 2,
    HOST_DOWN: 4,
    HOST_UNREACHABLE: 8,
    SERVICE_PENDING: 1,
    SERVICE_OK: 2,
    SERVICE_WARNING: 4,
    SERVICE_UNKNOWN: 8,
    SERVICE_CRITICAL: 16,
    STATE_TYPE_SOFT: 0,
    STATE_TYPE_HARD: 1,
    CHECK_TYPE_ACTIVE: 0,
    CHECK_TYPE_PASSIVE: 1,
    CHECK_TYPE_PARENT: 2,
    CHECK_TYPE_FILE: 3,
    CHECK_TYPE_OTHER: 4,
};

/**
 * Format Nagios data for AutoTable.
 * @param {object} rawData - the raw data from the Nagios API
 * @returns {array} the formatted data
 */
function formatData(rawData) {
    const normalizedData = [];
    const nowMs = Date.now();

    for (const kH in rawData.hostStatusData) {
        const hostStatus = rawData.hostStatusData[kH];
        const hostObject = rawData.hostObjectData[kH];
        const normalized = {
            id: hostStatus.name + ':',
            device: hostStatus.name,
            indicator: apiConfig.DEFAULT_DEVICE_INDICATOR,
            entry_kind: apiConfig.KIND_DEVICE,
            status: getNormalizedStatus(hostStatus),
            priority: getPriorityIndice(hostStatus) + (hostStatus.last_state_change / nowMs),
            device_address: hostObject.address,
            device_type: hostObject?.custom_variables?.TYPE,
            last_state_change: hostStatus.last_state_change,
            last_check: hostStatus.last_check,
            check_information: hostStatus.plugin_output,
            is_hard_state: hostStatus.state_type === NAGIOS_CODES.STATE_TYPE_HARD,
            has_notifications_enabled: hostStatus.notifications_enabled === true,
            is_acknowledged: hostStatus.problem_has_been_acknowledged === true,
            is_passive_check: hostStatus.check_type === NAGIOS_CODES.CHECK_TYPE_PASSIVE,
            is_outage: hostStatus.status === NAGIOS_CODES.HOST_UNREACHABLE,
            /* custom variables are unsupported with nagios vanilla status cgis */
            has_track: hostStatus.__TRACK === '0;' ||
                       hostStatus.__TRACK === '1;0' ? false : true,
            has_auto_track: hostStatus.__AUTOTRACK === '0;' ||
                            hostStatus.__AUTOTRACK === '1;0' ? false : true,
        }
        normalizedData.push(normalized);
    }

    for (const kH in rawData.serviceStatusData) {
        for (const kS in rawData.serviceStatusData[kH]) {
            const serviceStatus = rawData.serviceStatusData[kH][kS];
            const hostStatus = rawData.hostStatusData?.[kH] ?? {};
            const hostObject = rawData.hostObjectData?.[kH] ?? {};

            const normalized = {
                id: serviceStatus.host_name + ':' + serviceStatus.description,
                device: serviceStatus.host_name,
                indicator: serviceStatus.description,
                entry_kind: apiConfig.KIND_INDICATOR,
                status: getNormalizedStatus(serviceStatus),
                priority: getPriorityIndice(serviceStatus) + (serviceStatus.last_state_change / nowMs),
                device_address: hostObject.address,
                device_type: hostObject?.custom_variables?.TYPE,
                last_state_change: serviceStatus.last_state_change,
                last_check: serviceStatus.last_check,
                check_information: serviceStatus.plugin_output,
                is_hard_state: serviceStatus.state_type === NAGIOS_CODES.STATE_TYPE_HARD,
                has_notifications_enabled: serviceStatus.notifications_enabled === true,
                is_acknowledged: serviceStatus.problem_has_been_acknowledged === true,
                is_passive_check: serviceStatus.check_type === NAGIOS_CODES.CHECK_TYPE_PASSIVE,
                is_outage: hostStatus.status === NAGIOS_CODES.HOST_UNREACHABLE ||
                           hostStatus.status === NAGIOS_CODES.HOST_DOWN,
                /* custom variables are unsupported with nagios vanilla status cgis */
                has_track: serviceStatus.__TRACK === '0;' ||
                           serviceStatus.__TRACK === '1;0' ? false : true,
                has_auto_track: serviceStatus.__AUTOTRACK === '0;' ||
                                serviceStatus.__AUTOTRACK === '1;0' ? false : true,
            }
            normalizedData.push(normalized);
        }
    }

    return normalizedData;
}

function getNormalizedStatus(nagiosStatusElement) {
    if (nagiosStatusElement.description === undefined) {
        switch (nagiosStatusElement.status) {
            case NAGIOS_CODES.HOST_PENDING: return apiConfig.STATUS_PENDING;
            case NAGIOS_CODES.HOST_UP: return apiConfig.STATUS_OK;
            case NAGIOS_CODES.HOST_DOWN: return apiConfig.STATUS_CRITICAL;
        }
    }
    else {
        switch (nagiosStatusElement.status) {
            case NAGIOS_CODES.SERVICE_PENDING: return apiConfig.STATUS_PENDING;
            case NAGIOS_CODES.SERVICE_OK: return apiConfig.STATUS_OK;
            case NAGIOS_CODES.SERVICE_WARNING: return apiConfig.STATUS_WARNING;
            case NAGIOS_CODES.SERVICE_CRITICAL: return apiConfig.STATUS_CRITICAL;
        }
    }
    return apiConfig.STATUS_UNKNOWN;
}

/**
 * Compute the priority indice of an element.
 * @param {Object} nagiosStatusElement - Nagios status object for the element.
 * @returns {number} The priority indice. The highest should go up in the table,
 *      most critical entries first.
 */
function getPriorityIndice(nagiosStatusElement) {
    if (nagiosStatusElement.notifications_enabled === false)
        return 0;
    if (nagiosStatusElement.description === undefined) {
        switch (nagiosStatusElement.status) {
            case NAGIOS_CODES.HOST_PENDING: return 2;
            case NAGIOS_CODES.HOST_UP: return 4;
            case NAGIOS_CODES.HOST_UNREACHABLE: return 7;
            case NAGIOS_CODES.HOST_DOWN: return 9;
        }
    }
    else {
        switch (nagiosStatusElement.status) {
            case NAGIOS_CODES.SERVICE_PENDING: return 1;
            case NAGIOS_CODES.SERVICE_OK: return 4;
            case NAGIOS_CODES.SERVICE_WARNING: return 5;
            case NAGIOS_CODES.SERVICE_UNKNOWN: return 6;
            case NAGIOS_CODES.SERVICE_CRITICAL: return 8;
        }
    }
    return -1;
}
