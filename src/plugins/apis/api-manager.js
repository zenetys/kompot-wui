import * as Nagios from './nagios.js';
import Config from '/public/static/config.json';

const apiName = Config.apiType;

/**
 * Get all status texts for a specific API.
 * @returns {object} the status texts for the API and their respective codes
 */
export function getStatusTexts() {
    if (apiName === 'nagios') {
        return Nagios.statusVariables;
    }
}

/**
 * Fetch & format data from a specific API.
 * @param {array} headers - headers config to help format the data
 * @returns {array} the formatted data
 */
export function fetchAndFormatData(headers, filters = null) {
    if (apiName === 'nagios') {
        return Nagios.fetchAndFormatData(headers);
    }
}

/**
 * Get query URLs based on config API
 * @returns {object} the query URLs for the API
 */
export function getQueryUrls() {
    if (apiName === 'nagios') {
        return Nagios.queryUrls;
    }
}
