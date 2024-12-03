import Vue from 'vue';
import VueI18n from 'vue-i18n';

Vue.use(VueI18n);

const messages = {
    en: {
        // Table Panel Headers
        autoTrack: 'Auto Track',
        checkType: 'cType',
        checksEnabled: 'Checked',
        debug: 'Debug',
        description: 'Description',
        device: 'Device',
        duration: 'Duration',
        email: 'Email',
        groups: 'Groups',
        indicator: 'Indicator',
        ipAddress: 'IP Address',
        lastCheck: 'Last check',
        lastEv: 'Last EV',
        output: 'Output',
        passiveEnabled: 'Passive',
        phone: 'Phone',
        priority: 'Priority',
        recentChange: 'Recent Change',
        site: 'Site',
        sla: 'SLA',
        state: 'State',
        stateFlag: 'Etat',
        stateType: 'State Type',
        tags: 'Tags',
        track: 'Track',
        type: 'Type',

        // Status labels
        acquitted: 'Acquitted',
        disable: 'Disable',
        hostDown: 'Down',
        hostUnreachable: 'Unreachable',
        hostUp: 'UP',
        pending: 'Pending',
        serviceCritical: 'Critical',
        serviceObsolete: 'Outage',
        serviceOk: 'OK',
        serviceUnknown: 'Unknown',
        serviceWarning: 'Warning',

        // Data table messages
        noDataText: 'Aucune donnée disponible',

        // Dark Mode
        darkModeOff: 'Dark mode Off',
        darkModeOn: 'Dark mode On',

        // Column Manage tooltip
        colorManageTitle: 'Show/Hide columns',

        // Actions Buttons tooltips
        acquit: 'Acquit',
        cancel: 'Cancel',
        comment: 'Comment',
        deactiveAlarm: 'Block alarm',
        recheck: 'Recheck',
        resetState: 'Reset state',
        save: 'Save',
        // Button label
        ok: 'OK',
        // Filter bar actions
        cmdPageNext: 'Next page',
        cmdPagePrevious: 'Previous page',
        cmdPause: 'Playing, click to pause',
        cmdPlay: 'Paused, click to play',
        cmdRefresh: 'Reload data',

        // Filters
        filterBoxPlaceholder: 'Enter your filter here',
        filterList: 'Filters',
        filters: {
            alert: 'Alerts',
            all: 'All',
            incident: 'Incident',
            inventaire: 'Inventaire',
            maintenance: 'Maintenance',

            // Nagios filters description
            allProblems: 'All problems',
            any: 'All elements',
            critical: 'Critical',
            known: '+ Known',
            recent: '+ Recent',
        },
        helpFilterQueryFormat: 'Enter here your query. \n' + "Ex: 'server42'",
        saveFilter: 'Save this filter',

        // Columns icons
        ackLabel: 'Acknowledged',
        disabledNotificationsLabel: 'Disabled notifications',
        noAckLabel: 'Not acknowledged',
        noTrackLabel: 'Not tracked',
        openGraphLabel: 'Open graph',
        trackLabel: 'Tracked',

        // Menu
        menuEvents: 'Events',

        // Errors
        dataFetchError: 'Failed to retrieve data!',
        earlyErrorsTitle: 'Found early error, the application could not initialize properly!',

        // Messages from ztable
        ztableCopied: 'Copied!',
        ztableError: 'An error has occurred!',
        ztableLoading: 'Loading...',
        ztableNoData: 'No data',
        ztableNoRender: 'No render',
    },
    fr: {
        // Table Panel Headers
        ack: 'Ack',
        autoTrack: 'Auto tracké',
        checkType: 'cType',
        checksEnabled: 'Testé',
        debug: 'Debug',
        description: 'Description',
        device: 'Équipement',
        duration: 'Durée',
        durationLastStateChange: "Durée changement d'état",
        durationLastUpdate: "Durée depuis dernier changement d'état",
        email: 'Adresse électronique',
        groups: 'Groupes',
        indicator: 'Indicateur',
        ipAddress: 'Adresse IP',
        lastCheck: 'Dernier test',
        lastEv: "Date du dernier changement d'état",
        outage: 'Obsolète',
        output: 'Sortie',
        passiveEnabled: 'Passif',
        phone: 'Téléphone',
        priority: 'Priorité',
        recentChange: 'Changement Récent',
        site: 'Localisation',
        sla: 'SLA',
        state: 'État',
        stateFlag: 'État',
        stateType: 'Etat type',
        tags: 'Tags',
        track: 'Tracké',
        type: 'Type',

        // Status labels
        acquitted: 'Acquitté',
        disable: 'Désactivé',
        hostDown: 'Hors-Service',
        hostUnreachable: 'Injoignable',
        hostUp: 'Actif',
        pending: 'En cours',
        serviceCritical: 'Critique',
        serviceObsolete: 'Obsolète',
        serviceOk: 'Valide',
        serviceUnknown: 'Inconnu',
        serviceWarning: 'Attention',

        // Data table messages
        noDataText: 'Aucune donnée disponible',

        // Dark Mode
        darkModeOff: 'Mode nuit désactivé',
        darkModeOn: 'Mode nuit activé',

        // Column Manage tooltip
        colorManageTitle: 'Activer/Désactiver des colonnes',

        // Actions Buttons tooltips
        acquit: 'Acquitter',
        cancel: 'Annuler',
        comment: 'Commenter',
        deactiveAlarm: 'Désactiver les alarmes',
        recheck: 'Recheck',
        resetState: 'Réinitialiser les états',
        save: 'Enregistrer',
        // Button label
        ok: 'OK',
        // Filter bar actions
        cmdPageNext: 'Page suivante',
        cmdPagePrevious: 'Page précédente',
        cmdPause: 'En lecture, cliquer pour mettre en pause',
        cmdPlay: 'En pause, cliquer pour activer le rechargement automatique',
        cmdRefresh: 'Recharger les données',

        // Filters
        filterBoxPlaceholder: 'Saisissez ici votre filtre',
        filterList: 'Filters',
        filters: {
            alert: 'Alertes',
            all: 'Tous les éléments',
            incident: 'Incidents',
            inventaire: 'Inventaire',
            maintenance: 'Maintenance',

            // Nagios filters description
            allProblems: 'Tous les problèmes',
            any: 'Tous les éléments',
            critical: 'Critique',
            known: '+ Connu',
            recent: '+ Récent',
        },
        helpFilterQueryFormat: 'Saisissez dans ce champ votre requette. \n' + "Ex: 'serveur42'",
        saveFilter: 'Enregistrer ce filtre',

        // Columns icons
        ackLabel: 'Acquitté',
        disabledNotificationsLabel: 'Notifications désactivées',
        noAckLabel: 'Non acquitté',
        noTrackLabel: 'Non tracké',
        openGraphLabel: 'Ouvrir le graphe',
        trackLabel: 'Tracké',

        // Menu
        menuEvents: 'Bac à état',

        // Errors
        dataFetchError: 'La récupération des données a échoué !',
        earlyErrorsTitle: 'Erreur détectée, l\'application n\'a pas pu s\'initialiser correctement !',

        // Messages from ztable
        ztableCopied: 'Copié !',
        ztableError: 'Une erreur s\'est produite !',
        ztableLoading: 'Chargement...',
        ztableNoData: 'Aucun résultat',
        ztableNoRender: 'Pas de rendu',
    },
};

const i18n = new VueI18n({
    locale: 'fr', // set locale
    fallbackLocale: 'fr', // set fallback locale
    messages, // set locale messages
});

export default i18n;
