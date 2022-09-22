export function setUserFilterConfig(filter) {
    if (filter) {
        var userSessionConfig = getUserSessionConfig();

        var filters = JSON.parse(userSessionConfig).filters;
        filters.push(filter);
        
        setUserConfig({
            filters: filters    
        });
    }
}

export function updateUserFilter(filter) {
    if (filter) {
        var userSessionConfig = getUserSessionConfig();

        var filters = JSON.parse(userSessionConfig).filters;

        var foundIndex = filters.findIndex(x => x.id == filter.id);
        filters[foundIndex] = filter;
        
        setUserConfig({
            filters: filters,    
        });
    }
}

export function deleteUserFilter(filter, index) {
    if (filter) {
        var userSessionConfig = getUserSessionConfig();

        var filters = JSON.parse(userSessionConfig).filters;
        filters.splice(index, 1);

        setUserConfig({
            filters: filters
        })
    }
}

export function saveHistoricFilter(filter) {
    if (filter) {
        var userSessionConfig = getUserSessionConfig();

        var filters = JSON.parse(userSessionConfig).filters;

        var historicArray = [];
        for (let i = 0; i < filters.length; i++) {
            if (filters[i].type=='historic') {
                historicArray.push(filters[i]);
            }
        }

        if ( historicArray.findIndex(data => data.box == filter.box) == -1 ) {
            if (historicArray.length >= 5 ) {
                filters.splice(4, 1);
                filters.unshift(filter);
            } else {
                filters.unshift(filter);
            }
        }

        setUserConfig({
            filters: filters
        })
    }
}

export function setUserConfig(userConfig) {
    var userSessionConfig = getUserSessionConfig();

    var info = {
        user: (userConfig.user) ? userConfig.user : JSON.parse(userSessionConfig).user,
        filters: (userConfig.filters) ? userConfig.filters : JSON.parse(userSessionConfig).filters
    }
    localStorage.setItem('user-config', JSON.stringify(info));
}

export function setDefaultUserConfig() {
    var userSessionConfig = getUserSessionConfig();

    var userConfig = {
        user: (JSON.parse(userSessionConfig)) ? JSON.parse(userSessionConfig).user : null,
        filters: (JSON.parse(userSessionConfig)) ? JSON.parse(userSessionConfig).filters : []
    }
    localStorage.setItem('user-config', JSON.stringify(userConfig));
}

export function getUserSessionConfig() {
    return localStorage.getItem('user-config');
}