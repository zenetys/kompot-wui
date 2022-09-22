import { compactFormat, frenchFormat } from '../modules/timedisplay'
import { getCellColor } from '../plugins/status/cell-color';
import { getStateText } from '../plugins/status/state-text';
import i18n from '../plugins/i18n';

const apis = {
    'elastic': elasticHeader,
    'thruk': thrukHeader,
    'nagios': nagiosHeader,
}

function elasticHeader() {
    return [
        
    ];
}

function thrukHeader() {
    return [
        { text: 'state-ext', value: 'state-ext', label: 'state-ext', divider: true, align: '', sortable: false , show: true, render: 'state-ext', width: '5%' },
        { text: 'state', value: 'state', label: i18n.tc('state'), divider: true, align: '', sort: '', show: true, render: getStateText, shape: getCellColor, width: '5%' },
        { text: 'last_state_change', value: 'last_state_change', label: i18n.tc('lastEv'), divider: true, align: '', sort: '', show: true, render: compactFormat, width: '5%' },
        { text: 'name', value: 'name', label: i18n.tc('device'), divider: true, align: '', sort: '', show: true, width: '20%' },
        // { text: i18n.tc('ipAddress'), value: 'ip', divider: true, align: '', sort: '', show: true, width: '110px' },
        { text: 'display_name', value: 'display_name', label: i18n.tc('indicator'), divider: true, align: '', sort: '', show: true, width: '15%' },
        { text: 'plugin_output', value: 'plugin_output', label: i18n.tc('output'), divider: true, align: '', sort: '', show: true, render: 'output', width: '20%' },
        { text: '_DEBUG', value: '_DEBUG', label: i18n.tc('debug'), divider: true, align: '', sort: '', show: true, width: '10%' },
        { text: '_SITE', value: '_SITE', label: i18n.tc('site'), divider: true, align: '', sort: '', show: true, width: '10%' },
        { text: '_TYPE', value: '_TYPE', label: i18n.tc('type'), divider: true, align: '', sort: '', show: true, width: '20%' },
        
    ];
}

// Nagios header
function nagiosHeader() {
    return [
        { text: 'state-flag', value:'state-flag', vkey: 'state-flag', label: i18n.tc('stateFlag'), divider: true, align: '', sortable: false , show: true, render: 'state-ext', width: '4%' },
        { text: 'priority', value:'priority', vkey: 'priority', label: i18n.tc('priority'), divider: true, align: ' d-none', sort: '', show: false, render: '', width: '5%', shape: '' },
        { text: 'status', value:'status', vkey: 'status', label: i18n.tc('state'), divider: true, align: '', sort: '', show: true, render: getStateText, width: '5%', shape: getCellColor },
        { text: 'name', value:'name', vkey: 'name', label: i18n.tc('device'), divider: true, align: '', sort: '', show: true, render: '', width: '10%', shape: '' },
        { text: 'display_name', value:'display_name', vkey: 'display_name', label: i18n.tc('indicator'), divider: true, align: '', sort: '', show: true, render: '', width: '15%', shape: '' },
        { text: 'description', value:'description', vkey: 'description', label: i18n.tc('description'), divider: true, align: ' d-none', sort: '', show: false, render: '', width: '10%', shape: '' },
        { text: 'last_state_change', value:'last_state_change', vkey: 'last_state_change', label: i18n.tc('lastEv'), divider: true, align: '', sort: '', show: true, render: frenchFormat, width: '10%', shape: '' },
        // { text: 'duration_last_state_change', value:'duration_last_state_change', vkey: 'last_state_change', label: i18n.tc('durationLastStateChange'), divider: true, align: '', sort: '', show: true, render: compactFormat, width: '5%', shape: '' }, // same as the last but render different
        // { text: 'last_update', value:'last_state_change', vkey: 'last_update', label: i18n.tc('durationLastUpdate'), divider: true, align: '', sort: '', show: true, render: compactFormat, width: '5%', shape: '' },
        { text: 'notifications_enabled', value:'notifications_enabled', vkey: 'notifications_enabled', label: i18n.tc('notificationsEnabled'), divider: true, align: ' d-none', sort: '', show: false, render: '', width: '2%', shape: '' },
        { text: 'last_check', value:'last_check', vkey: 'last_check', label: i18n.tc('durationLastUpdate'), divider: true, align: '', sort: '', show: true, render: compactFormat, width: '5%', shape: '' },
        { text: 'check_type', value:'check_type', vkey: 'check_type', label: i18n.tc('checkType'), divider: true, align: ' d-none', sort: '', show: false, render: '', width: '2%', shape: '' },
        { text: 'accept_passive_checks', value:'accept_passive_checks', vkey: 'accept_passive_checks', label: i18n.tc('passiveEnabled'), divider: true, align: ' d-none', sort: '', show: false, render: '', width: '2%', shape: '' },
        { text: 'checks_enabled', value:'checks_enabled', vkey: 'checks_enabled', label: i18n.tc('checksEnabled'), divider: true, align: ' d-none', sort: '', show: false, render: '', width: '2%', shape: '' },
        { text: 'problem_has_been_acknowledged', value:'problem_has_been_acknowledged', vkey: 'problem_has_been_acknowledged', label: i18n.tc('ack'), divider: true, align: ' d-none', sort: '', show: false, render: '', width: '2%', shape: '' },
        { text: 'outage', value:'outage', vkey: 'outage', label: i18n.tc('outage'), divider: true, align: ' d-none', sort: '', show: false, render: '', width: '2%', shape: '' },
        { text: 'state_type', value:'state_type', vkey: 'state_type', label: i18n.tc('stateType'), divider: true, align: ' d-none', sort: '', show: false, render: '', width: '2%', shape: '' },
        { text: 'auto_track', value:'auto_track', vkey: 'auto_track', label: i18n.tc('autoTrack'), divider: true, align: ' d-none', sort: '', show: false, render: '', width: '2%', shape: '' },
        { text: 'track', value:'track', vkey: 'track', label: i18n.tc('track'), divider: true, align: ' d-none', sort: '', show: false, render: '', width: '2%', shape: '' },
        { text: 'plugin_output', value:'plugin_output', vkey: 'plugin_output', label: i18n.tc('output'), divider: true, align: '', sort: '', show: true, render: '', width: '36%', shape: '' },
        
    ];
}

export function getHeader(type_api) {
    return apis[type_api]();
}

