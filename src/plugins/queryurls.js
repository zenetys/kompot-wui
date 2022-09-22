export const SERVER = "/nagios";

export const OBJECT_HOST_LIST = SERVER + "/cgi-bin/objectjson.cgi?query=hostlist&details=true";

export const STATUS_HOST_LIST = SERVER + "/cgi-bin/statusjson.cgi?query=hostlist&details=true";

export const HOST_DETAILS = SERVER + "cgi-bin/statusjson.cgi?query=servicelist&details=true&hostname=";

export const OBJECT_SERVICE_LIST = SERVER + "/cgi-bin/objectjson.cgi?query=servicelist&details=true";

export const STATUS_SERVICE_LIST = SERVER + "/cgi-bin/statusjson.cgi?query=servicelist&details=true";

export const HOST_COUNT = SERVER+"/cgi-bin/statusjson.cgi?query=hostcount";

export const SERVICE_COUNT = SERVER+"/cgi-bin/statusjson.cgi?query=servicecount";


/**
 * The following constants for set the query url to get data for chart.
 */
const GRAPH_URI = "/r"
// This function set the url for get data to populate the graph
export function setGraphUri(database, start, datasources) {
    return GRAPH_URI+"?db="+database.replace(':', '/')+"&start="+start+"&ds="+datasources;
}
