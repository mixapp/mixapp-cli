const utils = require('../utils');

module.exports = async (path, ...args) => {

    try {
        let cfg = utils.readConfig(path);
        utils.service._client.setToken(cfg.token);
        let wp = await utils.service.workplaces.get(cfg.workplace);
        let process = await wp.processes.get(cfg.processId);
        let start = true

        await process.stop().catch(err => {
            if (err.error_code === 502) {
                start = false;
            }
        })

        let conns = await utils.walkConnectors(path);
        for (let i = 0; i < conns.length; i++) {
            if (conns[i].type === 'start' || conns[i].type === 'stop') {
                continue;
            }
            await process.updateConnector(conns[i].id, conns[i]);
        }

        if (start)
            await process.start();
        console.log('Done.')

    } catch (err) {
        utils.error(err);
    }
};