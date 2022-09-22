// List of all api the app can receive
const apis = {
    'elastic': elasticRowColor,
    'thruk': thrukRowColor,
    'nagios': nagiosRowColor,
}

function elasticRowColor() {
    
}

function thrukRowColor() {
    
}

function nagiosRowColor(item) {
    if (item.notifications_enabled === false)
        return 'grey lighten-1';
    if (item.track === true && item.status > 2)
        return 'blue lighten-4';
    if (item.track === true)
        return 'teal lighten-3';
    // HOST
    if (item.status==2)
        return 'green lighten-4'; // green light
    if (item.status==4 && item.display_name=="PING")
        return 'red lighten-3'; // red light
    if (item.status==8 || (item.status==4 && item.display_name!="PING"))
        return 'orange lighten-3'; // orange light
    if (item.status==1)
        return 'light-blue accent-1'; // blue light
    if (item.status==16)
        return 'red lighten-3'; // red light
}

export function getRowColor(type_api, item) {
    return apis[type_api](item);
}
