<template>
  <v-app>
    <v-app-bar id="navbar" app :class="{'red lighten-2': this.serverState==1, 'blue-grey darken-1': this.serverState==0}" dark dense clipped-left>
      <v-app-bar-nav-icon v-if="$vuetify.breakpoint.mdAndDown" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-col cols="2">
        <v-img id="img-logo" src="./../public/kompot.png" width="30"></v-img>
      </v-col>
      <v-toolbar-title :class="($vuetify.breakpoint.xs) ? 'text-caption' : 'text-breakpoint-subtitle-1'">{{appTitle?appTitle+" - ":""}}{{this.$route.name}}</v-toolbar-title>
      <v-spacer></v-spacer>
      <div v-if="!$vuetify.breakpoint.smAndDown">
        <Cartouche/>
      </div>
      <Time/>

        <template v-if="$vuetify.breakpoint.smAndDown">
          <div class="text-center ml-1">
            <v-menu
              :close-on-content-click="false"
              :nudge-width="200"
              offset-x
            >
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  color="blue-grey lighten-1"
                  dark
                  v-bind="attrs"
                  v-on="on"
                  fab
                  x-small
                  text
                >
                  <v-icon>mdi-filter</v-icon>
                </v-btn>
              </template>
              <v-card class="pa-2">
                <Cartouche/>
              </v-card>
            </v-menu>
          </div>
        </template>

    </v-app-bar>
    <v-navigation-drawer
        class="aside-navigation"
        app
        clipped
        v-model="drawer"
      >
        <v-img id="img-logo" src="" width="140"></v-img>
        <v-divider></v-divider>

        <v-list>
          <div v-for="(link, i) in menuSide" :key="i">
              <v-list-item
                  v-if="!link.subMenus"
                  :key="i"
                  :to="link.url"
                  active-class="deep-cyan--text text--accent-4"
                  class="v-list-item"
              >
                  <v-list-item-action>
                      <v-icon>{{ link.icon }}</v-icon>
                  </v-list-item-action>
                  <v-list-item-title v-text="link.name" />
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
                  <template v-slot:activator>
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
                      :to="sublink.url"
                      :key="sublink.name"
                  >
                      <v-list-item-title v-text="sublink.name" />
                  </v-list-item>
              </v-list-group>
          </div>
        </v-list>
        <div class="restart-option">
          <v-list dense >
            <v-list-item @click="reloadServer()">
              <v-list-item-icon class="side-menu-icon">
                <v-icon class="menu-icon">mdi-restart</v-icon>
              </v-list-item-icon>
              <v-list-item-title class="side-menu-title">
                <span style="font-size: large">Recharger</span>
              </v-list-item-title>
            </v-list-item>
            <v-list-item>
              <v-list-item-icon class="side-menu-icon">
              </v-list-item-icon>
              <v-list-item-title>
                <span>
                  {{appName}} {{appVersion}}
                </span>
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </div>
    </v-navigation-drawer>
    <v-main>
      <div class="ml-1 mr-2">
          <router-view></router-view>
      </div>
    </v-main>
  </v-app>
</template>

<style lang="scss">
  a:link {
    text-decoration: none;
  }

  // restart menu option on the bottom
  .restart-option {
    position:absolute;
    bottom:0;
    width: 99%;
    bottom: 0px;
    cursor: pointer;
    z-index: 99;
    background-color: white;
  }
</style>

<script>
import { setDefaultUserConfig } from "./plugins/user-session-config";
import vuetify from '../src/plugins/vuetify';
import Time from '../src/components/Time';
import Cartouche from './components/Cartouche.vue';
import axios from 'axios';
import { mapGetters } from 'vuex';


export default {
  name: 'App',
  vuetify: vuetify,

  components: {
    Time,
    Cartouche,
  },

  computed: {
    ...mapGetters(['serverState']),
  },
  data() {
    return {
      api: "/_search",
      menuSide: [],
      group: null,
      drawer: true,
      config: {},
      appTitle: null,
      appVersion: process.env.VUE_APP_VERSION,
      appName: process.env.VUE_APP_NAME,
    }
  },
  methods: {
    setConfig() {
       axios({
        url: 'static/config.json',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        responseType: 'json'
      }).then((response)=>{
        this.config = response.data;

        document.title = (this.config.title ? this.config.title + " - " : "") + "Supervision";
        this.appTitle = this.config.title;

        // Set the side menu from static config.json
        this.menuSide = this.config.menu;

        // Set the IPSLA submenu from config.json
        this.menuSide.forEach( element1 => {
          if (element1.name=='IPSLA') {
            element1.subMenus.forEach( element2 => {
              element2.url += element2.database;
            });
          }
        });

      });
    },
    reloadServer() {
      axios({
        url: './reload',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        responseType: 'json'
      }).then((response)=>{
        console.log(response);
        setTimeout(() => {
          location.reload();
        }, 5000);
      }).catch((error)=>{
        console.log(error);
      });
    },
    getDataSources() {
      this.menuSide.forEach(element1 => {
        if (element1.name=='IPSLA') {
          this.config.databases.forEach(element2 => {
            element1.subMenus.push(
              {
                name: element2,
                url: "./graph/"+element2,
              }
            )
          });
        }
      });

    }
  },
  mounted() {
    setDefaultUserConfig();
    this.setConfig();
  },
};
</script>
