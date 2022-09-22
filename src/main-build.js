import Vue from 'vue';
import vuetify from './plugins/vuetify.js';
import wrap from '@vue/web-component-wrapper';
import Panel from './App';

new Vue({
    vuetify: vuetify,
})


const CustomComponent = wrap(Vue, Panel);

window.customElements.define('z-panel', CustomComponent);