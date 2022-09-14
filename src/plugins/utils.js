import Router from '@/router';

// Format: DD/MM/YYY (06/05/2021)
export function frenchFormat(date) {
    return new Date(date).toLocaleDateString('fr-FR') + ' ~ ' + new Date(date).toLocaleTimeString('fr-FR');
}

// Format: month year (2m3y)
export function simpleFormat(date) {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let now = new Date();
    let outTimeFormat = formatDateWithMillisecond((now.getTime() - new Date(date).getTime()) / 1000);
    var time = new Date(date).getTime();

    if (outTimeFormat.dayNumber == 0)
        return outTimeFormat.hourNumber + ':' + outTimeFormat.minuteNumber + ':' + outTimeFormat.secondNumber;
    if (outTimeFormat.dayNumber > 0 && outTimeFormat.dayNumber < 1)
        return outTimeFormat.hourNumber + ':' + outTimeFormat.minuteNumber + ':' + outTimeFormat.secondNumber;
    if (outTimeFormat.dayNumber >= 1 && outTimeFormat.dayNumber < 365) {
        return new Date(time).getDate() + ' ' + monthNames[new Date(time).getMonth()];
    }
    if (outTimeFormat.dayNumber > 365) {
        return monthNames[new Date(time).getMonth()] + ' ' + new Date(time).getFullYear();
    }
}

// Format: day hour minute second (1d5h45m78s)
export function compactFormat(date) {
    let now = new Date();
    let outTime = formatDateWithMillisecond((now.getTime() - new Date(date).getTime()) / 1000);

    // if (outTime.dayNumber > 49 )
    //     return '+7weeks';

    let outTimeFormat = [];
    if (outTime.dayNumber > 0 && outTimeFormat.length < 2) outTimeFormat.push(outTime.dayNumber + 'd');
    if (outTime.hourNumber > 0 && outTimeFormat.length < 2) outTimeFormat.push(outTime.hourNumber + 'h');
    if (outTime.minuteNumber > 0 && outTimeFormat.length < 2) outTimeFormat.push(outTime.minuteNumber + 'm');
    if (outTime.secondNumber > 0 && outTimeFormat.length < 2) outTimeFormat.push(outTime.secondNumber + 's');

    return outTimeFormat.join('');
}

function formatDateWithMillisecond(second) {
    second = Math.round(second);
    let dayNumber = Math.floor(second / 86400);

    second = second - dayNumber * 86400;
    let hourNumber = Math.floor(second / 3600);

    second = second - hourNumber * 3600;
    let minuteNumber = Math.floor(second / 60);

    second = second - minuteNumber * 60;

    return {
        dayNumber: dayNumber,
        hourNumber: hourNumber,
        minuteNumber: minuteNumber,
        secondNumber: second,
    };
}

/**
 * Generate a link to navigate through the API data, updating the "path" param in the URL
 * @param {string} type the type of data on the destination : either "array" or "object".
 * @param {string} key the key to add to the path to navigate to.
 * @param {string} index the  index of the data we are currently viewing if in an array.
 * @returns {string} the HTML link to navigate to the updated path.
 */
export function generateLinkToSubPath(type, key, index = null) {
    const route = Router.currentRoute;

    /* Updating query params with the new path parameter */
    let newPath = route.query?.path;
    newPath = route.query.path ? route.query.path + '.' : '';
    newPath += index !== null ? `${index}.${key}` : `${key}`;

    const label = type === 'object' ? 'Object' : 'Array';

    const url = generateUrlFromPath(newPath);

    return `<a href="${url}" title="Open sub-level">${label}</a>`;
}

/**
 * Check whether an object input is empty or not
 * @param {object} obj the object to check
 * @returns {boolean} true if the object is empty, false otherwise.
 */
export function isEmptyObject(obj) {
    return Object.keys(obj).length === 0;
}

/**
 * Generate a URL with an updated dataPath from a given path
 * @param {string} newPath the new path to add to the URL
 * @returns {string} the URL with the updated path
 */
export function generateUrlFromPath(newPath) {
    const route = Router.currentRoute;

    const newQueryParams = {
        ...route.query,
        path: newPath,
    };

    const updatedRoute = {
        query: newQueryParams,
    };

    if (!isEmptyObject(route.params)) {
        updatedRoute.params = route.params;
        updatedRoute.name = route.name || '';
    }

    return Router.resolve(updatedRoute).href;
}

/**
 * Swap two elements in an array, given their relative indexes
 * @param {array} array the array to modify
 * @param {number} index1 the index of the first element to swap
 * @param {number} index2 the index of the second element to swap
 * @returns {array} the modified array
 */
export function swapElementsInArray(array, index1, index2) {
    const items = [...array];
    const item1 = items[index1];
    const item2 = items[index2];
    items[index1] = item2;
    items[index2] = item1;

    return items;
}
