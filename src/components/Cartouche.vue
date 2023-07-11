<!-- FIXME: rewrite, remove Vuex -->

<template>
    <div>
        <v-chip :title="$t('hostUp')" small class="mr-1 elevation-2" color="green lighten-2" label>
            {{ ($store.data.counters.hosts.up + $store.data.counters.hosts.pending) || '' }}
        </v-chip>
        <v-chip :title="$t('hostDown')" small class="mr-1 elevation-2" color="red lighten-2" label>
            {{ $store.data.counters.hosts.down }}
        </v-chip>
        <v-chip :title="$t('hostUnreachable')" small class="mr-1 elevation-2" color="orange accent-3" label>
            {{ $store.data.counters.hosts.unreachable }}
        </v-chip>
        <span v-if="!$vuetify.breakpoint.smAndDown">|</span>
        <span v-else><v-divider class="mt-2 mb-2" /></span>
        <v-chip :title="$t('hostUp')" small class="mr-1 ml-1 elevation-2" color="green lighten-2" label>
            {{ ($store.data.counters.services.ok + $store.data.counters.services.pending) || '' }}
        </v-chip>
        <v-chip :title="$t('serviceWarning')" small class="mr-1 elevation-2" color="yellow darken-2" label>
            {{ $store.data.counters.services.warning }}
        </v-chip>
        <v-chip :title="$t('serviceCritical')" small class="mr-1 elevation-2" color="red lighten-2" label>
            {{ $store.data.counters.services.critical }}
        </v-chip>
        <v-chip :title="$t('serviceUnknown')" small class="mr-1 elevation-2" color="orange accent-3" label>
            {{ $store.data.counters.services.unknown }}
        </v-chip>
    </div>
</template>

<script>
import i18n from '../plugins/i18n';

export default {
    i18n: i18n,
    name: 'Cartouche',
    mounted() {
        this.refresh();
    },
    methods: {
        refresh() {
            this.progressValue = 0;
            clearInterval(this.progressInterval);
            this.$store.updateServer();
            this.progressInterval = setInterval(() => {
                if (this.progressValue === 100) {
                    clearInterval(this.progressInterval);
                    return setTimeout(this.refresh, 2000);
                }
                this.progressValue += 10;
            }, 1000);
        },
    },
};
</script>
