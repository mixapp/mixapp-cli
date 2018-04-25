const utils = require('../utils');

module.exports = async (path, ...args) => {
    try {
        let cfg = utils.readConfig(path);
        utils.service._client.setToken(cfg.token);
        let wp = await utils.service.workplaces.get(cfg.workplace);
        let process = await wp.processes.get(args[0]);
        let metadata = utils.saveConnectorsMetadata(path, process.connectors);
        utils.saveConnectors(path, process.connectors) 
        utils.writeConfig(path, {
            ...cfg,
            processId: process.id
        });
    } catch (err) {
        utils.error(err);
    }
};