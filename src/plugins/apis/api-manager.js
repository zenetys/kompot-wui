import * as Nagios from './nagios.js';
import * as LiveStatus from './livestatus.js';
import Vue from 'vue';

export var apiConfig = Vue.observable({});

export function setApiConfig(data) {
    Vue.set(apiConfig, 'apiType', data.apiType);
    Vue.set(apiConfig, 'dataPath', data.dataPath);
    Vue.set(apiConfig, 'livestatusBaseUrl', data.livestatusBaseUrl);
    Vue.set(apiConfig, 'nagiosBaseUrl', data.nagiosBaseUrl);
    Object.freeze(apiConfig);
    console.log('apiConfig set to: ', apiConfig);
}

/**
 * Get all status texts for a specific API.
 * @returns {object} the status texts for the API and their respective codes
 */
export function getStatusTexts() {
    if (apiConfig.apiType === 'nagios') {
        return Nagios.statusVariables;
    } else if (apiConfig.apiType === 'livestatus') {
        return LiveStatus.statusVariables;
    }
}

/**
 * Fetch & format data from a specific API.
 * @param {array} headers - headers config to help format the data
 * @returns {array} the formatted data
 */
export function fetchAndFormatData(headers, filters = null) {
    if (apiConfig.apiType === 'nagios') {
        return Nagios.fetchAndFormatData(headers);
    } else if (apiConfig.apiType === 'livestatus') {
        return LiveStatus.fetchAndFormatData(headers, filters);
    }
}

/**
 * Get query URLs based on config API
 * @returns {object} the query URLs for the API
 */
export function getQueryUrls() {
    if (apiConfig.apiType === 'nagios') {
        return Nagios.getQueryUrls();
    } else if (apiConfig.apiType === 'livestatus') {
        return { ...Nagios.getQueryUrls(), ...LiveStatus.getQueryUrls() };
    }
}
