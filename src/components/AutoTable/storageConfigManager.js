export default {
    /**
     * Fetch config array from local storage.
     * @returns {array} the config array
     */
    getStorageConfigs() {
        return JSON.parse(localStorage.getItem('storage-configs')) || [];
    },
    /**
     * Update a config file in local storage with new Column Options.
     * @param {object} column the column to update
     * @param {string} configId the id of the config to update
     * @param {string} field (optional) the field to update
     */
    updateStorageColumnOptions(column, configId, field = null) {
        const storageConfigs = this.getStorageConfigs();
        const storageConfigIndex = storageConfigs.findIndex((config) => config.id === configId);

        let config = null;

        if (storageConfigIndex > -1) {
            config = storageConfigs[storageConfigIndex];
        }

        let columnOptions = config?.columnOptions;

        columnOptions = columnOptions || {};
        columnOptions[column.value] = columnOptions[column.value] || {};

        if (field) {
            /* Only update the field */
            columnOptions[column.value][field] = column[field];
        } else {
            /* Update the whole options object */
            columnOptions[column.value] = {
                ...columnOptions[column.value],
                visible: column.visible,
                width: column.width,
            };
        }

        /* Does config exist in storage ? */
        if (storageConfigIndex === -1) {
            storageConfigs.push({
                id: configId,
                columnOptions,
            });
        } else {
            storageConfigs[storageConfigIndex].columnOptions = columnOptions;
        }

        localStorage.setItem('storage-configs', JSON.stringify(storageConfigs));
    },
    /**
     * Save the current order of the columns in local storage.
     * @param {array} headers the current headers of the table
     * @param {string} configId the id of the config to update
     */
    saveOrderedHeadersInStorage(headers, configId) {
        const storageConfigs = this.getStorageConfigs();
        const storageConfigIndex = storageConfigs.findIndex((config) => config.id === configId);

        let config = null;

        if (storageConfigIndex > -1) {
            config = storageConfigs[storageConfigIndex];
        } else {
            config = {};
        }

        const columnOrder = headers.map((header) => header.value);
        config.columnOrder = columnOrder;

        if (storageConfigIndex === -1) {
            storageConfigs.push({
                id: configId,
                columnOrder,
            });
        } else {
            storageConfigs[storageConfigIndex].columnOrder = columnOrder;
        }

        localStorage.setItem('storage-configs', JSON.stringify(storageConfigs));
    },
    /**
     * Look for a config object in local storage matching the current config ID.
     * @param {string} configId the id of the config to find
     * @returns {object} the config object if found, null otherwise
     */
    getStorageConfig(configId) {
        const storageConfigs = this.getStorageConfigs();
        const storageConfigIndex = storageConfigs.findIndex((config) => config.id === configId);

        let config = null;

        if (storageConfigIndex > -1) {
            console.log('Storage config found.');
            config = storageConfigs[storageConfigIndex];
        }

        return config;
    },
};
