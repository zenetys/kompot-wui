<template>
    <v-dialog v-model="dialog" max-width="600px">
        <template #activator="{ on, attrs }">
            <button
                v-for="item in butonInfo"
                :key="item.color"
                style="text-decoration: none"
                v-bind="attrs"
                v-on="on"
                @click="setAction(item)"
            >
                <v-tooltip top>
                    <template #activator="tooltipScope">
                        <v-btn class="mx-2" fab dark small :color="item.color" v-bind="tooltipScope.attrs" v-on="tooltipScope.on">
                            <v-icon dark> {{ item.icon }} </v-icon>
                        </v-btn>
                    </template>
                    <span>{{ item.text }}</span>
                </v-tooltip>
            </button>
        </template>
        <v-card>
            <v-card-title class="headline mb-5">
                {{ dialogTitle }}
            </v-card-title>

            <v-card-actions>
                <v-spacer />
                <v-btn color="green darken-1" text @click="dialog = false">
                    {{ $t('cancel') }}
                </v-btn>
                <v-btn color="green darken-1" text @click="validForm">
                    {{ $t('ok') }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import { apiConfig } from '@/plugins/apis/api-manager';

export default {
    props: {
        elements: {
            type: Object,
            default: () => ({}),
        },
    },
    data() {
        return {
            butonInfo: [
                {
                    icon: 'mdi-traffic-cone',
                    text: this.$t('acquit'),
                    color: 'primary',
                    order: 'ack',
                },
                {
                    icon: 'mdi-eye',
                    text: this.$t('track'),
                    color: 'cyan darken-3',
                    order: 'track',
                },
                {
                    icon: 'mdi-restore-alert',
                    text: this.$t('resetState'),
                    color: 'pink',
                    order: 'reset-state',
                },
                {
                    icon: 'mdi-bell-off',
                    text: this.$t('deactiveAlarm'),
                    color: 'indigo',
                    order: 'alarm-off',
                },
                {
                    icon: 'mdi-refresh',
                    text: this.$t('recheck'),
                    color: 'purple',
                    order: 'recharge',
                },
            ],
            dialog: false,
            dialogTitle: '',
        };
    },
    computed: {
        orderData() {
            return Object.values(this.elements).map((element) => ({
                name: element.device,
                description: element.entry_kind === apiConfig.KIND_INDICATOR
                    ? element.indicator : undefined,
            }));
        },
    },
    methods: {
        setAction(item) {
            this.dialogTitle = item.text;
            this.orderCommand = item.order;
        },
        validForm() {
            this.dialog = false;
            this.$emit('sent');
            apiConfig.postActions(this.orderCommand, this.orderData, '')
                .catch(() => { /* FIXME */ });
        },
    },
};
</script>
