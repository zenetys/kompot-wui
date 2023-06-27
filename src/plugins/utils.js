const axiosBuildFullPath = require('axios/lib/core/buildFullPath');
const axiosBuildURL = require('axios/lib/helpers/buildURL');
export const axiosIsAxiosError = require('axios/lib/helpers/isAxiosError');
export function axiosError2URL(e) {
    const method = e.config.method.toUpperCase();
    return (method === 'POST' || method === 'PUT' || method === 'PATCH')
        ? (method + ' ' + axiosBuildFullPath(e.config.baseURL, e.config.url))
        : (method + ' ' + axiosBuildFullPath(e.config.baseURL, axiosBuildURL(e.config.url, e.config.params)));
}

// Format: day hour minute second (1d5h45m78s)
export function compactFormat(date) {
    let now = new Date();
    let outTime = formatDateWithMillisecond((now.getTime() - new Date(date).getTime()) / 1000);

    let outTimeFormat = [];
    if (outTime.dayNumber > 0 && outTimeFormat.length < 2) outTimeFormat.push(outTime.dayNumber + 'd');
    if (outTime.hourNumber > 0 && outTimeFormat.length < 2) outTimeFormat.push(outTime.hourNumber + 'h');
    if (outTime.minuteNumber > 0 && outTimeFormat.length < 2) outTimeFormat.push(outTime.minuteNumber + 'm');
    if (outTime.secondNumber > 0 && outTimeFormat.length < 2) outTimeFormat.push(outTime.secondNumber + 's');

    return outTimeFormat.join(String.fromCharCode(8201));
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
