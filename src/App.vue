<template>
    <v-app :class="$store.data.isAnim ? '' : 'z-no-anim'">
        <v-app-bar
            id="navbar"
            app
            :class="$store.data.serverHealthy === false ? 'red lighten-2' : 'blue-grey darken-1'"
            dark
            dense
            clipped-left
        >
            <v-app-bar-nav-icon
                v-if="!$store.data.isMonitor && $vuetify.breakpoint.mdAndDown"
                @click.stop="drawer = !drawer"
            />
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
                    <v-menu :nudge-width="200" offset-x>
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
        <v-navigation-drawer
            v-model="drawer"
            :disable-resize-watcher="$store.data.isMonitor"
            class="aside-navigation"
            app
            clipped
        >
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
                        <v-list-item-title class="z-item-title">
                            {{ link.name }}
                        </v-list-item-title>
                        <v-list-item-action>
                            <a
                                v-if="link.edit_icon"
                                :href="link.editUrl"
                                :style="{ color: hovered ? 'gray' : 'lightgray' }"
                                target="_blank"
                                @click.stop
                                @mouseenter="hovered = true"
                                @mouseleave="hovered = false"
                            >
                                <v-icon>{{ link.edit_icon }}</v-icon>
                            </a>
                        </v-list-item-action>
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
            <div class="z-bottom">
                <v-list dense>
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
            drawer: undefined,
            appTitle: null,
            hovered: false,
            appVersion: import.meta.env.VITE_APP_VERSION,
            appName: import.meta.env.VITE_APP_NAME,

            /* expose these to template */
            axiosIsAxiosError,
            axiosError2URL,
        };
    },
    watch: {
        '$route.query': {
            immediate: true,
            handler(cur, prev) {
                /* Set option flags in the store until another value gets
                 * given in query parameters, meaning flags will persit
                 * even if the corresponding parameter gets removed from
                 * the query string. */
                if (!prev || cur.monitor !== undefined) {
                    this.$store.data.isMonitor = (cur.monitor === '1');
                    this.drawer = this.$store.data.isMonitor ? false : undefined;
                }
                if (!prev || cur.anim !== undefined) {
                    this.$store.data.isAnim = (cur.anim !== '0');
                }
            }
        }
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
                if (entry.type === 'drawio') {
                    entry.url = '/drawio/' + this.$kConfig.drawioViewUrl.replace('%schema%', encodeURIComponent(entry.schema));
                    entry.editUrl = this.$kConfig.drawioEditUrl.replace('%schema%', encodeURIComponent(entry.schema));
                }
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

.z-item-title {
    margin-left: -15px;
}

.z-bottom {
    position: absolute;
    bottom: 0;
    width: 99%;
    bottom: 0px;
    cursor: pointer;
    z-index: 99;
    background-color: white;
}

.z-no-anim * {
    animation: none !important;
    transition: none !important;
}
.z-no-anim .v-dialog {
    box-shadow: none !important;
}
.z-no-anim .v-tooltip__content {
    transform: none !important;
}
</style>
