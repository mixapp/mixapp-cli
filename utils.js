const fs = require('fs');
const Mixapp = require('mixapp');
const prompt = require('prompt');
const mixappOpts = {
    host: 'api.mixapp.io',
    port: 443
};
const service = new Mixapp.Service(mixappOpts);

const rmDir = (path) => {
    if (fs.existsSync(path)) {
        var files = fs.readdirSync(path);
        for (var i = 0; i < files.length; i++) {
            var filePath = `${path}/${files[i]}`;
            if (fs.statSync(filePath).isFile())
                fs.unlinkSync(filePath);
            else
                rmDir(filePath);
        }
        fs.rmdirSync(path);
    }
};

const concatConnector = async (metadata, id, path) => {

    try {
        let params = JSON.parse(fs.readFileSync(`${path}/${id}.json`).toString());
        let code = {
            before: '',
            after: ''
        };
        let files = fs.readdirSync(path);
        for (let i = 0; i < files.length; i++) {
            if (files[i] === `${id}.json`) {
                continue;
            }

            let file = fs.readFileSync(`${path}/${files[i]}`).toString();
            if (files[i] === 'before.js') {
                code.before = file;
            } else if (files[i] === 'after.js') {
                code.after = file;
            } else {
                params[files[i].replace(/\.[^/.]+$/, '')] = file;
            }
        }
        return {
            params,
            code
        };
    } catch (err) {
        throw err;
    }
};

module.exports.walkConnectors = async (path, cb) => {
    let conns = [];
    let metadata = JSON.parse(fs.readFileSync(`${path}/connectors.json`).toString());

    let files = fs.readdirSync(`${path}/connectors`);
    for (let i = 0; i < files.length; i++) {
        let id = files[i].match(/\(([0-9a-z]+)\)/);
        if (!id) {
            continue;
        }
        id = id[1];
        conns.push({
            id,
            ...metadata[id],
            ...await concatConnector(metadata[id], id, `${path}/connectors/${files[i]}`)
        });
    }
    return conns;
};

module.exports.readConfig = (path) => {
    try {
        let data = fs.readFileSync(`${path}/config.json`);
        return JSON.parse(data);
    } catch (err) {
        throw err;
    }
};

module.exports.writeConfig = (path, data) => {
    let obj = {};
    fs.writeFileSync(`${path}/config.json`, JSON.stringify({
        token: data.token,
        workplace: data.workplace,
        processId: data.processId || ''
    }, null, ' '));
};

module.exports.service = service;

module.exports.saveConnectors = (path, conns) => {
    rmDir(`${path}/connectors`);
    fs.mkdirSync(`${path}/connectors`);
    for (let i = 0; i < conns.length; i++) {
        let dir = `${conns[i].name}(${conns[i].id})`;
        fs.mkdirSync(`${path}/connectors/${dir}`);

        if (conns[i].type === 'expression' || conns[i].type === 'case') {
            fs.writeFileSync(`${path}/connectors/${dir}/code.js`, conns[i].params.code);
            delete conns[i].params.code;
            fs.writeFileSync(`${path}/connectors/${dir}/${conns[i].id}.json`, JSON.stringify(conns[i].params, null, ' '));
        }
        else if (conns[i].type === 'webservice') {
            fs.writeFileSync(`${path}/connectors/${dir}/handler.js`, conns[i].params.handler);
            delete conns[i].params.handler;
            fs.writeFileSync(`${path}/connectors/${dir}/${conns[i].id}.json`, JSON.stringify(conns[i].params, null, ' '));
        } else if (conns[i].type === 'custom') {
            for (let prop in conns[i].schema) {
                if (conns[i].schema[prop].type === 'code') {
                    fs.writeFileSync(`${path}/connectors/${dir}/${prop}.js`, conns[i].params[prop]);
                    delete conns[i].params[prop];
                }
            }
            fs.writeFileSync(`${path}/connectors/${dir}/${conns[i].id}.json`, JSON.stringify(conns[i].params, null, ' '));
        } else {
            fs.writeFileSync(`${path}/connectors/${dir}/${conns[i].id}.json`, JSON.stringify(conns[i].params, null, ' '));
        }
    }
};

module.exports.saveConnectorsMetadata = (path, conns) => {
    let metadata = {};
    for (let i = 0; i < conns.length; i++) {
        metadata[conns[i].id] = {
            type: conns[i].type,
            name: conns[i].name,
            description: conns[i].description
        };
    }
    fs.writeFileSync(`${path}/connectors.json`, JSON.stringify(metadata, null, ' '));
    return metadata;
};

module.exports.userInput = (opts) => {
    return new Promise((resolve, reject) => {
        prompt.start({ message: 'Enter' });
        prompt.get(opts, function (err, result) {
            if (err) {
                return reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

module.exports.error = (err) => {
    if (err instanceof Error) {
        console.error(err);
    } else {
        console.error(err.error_code, err.error_message);
    }
};