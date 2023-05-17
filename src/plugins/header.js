import { compactFormat, frenchFormat } from '@/plugins/utils';
import { getCellColor } from '@/plugins/status/cell-color';
import { getStateText } from '@/plugins/status/state-text';
import DataManager from '@/plugins/dataManager';
import i18n from '@/plugins/i18n';
import { apiConfig } from '@/plugins/apis/api-manager';

const apis = {
    elastic: elasticHeader,
    thruk: thrukHeader,
    nagios: nagiosHeader,
    "livestatus": nagiosHeader, 
};

function elasticHeader() {
    return [];
}

function thrukHeader() {
    return [
        {
            text: 'state-ext',
            value: 'state-ext',
            label: 'state-ext',
            divider: true,
            sortable: false,
            show: true,
            render: 'state-ext',
            width: '5%',
        },
        {
            text: 'state',
            value: 'state',
            label: i18n.tc('state'),
            divider: true,
            sort: '',
            show: true,
            render: getStateText,
            shape: getCellColor,
            width: '5%',
        },
        {
            text: 'last_state_change',
            value: 'last_state_change',
            label: i18n.tc('lastEv'),
            divider: true,
            sort: '',
            show: true,
            render: compactFormat,
            width: '5%',
        },
        {
            text: 'name',
            value: 'name',
            label: i18n.tc('device'),
            divider: true,
            sort: '',
            show: true,
            width: '20%',
        },
        // { text: i18n.tc('ipAddress'), value: 'ip', divider: true, align: '', sort: '', show: true, width: '110px' },
        {
            text: 'display_name',
            value: 'display_name',
            label: i18n.tc('indicator'),
            divider: true,
            sort: '',
            show: true,
            width: '15%',
        },
        {
            text: 'plugin_output',
            value: 'plugin_output',
            label: i18n.tc('output'),
            divider: true,
            sort: '',
            show: true,
            render: 'output',
            width: '20%',
        },
        {
            text: '_DEBUG',
            value: '_DEBUG',
            label: i18n.tc('debug'),
            divider: true,
            sort: '',
            show: true,
            width: '10%',
        },
        {
            text: '_SITE',
            value: '_SITE',
            label: i18n.tc('site'),
            divider: true,
            sort: '',
            show: true,
            width: '10%',
        },
        {
            text: '_TYPE',
            value: '_TYPE',
            label: i18n.tc('type'),
            divider: true,
            sort: '',
            show: true,
            width: '20%',
        },
    ];
}

// Nagios header
function nagiosHeader() {
    return [
        {
            text: 'state-flag',
            value: 'state-flag',
            vkey: 'state-flag',
            label: i18n.tc('stateFlag'),
            divider: true,
            sortable: false,
            show: true,
            render: 'state-ext',
            width: '8%',
        },
        {
            text: 'priority',
            value: 'priority',
            vkey: 'priority',
            label: i18n.tc('priority'),
            divider: true,
            sort: '',
            show: false,
            render: '',
            width: '5%',
            shape: '',
        },
        {
            text: 'status',
            value: 'status',
            vkey: 'status',
            label: i18n.tc('state'),
            divider: true,
            sort: '',
            show: true,
            render: getStateText,
            width: '10%',
            shape: getCellColor,
        },
        {
            text: 'name',
            value: 'name',
            vkey: 'name',
            label: i18n.tc('device'),
            divider: true,
            sort: '',
            show: true,
            render: '',
            width: '20%',
            shape: '',
        },
        {
            text: 'display_name',
            value: 'display_name',
            vkey: 'display_name',
            label: i18n.tc('indicator'),
            divider: true,
            sort: '',
            show: true,
            render: '',
            width: '11%',
            shape: '',
        },
        {
            text: 'description',
            value: 'description',
            vkey: 'description',
            label: i18n.tc('description'),
            divider: true,
            sort: '',
            show: false,
            render: '',
            width: '10%',
            shape: '',
        },
        {
            text: 'address',
            value:'address',
            vkey: 'address',
            label: i18n.tc('ipAddress'),
            divider: true,
            align: ' d-none',
            sort: '',
            show: false,
            render: '',
            width: '10%',
            shape: ''
        },
        {
            text: 'last_state_change',
            value: 'last_state_change',
            vkey: 'last_state_change',
            label: i18n.tc('lastEv'),
            divider: true,
            sort: '',
            show: true,
            render: frenchFormat,
            width: '15%',
            shape: '',
        },
        // { text: 'duration_last_state_change', value:'duration_last_state_change', vkey: 'last_state_change', label: i18n.tc('durationLastStateChange'), divider: true, sort: '', show: true, render: compactFormat, width: '5%', shape: '' }, // same as the last but render different
        // { text: 'last_update', value:'last_state_change', vkey: 'last_update', label: i18n.tc('durationLastUpdate'), divider: true, sort: '', show: true, render: compactFormat, width: '5%', shape: '' },
        {
            text: 'notifications_enabled',
            value: 'notifications_enabled',
            vkey: 'notifications_enabled',
            label: i18n.tc('notificationsEnabled'),
            divider: true,
            sort: '',
            show: false,
            render: '',
            width: '2%',
            shape: '',
        },
        {
            text: 'last_check',
            value: 'last_check',
            vkey: 'last_check',
            label: i18n.tc('durationLastUpdate'),
            divider: true,
            sort: '',
            show: true,
            render: compactFormat,
            width: '5%',
            shape: '',
        },
        {
            text: 'check_type',
            value: 'check_type',
            vkey: 'check_type',
            label: i18n.tc('checkType'),
            divider: true,
            sort: '',
            show: false,
            render: '',
            width: '2%',
            shape: '',
        },
        {
            text: 'accept_passive_checks',
            value: 'accept_passive_checks',
            vkey: 'accept_passive_checks',
            label: i18n.tc('passiveEnabled'),
            divider: true,
            sort: '',
            show: false,
            render: '',
            width: '2%',
            shape: '',
        },
        {
            text: 'checks_enabled',
            value: 'checks_enabled',
            vkey: 'checks_enabled',
            label: i18n.tc('checksEnabled'),
            divider: true,
            sort: '',
            show: false,
            render: '',
            width: '2%',
            shape: '',
        },
        {
            text: 'problem_has_been_acknowledged',
            value: 'problem_has_been_acknowledged',
            vkey: 'problem_has_been_acknowledged',
            label: i18n.tc('ack'),
            divider: true,
            sort: '',
            show: false,
            render: '',
            width: '2%',
            shape: '',
        },
        {
            text: 'outage',
            value: 'outage',
            vkey: 'outage',
            label: i18n.tc('outage'),
            divider: true,
            sort: '',
            show: false,
            render: '',
            width: '2%',
            shape: '',
        },
        {
            text: 'state_type',
            value: 'state_type',
            vkey: 'state_type',
            label: i18n.tc('stateType'),
            divider: true,
            sort: '',
            show: false,
            render: '',
            width: '2%',
            shape: '',
        },
        {
            text: 'auto_track',
            value: 'auto_track',
            vkey: 'auto_track',
            label: i18n.tc('autoTrack'),
            divider: true,
            sort: '',
            show: false,
            render: '',
            width: '2%',
            shape: '',
        },
        {
            text: 'track',
            value: 'track',
            vkey: 'track',
            label: i18n.tc('track'),
            divider: true,
            sort: '',
            show: false,
            render: '',
            width: '2%',
            shape: '',
        },
        {
            text: 'plugin_output',
            value: 'plugin_output',
            vkey: 'plugin_output',
            label: i18n.tc('output'),
            divider: true,
            sort: '',
            show: true,
            render: '',
            width: '36%',
            shape: '',
        },
    ];
}

/**
 * Get headers depending on the provided type of API
 * @param {string} apiType - API type
 * @returns {object[]} - API specific headers
 */
export function getHeaders(apiType) {
    return formatHeadersForAutotable(apis[apiType]());
}

/**
 * Format some headers for the AutoTable component and apply custom settings from storage if any
 * @param {object[]} headers - Headers to format
 * @returns {object[]} - Formatted headers
 */
function formatHeadersForAutotable(headers) {
    formatHeaders(headers);
    // Once headers have been formatted and saved in the DataManager, look for headers settings in local storage
    DataManager.applyColumnConfigFromStorage();
    return DataManager.headers;
}

/**
 * Format headers data for the AutoTable's v-data-table directive
 * @param {object[]} headers
 * @returns {object[]} The formatted headers
 */
function formatHeaders(headers) {
    let hid = 0;

    const formattedHeaders = headers.map((h) => {
        h.text = h.label;
        h.getCellContent = displayRowText;
        h.getCellClasses = displayRowClasses;

        const header = {
            ...DataManager.defaultHeaderConfig,
            ...h,
            hid: hid++,
        };

        return header;
    });

    DataManager.headers = formattedHeaders;
    return formattedHeaders;
}

/**
 * Format a table cell's text value with custom options depending on the column.
 * @param {String} header - the column to format
 * @param {Object} item - the item to format
 */
function displayRowText(header, item) {
    let cellValue = null;
    let cellText = '';
    let isHtml = false;

    if (typeof header.render === 'function') {
        cellValue = header.render(item[header.value], item, apiConfig.apiType);
        cellText = cellValue;
    } else if (header.render === 'state-ext') {
        isHtml = true;
        cellValue = 'state-ext';
        cellText = 'Etat';
    } else {
        if (item[header.value] === null) {
            cellValue = '--';
        } else {
            cellValue = item[header.value];
        }
        cellText = cellValue;
    }

    // Return the AutoTable's cell format
    return {
        value: cellValue,
        text: cellText,
        isHtml,
    };
}

/**
 * Format a table cell's classes depending on the column.
 * @param {String} header - the column to format
 * @param {Object} item - the item to format
 * @returns {String} - the classes to apply to the cell
 */
function displayRowClasses(header, item) {
    if (typeof header.shape !== 'undefined') {
        if (typeof header.shape === 'function') {
            return header.shape(apiConfig.apiType, item);
        } else {
            return header.shape;
        }
    } else {
        return '';
    }
}
