<template>
    <div>
        <v-chip
            id="khost_up" :title="$t('hostUp')"
            small label class="mr-1 elevation-2" color="green lighten-2"
        >{{ ($store.data.counters.hosts.up + $store.data.counters.hosts.pending) || '' }}</v-chip>
        <v-chip
            id="khost_down" :title="$t('hostDown')"
            small label class="mr-1 elevation-2" color="red lighten-2"
        >{{ $store.data.counters.hosts.down }}</v-chip>
        <v-chip
            id="khost_unreachable" :title="$t('hostUnreachable')"
            small label class="mr-1 elevation-2" color="orange accent-3"
        >{{ $store.data.counters.hosts.unreachable }}</v-chip>
        <span v-if="!$vuetify.breakpoint.smAndDown" class="mr-1">|</span>
        <span v-else><v-divider class="mt-2 mb-2" /></span>
        <v-chip
            id="ksvc_ok" :title="$t('serviceOk')"
            small label class="mr-1 elevation-2" color="green lighten-2"
        >{{ ($store.data.counters.services.ok + $store.data.counters.services.pending) || '' }}</v-chip>
        <v-chip
            id="ksvc_warning" :title="$t('serviceWarning')"
            small label class="mr-1 elevation-2" color="yellow darken-2"
        >{{ $store.data.counters.services.warning }}</v-chip>
        <v-chip
            id="ksvc_critical" :title="$t('serviceCritical')"
            small label class="mr-1 elevation-2" color="red lighten-2"
        >{{ $store.data.counters.services.critical }}</v-chip>
        <v-chip
            id="ksvc_unknown" :title="$t('serviceUnknown')"
            small label class="mr-1 elevation-2" color="orange accent-3"
        >{{ $store.data.counters.services.unknown }}</v-chip>
    </div>
</template>

<script>
import i18n from '../plugins/i18n';

export default {
    i18n: i18n,
    name: 'Cartouche',
    data() {
        return {
            timer: null,
        }
    },
    mounted() {
        this.updateServerLoop();
    },
    methods: {
        async updateServerLoop() {
            clearTimeout(this.timer);
            await this.$store.updateServer();
            this.timer = setTimeout(this.updateServerLoop, 10000);
        },
    },
};
</script>
