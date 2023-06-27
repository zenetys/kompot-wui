import axios from 'axios';
import { setApiType } from '@/plugins/apis/api-manager';

export const kConfig = {
    apiType: 'nagios',
    apiTimeout: 20000,
    livestatusBaseUrl: '.',
    nagiosBaseUrl: './nagios',
    rrdBaseUrl: '.',
    graphUrl: './monitoring-graph?device=%device%&indicator=%indicator%',
    graphDeviceIndicator: 'hostcheck',
    graphPopupOptions: 'directories=no,menubar=no,status=no,location=yes,scrollbars=no,resizable=yes,width=900,height=453',
    title: undefined,
    menu: [
        {
            i18nName: 'menuEvents',
            url: '/panel',
            icon: 'mdi-table',
            type: 'div',
        }
    ],
};

/**
 * Initialise the config object and set Axios default values
 * This function awaits and is thus declared async.
 * @async
 * @throws On axios error or if the response has unexpected data.
 */
export async function init() {
    axios.defaults.timeout = kConfig.apiTimeout;

    const response = await axios({
        url: './static/config.json',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        responseType: 'json',
    });

    if (typeof response.data !== 'object')
        throw Error('Unexpected data type in config.json');

    /* Note: assume types of assign'ed properties is what's expected */
    Object.assign(kConfig, response.data);
    console.log('Config set to ', kConfig);

    if (kConfig.apiTimeout)
        axios.defaults.timeout = kConfig.apiTimeout;

    setApiType(kConfig.apiType);
}
