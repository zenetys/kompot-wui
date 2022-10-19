import i18n from '../i18n.js';

// List of all api the app can receive
const apis = {
    'elastic': elasticStateText,
    'thruk': thrukStateText,
    'nagios': nagiosStateText,
}

function elasticStateText() {

}

function thrukStateText() {

}

function nagiosStateText(status, item) {
    // HOST
    if (status==2)
        return i18n.t('hostUp');
    if (status==4 && item.display_name=="PING")
        return i18n.t('hostDown');
    if (status==4 && item.display_name!="PING")
        return i18n.t('serviceWarning');
    if (status==8 && item.display_name=="PING")
        return i18n.t('hostUnreachable');
    if (item.status==8 && item.display_name!="PING"){
        return i18n.t('serviceUnknown');
    }
    if (status==1)
        return i18n.t('pending');
    if (status==16)
        return i18n.t('serviceCritical');
}

export function getStateText(status, item, type_api) {
    return apis[type_api](status, item);
}
