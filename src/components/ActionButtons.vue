<template>
    <div>
        <v-dialog v-model="dialog" max-width="600px">
            <template v-slot:activator="{ on, attrs }">
                <a v-for="item in butonInfo" :key="item.color" href="#" style="text-decoration:none;"  v-bind="attrs" v-on="on" @click="setAction(item)">
                    <v-tooltip top>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn class="mx-2" fab dark small :color="item.color" v-bind="attrs" v-on="on">
                                <v-icon dark> {{item.icon}} </v-icon>
                            </v-btn>
                        </template>
                        <span>{{item.text}}</span>
                    </v-tooltip>
                </a>
            </template>
            <v-card>
                <v-card-title class="headline mb-5">
                    {{this.dialogTitle}}
                </v-card-title>
                <v-card-text>
                    <v-row>
                        <v-col cols="12">
                            <v-form
                                ref="form">
                                <v-text-field v-show="false" :value="this.order_type"></v-text-field>
                            </v-form>
                        </v-col>
                    </v-row>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="green darken-1" text  @click="dialog = false">
                        {{$t('cancel')}}
                    </v-btn>
                    <v-btn color="green darken-1" text @click="validForm">
                        {{$t('ok')}}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

    </div>
</template>

<style lang="scss">
    
</style>

<script>
import axios from 'axios';

export default {
    props: {
        elements: {
            type: Array,
        }
    },
    data() {
        return {
            butonInfo: [
                { icon: 'mdi-traffic-cone', text: this.$t('acquit'), color: 'primary', dialog: false, order: 'ack' },
                { icon: 'mdi-eight-track', text: this.$t('track'), color: 'cyan darken-3', dialog: false, order: 'track' },
                { icon: 'mdi-lock-reset', text: this.$t('resetState'), color: 'pink', dialog: false, order: 'reset-state' },
                { icon: 'mdi-alarm-off', text: this.$t('deactiveAlarm'), color: 'indigo', dialog: false, order:'alarm-off' },
                { icon: 'mdi-refresh', text: this.$t('recheck'), color: 'purple', dialog: false, order: 'recharge' },
                // { icon: 'mdi-note', text: this.$t('comment'), color: 'cyan', dialog: false, order: 'comment' },
            ],
            dialog: false,
            alarmDialog: false,
            dialogTitle: '',
            order_type: '',
        }
    },
    computed: {
        sendData() {
            return this.$props.elements.map(function(element){
				if (typeof(element) == "undefined") return ;
                return {
                    name: element.name,
                    description: element.description
                }
            });
        }
    },
    methods: {
        setAction(item) {
            this.dialogTitle = item.text;
            this.order_type = item.order;
        },
        validForm() {
            this.dialog = false;
            this.comment = '';
            this.$emit('send-data');
            // Her the request to the web services
            // The elements to give in the POST request is "this.elements" variables
            axios({
                method: 'POST',
                url: '/send-data',
                responseType: 'json',
                data: {
                    order: this.order_type,
                    comment: this.comment,
                    data: this.sendData,
                },
            }).then(response => {
                response;
            });
        },
    },
}
</script>
