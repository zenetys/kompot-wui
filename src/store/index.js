import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export const store = new Vuex.Store({
    state: {
        server_problem: 0,
        last_update_duration: 0,
        server_state: 0,
    },
    mutations: {
        EDIT_SERVER_STATE(state, value) {
            state.server_state = value;
        },
        EDIT_LAST_UPDATE_DURATION(state, value) {
            state.last_update_duration = value;
        },
        EDIT_SERVER_PROBLEM(state, value) {
            state.server_problem = value;
        },
    },
    actions: {
        updateServerProblem( { commit }, value ) {
            commit('EDIT_SERVER_PROBLEM', value);
        },
        updateLastUpdate( { commit } , value ) {
            commit('EDIT_LAST_UPDATE_DURATION', new Date() - value );
        },
        updateServerState( { commit } ) {
            if (!this.state.server_problem && this.state.last_update_duration <= 60000) {
                commit('EDIT_SERVER_STATE', 0);
            } else {
                commit('EDIT_SERVER_STATE', 1);
            }
        }
    },
    getters: {
        serverProblem: state => {
            return state.server_problem;
        },
        lastUpdateDuration: state => {
            return state.last_update_duration;
        },
        serverState: state => {
            return state.server_state;
        }
    },
});