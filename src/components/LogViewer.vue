<template>
    <AutoTable :config="config" :api="config.api"> </AutoTable>
</template>

<script>
import { kConfig } from '@/plugins/config.js';
import AutoTable from '@zenetys/ztable';

export default {
    components: {
        AutoTable,
    },
    computed: {
        config() {
            /** @TODO change to backend endpoint when it's made available */
            // return kConfig.menu.find(m => m.i18nName === 'logViewer').configUrl;
            /** @TEMPORARY until remote config is available */
            return kConfig.historyConfig;
        },
    },
};
</script>
