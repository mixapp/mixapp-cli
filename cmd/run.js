const utils = require('../utils');

module.exports = async (path, ...args) => {
    try {
        let cfg = utils.readConfig(path);
        utils.service._client.setToken(cfg.token);
        let wp = await utils.service.workplaces.get(cfg.workplace);
        let p = await wp.processes.get(cfg.processId);

        let conns = await utils.walkConnectors(path);
        for (let i = 0; i < conns.length; i++) {
            if (conns[i].type === 'start' || conns[i].type === 'stop') {
                continue;
            }
            for (let x = 0; x < p.connectors.length; x++) {
                if (conns[i].id != p.connectors[x].id) {
                    continue;
                }
                p.connectors[x].params = conns[i].params;
            }
        }

        require('../process')(process, wp, cfg.workplace, p);
    } catch (err) {
        utils.error(err);
    }
};