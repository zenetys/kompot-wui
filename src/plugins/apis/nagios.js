import axios from 'axios';
import { apiConfig } from '@/plugins/apis/api-manager';

/**
 * Format Nagios data for AutoTable.
 * @param {object} rawData - the raw data from the Nagios API
 * @param {array} headers - headers config to help format the data
 * @returns {array} the formatted data
 */
export function formatData(rawData, headers) {
    const organisedData = organiseRawData(rawData);
    const [hostData, serviceData] = [organisedData.hosts, organisedData.services];

    const data_hosts = [];
    const data_services = [];
    const data_by_id_hosts = [];
    const data_by_id_services = [];
    const data_by_id_final_data = [];

    // hostData formatting loop
    for (const [key, value] of Object.entries(hostData)) {
        const element = value;
        const id = `${key}:PING`;

        // add priority column
        const time_indice = element.last_update / new Date();
        const priority_indice = getPriorityIndice(element);
        const priority = time_indice + priority_indice;

        const data = {
            id,
            name: element.name,
            priority,
            problem_has_been_acknowledged: element.problem_has_been_acknowledged,
            outage: element.status === statusVariables.HOST_UNREACHABLE,
            TYPE: element.custom_variables ? element.custom_variables.TYPE : '',
            state_type: element.state_type,
            auto_track: element.__AUTOTRACK === '0;' || element.__AUTOTRACK === '1;0' ? false : true,
            track: element.__TRACK === '0;' || element.__TRACK === '1;0' ? false : true,
        };

        // apply formatting loop from each header
        formatDataPerHeader(headers, element, data);

        data['display_name'] = 'PING';

        if (typeof data_by_id_hosts[id] === 'undefined') {
            data_hosts.push(data);
            data_by_id_hosts[id] = data_hosts.length - 1;
        } else {
            const idx = data_by_id_hosts[id];
            data_hosts[idx] = Object.assign({}, data_hosts[idx], data);
        }
    }

    // serviceData formatting loop
    for (const [key, value] of Object.entries(serviceData)) {
        for (let i = 0; i < Object.keys(value).length; i++) {
            const element = value[Object.keys(value)[i]];

            // look for each service parent (host)
            const foundHostElement = data_hosts.find((hostElement) => {
                return hostElement['name'] === key;
            });

            const id = `${key}:${element.description}`;

            // add priority column
            const time_indice = element.last_update / new Date();
            const priority_indice = getPriorityIndice(element);
            const priority = time_indice + priority_indice;

            const data2 = {
                id,
                name: element.host_name,
                priority,
                problem_has_been_acknowledged: element.problem_has_been_acknowledged,
                outage: foundHostElement
                    ? foundHostElement.status === statusVariables.HOST_DOWN ||
                      foundHostElement.status === statusVariables.HOST_UNREACHABLE
                    : '',
                TYPE: element.custom_variables?.TYPE || '',
                state_type: element.state_type,
                auto_track: element.__AUTOTRACK === '0;' || element.__AUTOTRACK === '1;0' ? false : true,
                track: element.__TRACK === '0;' || element.__TRACK === '1;0' ? false : true,
            };

            // apply formatting loop from each header
            formatDataPerHeader(headers, element, data2);

            if (typeof data_by_id_services[id] === 'undefined') {
                data_services.push(data2);
                data_by_id_services[id] = data_services.length - 1;
            } else {
                const idx = data_by_id_services[id];
                data_services[idx] = Object.assign({}, data_services[idx], data2);
            }
        }
    }

    // merge all hosts & services
    const concatData = data_hosts.concat(data_services);
    const finalData = [];

    concatData.forEach((element) => {
        const data3 = { id: element.id, name: element.name };

        // apply formatting loop from each header
        formatDataPerHeader(headers, element, data3);

        if (typeof data_by_id_final_data[element.id] === 'undefined') {
            finalData.push(data3);
            data_by_id_final_data[element.id] = finalData.length - 1;
        } else {
            const idx = data_by_id_final_data[element.id];
            finalData[idx] = Object.assign({}, finalData[idx], data3);
        }
    });

    return finalData;
}

/**
 * Nagios status texts and their respective values.
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
 * Compute the priority indice of an element.
 * @param {object} element - the element to compute the priority indice
 * @returns {number} the priority indice
 */
function getPriorityIndice(element) {
    if (element.notifications_enabled == false) return 0;
    if (element.display_name != 'PING' && element.status == 1) return 1;
    if (element.display_name == 'PING' && element.status == 1) return 2;
    if (element.display_name != 'PING' && element.status == 2) return 3;
    if (element.display_name == 'PING' && element.status == 2) return 4;
    if (element.display_name != 'PING' && element.status == 4) return 5;
    if (element.display_name == 'PING' && element.status == 8) return 6;
    if (element.display_name != 'PING' && element.status == 8) return 7;
    if (element.display_name == 'PING' && element.status == 4) return 8;
    if (element.display_name != 'PING' && element.status == 16) return 9;
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
 * Organise raw Nagios data.
 * @param {object} rawData - the raw data from Nagios
 * @returns {object} the organised Nagios data
 */
function organiseRawData(rawData) {
    // merge HOST status data and object data
    for (const key in rawData.hostStatusData) {
        for (const key2 in rawData.hostObjectData) {
            if (rawData.hostStatusData[key]['name'] === rawData.hostObjectData[key2]['name']) {
                rawData.hostObjectData[key2] = Object.assign(rawData.hostObjectData[key2], rawData.hostStatusData[key]);
            }
        }
    }
    // merge SERVICE status data and object data
    for (const [key, value] of Object.entries(rawData.serviceStatusData)) {
        key;
        for (let i = 0; i < Object.keys(value).length; i++) {
            const statusElement = value[Object.keys(value)[i]];
            // loop on object data
            for (const [key, value2] of Object.entries(rawData.serviceObjectData)) {
                key;
                for (let j = 0; j < Object.keys(value2).length; j++) {
                    const objectElement = value2[Object.keys(value2)[j]];
                    if (
                        statusElement['host_name'] === objectElement['host_name'] &&
                        statusElement['description'] === objectElement['description']
                    ) {
                        value2[Object.keys(value2)[j]] = Object.assign(objectElement, statusElement);
                    }
                }
            }
        }
    }
    return {
        hosts: rawData.hostObjectData,
        services: rawData.serviceObjectData,
    };
}

/**
 * Fetch & format Nagios data.
 * @param {array} headers - headers config to help format the data
 * @returns {array} the formatted data
 */
export function fetchAndFormatData(headers) {
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
                return formatData(rawApiData, headers);
            })
        )
        .catch(() => {});
}

/**
 * The following constants for set the query url to get data for chart.
 */
const GRAPH_URI = './r';

/**
 * Compute Nagios query urls
 * @returns {object} the Nagios query urls by type
 */
export function getQueryUrls() {
    return {
        OBJECT_HOST_LIST: `${apiConfig.nagiosBaseUrl}/objectjson.cgi?query=hostlist&details=true`,
        STATUS_HOST_LIST: `${apiConfig.nagiosBaseUrl}/statusjson.cgi?query=hostlist&details=true`,
        HOST_DETAILS: `${apiConfig.nagiosBaseUrl}/statusjson.cgi?query=servicelist&details=true&hostname=`,
        OBJECT_SERVICE_LIST: `${apiConfig.nagiosBaseUrl}/objectjson.cgi?query=servicelist&details=true`,
        STATUS_SERVICE_LIST: `${apiConfig.nagiosBaseUrl}/statusjson.cgi?query=servicelist&details=true`,
        HOST_COUNT: `${apiConfig.nagiosBaseUrl}/statusjson.cgi?query=hostcount`,
        SERVICE_COUNT: `${apiConfig.nagiosBaseUrl}/statusjson.cgi?query=servicecount`,
        // This function set the url for get data to populate the graph
        setGraphUri: (database, start, datasources) => {
            return GRAPH_URI + '?db=' + database.replace(':', '/') + '&start=' + start + '&ds=' + datasources;
        },
    };
}
