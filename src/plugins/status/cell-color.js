// List of all api the app can receive
const apis = {
    elastic: elasticCellColor,
    thruk: thrukCellColor,
    nagios: nagiosCellColor,
    'livestatus-cgi': nagiosCellColor,
};

function elasticCellColor() {}

function thrukCellColor() {}

function nagiosCellColor(item) {
    // HOST
    if (item.status == 2) return 'green'; // green dark
    if (item.status == 4 && item.display_name != 'PING') return 'yellow accent-4'; // yellow dark
    if (item.status == 4 && item.display_name == 'PING') return 'red darken-1'; // red dark
    if (item.status == 8) return 'orange darken-2'; // orange dark
    if (item.status == 1) return 'light-blue accent-1'; // blue dark
    if (item.status == 16) return 'red darken-1'; // red dark
}

export function getCellColor(apiType, item) {
    return apis[apiType](item);
}
