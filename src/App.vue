<template>
    <v-app>
        <v-app-bar
            id="navbar"
            app
            :class="$store.data.serverHealthy === false ? 'red lighten-2' : 'blue-grey darken-1'"
            dark
            dense
            clipped-left
        >
            <v-app-bar-nav-icon v-if="$vuetify.breakpoint.mdAndDown" @click.stop="drawer = !drawer" />
            <v-col cols="2">
                <v-img id="img-logo" src="kompot.png" width="30" />
            </v-col>
            <v-toolbar-title :class="$vuetify.breakpoint.xs ? 'text-caption' : 'text-breakpoint-subtitle-1'">
                {{ appTitle ? appTitle + ' - ' : '' }}{{ $route.name }}
            </v-toolbar-title>
            <v-spacer />
            <div v-if="!$vuetify.breakpoint.smAndDown && earlyErrors.length === 0">
                <Cartouche />
            </div>
            <Clock class="ml-4" />

            <template v-if="$vuetify.breakpoint.smAndDown">
                <div class="text-center ml-1">
                    <v-menu :close-on-content-click="false" :nudge-width="200" offset-x>
                        <template #activator="{ on, attrs }">
                            <v-btn color="blue-grey lighten-1" dark v-bind="attrs" fab x-small text v-on="on">
                                <v-icon>mdi-filter</v-icon>
                            </v-btn>
                        </template>
                        <v-card class="pa-2">
                            <Cartouche />
                        </v-card>
                    </v-menu>
                </div>
            </template>
        </v-app-bar>
        <v-navigation-drawer v-model="drawer" class="aside-navigation" app clipped>
            <v-img id="img-logo" src="" width="140" />
            <v-divider />

            <v-list>
                <div v-for="(link, i) in menuSide" :key="i">
                    <v-list-item
                        v-if="!link.subMenus"
                        :key="i"
                        :to="link.to || link.url"
                        :href="link.href"
                        :target="link.target"
                        active-class="deep-cyan--text text--accent-4"
                        class="v-list-item"
                        @mouseup="onMenuItemClicked"
                        @dragend="onMenuItemClicked"
                        @contextmenu="onMenuItemClicked"
                    >
                        <v-list-item-action>
                            <v-icon>{{ link.icon }}</v-icon>
                        </v-list-item-action>
                        <v-list-item-title>{{ link.name }}</v-list-item-title>
                    </v-list-item>

                    <v-list-group
                        v-else
                        :key="link.name"
                        no-action
                        :value="true"
                        active-class="deep-cyan--text text--accent-4"
                        color=""
                        append-icon=""
                        disabled
                    >
                        <template #activator>
                            <v-list-item-action>
                                <v-icon>{{ link.icon }}</v-icon>
                            </v-list-item-action>
                            <v-list-item class="pl-0">
                                <v-list-item-content>
                                    <v-list-item-title>{{ link.name }}</v-list-item-title>
                                </v-list-item-content>
                            </v-list-item>
                        </template>
                        <v-list-item
                            v-for="sublink in link.subMenus"
                            :key="sublink.name"
                            :to="sublink.to || sublink.url"
                            :href="sublink.href"
                            :target="sublink.target"
                        >
                            <v-list-item-title>{{ sublink.name }}</v-list-item-title>
                        </v-list-item>
                    </v-list-group>
                </div>
            </v-list>
            <div class="restart-option">
                <v-list dense>
                    <v-list-item @click="reloadServer()">
                        <v-list-item-icon class="side-menu-icon">
                            <v-icon class="menu-icon"> mdi-restart </v-icon>
                        </v-list-item-icon>
                        <v-list-item-title class="side-menu-title">
                            <span style="font-size: large">Recharger</span>
                        </v-list-item-title>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-icon class="side-menu-icon" />
                        <v-list-item-title>
                            <span> {{ appName }} {{ appVersion }} </span>
                        </v-list-item-title>
                    </v-list-item>
                </v-list>
            </div>
        </v-navigation-drawer>
        <v-main>
            <router-view v-if="earlyErrors.length === 0" />
            <v-container v-else fill-height>
                <v-row no-gutters justify="center">
                    <v-col align="center">
                        <v-alert
                            align="left"
                            type="error"
                            max-width="550"
                            border="left"
                            colored-border
                            elevation="5"
                        >
                            <div class="text-subtitle-2">
                                {{ $t('earlyErrorsTitle') }}
                            </div>

                            <div v-for="(error, i) in earlyErrors" :key="i" class="mt-2 grey lighten-5">
                                <div class="text-body-2">{{ error.toString() }}</div>
                                <div v-if="axiosIsAxiosError(error)" class="text-caption">
                                    {{ axiosError2URL(error) }}
                                </div>
                            </div>
                        </v-alert>
                    </v-col>
                </v-row>
            </v-container>
        </v-main>
    </v-app>
</template>

<script>
import vuetify from '../src/plugins/vuetify';
import Clock from '../src/components/Clock.vue';
import Cartouche from './components/Cartouche.vue';
import i18n from '@/plugins/i18n';
import { axiosIsAxiosError, axiosError2URL } from '@/plugins/utils';

export default {
    name: 'App',
    vuetify: vuetify,

    components: {
        Clock,
        Cartouche,
    },
    props: {
        earlyErrors: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {
            api: '/_search',
            menuSide: [],
            group: null,
            drawer: true,
            appTitle: null,
            appVersion: import.meta.env.VITE_APP_VERSION,
            appName: import.meta.env.VITE_APP_NAME,

            /* expose these to template */
            axiosIsAxiosError,
            axiosError2URL,
        };
    },
    mounted() {
        this.initApp();
    },
    methods: {
        onMenuItemClicked(ev) {
            let item = ev.target.closest('.v-list-item');
            if (item)
                item.blur();
        },
        initApp() {
            document.title = (this.$kConfig.title ? this.$kConfig.title + ' - ' : '') + 'Supervision';
            this.appTitle = this.$kConfig.title;

            // Set the side menu from static config.json
            this.menuSide = this.$kConfig.menu;
            this.menuSide.forEach((entry) => {
                if (!entry.name && entry.i18nName)
                    entry.name = i18n.t(entry.i18nName);
            });

            // Set the IPSLA submenu from config.json
            this.menuSide.forEach((element1) => {
                if (element1.name == 'IPSLA') {
                    element1.subMenus.forEach((element2) => {
                        element2.url += element2.database;
                    });
                }
            });
        },
        reloadServer() {
            /*
            axios({
                url: './reload',
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                responseType: 'json',
            }).then((response) => {
                console.log(response);
                setTimeout(() => {
                    location.reload();
                }, 5000);
            }).catch((error) => {
                console.log(error);
            });
            */
            this.$router.go();
        },
        getDataSources() {
            this.menuSide.forEach((element1) => {
                if (element1.name == 'IPSLA') {
                    this.$kConfig.databases.forEach((element2) => {
                        element1.subMenus.push({
                            name: element2,
                            url: './graph/' + element2,
                        });
                    });
                }
            });
        },
    },
};
</script>

<style lang="scss">
a:link {
    text-decoration: none;
}

// restart menu option on the bottom
.restart-option {
    position: absolute;
    bottom: 0;
    width: 99%;
    bottom: 0px;
    cursor: pointer;
    z-index: 99;
    background-color: white;
}

#kompot-history, #kompot-table-events {
    tbody {
        .status--1 {
            background-color: #b3e5fc;
            .saturated {
                &.text { color: #80d8ff; }
                &.background { background-color: #80d8ff; }
                &.border { border-color: #7bcff5; }
            }
        }
        .status-0 {
            background-color: #c8e6c9;
            .saturated {
                &.text { color: #4caf50; }
                &.background { background-color: #4caf50; }
                &.border { border-color: #47a34b; }
            }
        }
        .status-1 {
            background-color: #fff59d;
            .saturated {
                &.text { color: #ffc400; }
                &.background { background-color: #ffc400; }
                &.border { border-color: #f2cb00; }
            }
        }
        .status-2 {
            background-color: #ef9a9a;
            .saturated {
                &.text { color: #e53935; }
                &.background { background-color: #e53935; }
                &.border { border-color: #d93632; }
            }
        }
        .status-3 {
            background-color: #ffcc80;
            .saturated {
                &.text { color: #f57c00; }
                &.background { background-color: #f57c00; }
                &.border { border-color: #e87500; }
            }
        }
        .is-hard-state-false {
            color: #5d5d5d;
            font-style: italic;
            a {
                color: #3857ce;
            }
        }
    }
}
</style>
