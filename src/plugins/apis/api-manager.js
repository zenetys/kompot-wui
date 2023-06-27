import * as nagios from './nagios';
import * as livestatus from './livestatus';

const API_TYPES = {
    nagios,
    livestatus,
};

const API_INTERFACE = [
    'getQueryUrls',
    'fetchAndNormalizeData',
    'filterAndSortNormalizedData',
    'useZTableSearch',
    'fetchRrd',
    'getGraph',
];

export const apiConfig = {
    DEFAULT_DEVICE_INDICATOR: 'PING',
    KIND_DEVICE: 'device',
    KIND_INDICATOR: 'indicator',
    STATUS_PENDING: -1,
    STATUS_OK: 0,
    STATUS_WARNING: 1,
    STATUS_CRITICAL: 2,
    STATUS_UNKNOWN: 3,
};

export function setApiType(type) {
    if (typeof type !== 'string')
        throw Error('Invalid API type');
    if (!API_TYPES[type])
        throw Error('Unsupported API type');

    apiConfig.apiType = type;

    for (let i of API_INTERFACE)
        apiConfig[i] = API_TYPES[type][i];

    Object.freeze(apiConfig);
    console.log('API config set to', apiConfig);
}
