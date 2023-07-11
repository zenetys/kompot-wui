import { default as axiosBuildFullPath } from 'axios/lib/core/buildFullPath';
import { default as axiosBuildURL } from 'axios/lib/helpers/buildURL';
export { default as axiosIsAxiosError } from 'axios/lib/helpers/isAxiosError';
export function axiosError2URL(e) {
    const method = e.config.method.toUpperCase();
    return (method === 'POST' || method === 'PUT' || method === 'PATCH')
        ? (method + ' ' + axiosBuildFullPath(e.config.baseURL, e.config.url))
        : (method + ' ' + axiosBuildFullPath(e.config.baseURL, axiosBuildURL(e.config.url, e.config.params)));
}

// Format: day hour minute second (1d5h45m78s)
export function compactFormat(date) {
    if (isNaN(date) || date <= 0)
        return String.fromCharCode(8212);

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

/**
 * Build a route location object based on another reference route object.
 * The current $route is typically passed as reference in order to derive
 * a new route from it, overriding only some query parameters given in the
 * target route object.
 * @param {Location|undefined} target - Target route object to override
 *      the reference route object. Target route properties (name or path,
 *      parameters) get preference over the ones in the reference object.
 *      If undefined is given as target value, the resulting route will be
 *      a no-op compared to the reference one.
 * @param {Location} reference - Base route object to derive the target
 *      route object from.
 * @return {Location} - The resulting route.
 */
export function deriveRoute(target, reference) {
    var outRoute = { name: target?.name, path: target?.path, query: {}, params: {} };
    Object.assign(outRoute.query, reference.query, target?.query);
    Object.assign(outRoute.params, reference.params, target?.params);
    return outRoute;
}

/**
 * Wrapper function to vue-router push(), deriving the current route to
 * to build the new target route.
 * @param {VueComponent} vm - Vue instance
 * @param {Location|undefined} target - Target route object to override the
 *      current route. See documentation in deriveRoute().
 */
export function gotoRoute(vm, target) {
    vm.$router
        .push(deriveRoute(target, vm.$route))
        .catch(() => {});
}
