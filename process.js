const EventEmitter = require('events').EventEmitter;
const http = require('http');
const https = require('https');
const url = require('url');
const querystring = require('querystring');
const os = require('os');
var interfaces = os.networkInterfaces();
let PROCESS;
let WORLPLACE;

function error(code, msg) {
    return {
        error_code: code, 
        error_message: msg, 
        more_info: `https://mixapp.github.io/main/errors/#${code}`
    }
}

function parse(request) {
    return new Promise((resolve, reject) => {
        var body = '';
        request.on('aborted', function () {
            reject(error(504, 'Request has been aborted by the server'));
        });

        request.on('abort', function () {
            reject(error(418, 'Request has been aborted by the client'));
        });

        request.on('error', (err) => {
            reject(error(500, err.message));
        });
       
        request.on('data', function (data) {
            body += data;
            if (body.length > 1e6) {
                request.connection.destroy();
                return reject(error(413, 'Request Entity Too Large'));
            }
        });

        request.on('end', () => {
            
            // Читаем Body            
            data = parseContent(request.headers['content-type'], body);
            if (!data) {
                return reject(error(400, 'Bad request'));
            }
            resolve(data);
        });
    });
}

function getUserinfo(ws, token) {
    return new Promise((resolve, reject) => {
        const request = https.request({
            method: 'GET',
            host: 'api.mixapp.io',
            path: `/oidc/${ws}/userinfo`,
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }, (res) => {
            let result = "";
            if (res.statusCode !== 200 && res.statusCode !== 400) {
                return reject(error(res.statusCode, res.responseText || 'Invalid statusCode'));
            }

            res.on('data', function(data) {
                result += data.toString();
            });

            res.on('error', function(err) {
                return reject(error(res.statusCode, err.message));
            });

            res.on('end', function(){
                let result_data;
                try {
                    result_data = JSON.parse(result);
                } catch(err) {
                    return reject(error(400, 'Bad request'));
                }
                
                if (result_data.error) {
                    if (result_data.error === 'access_denied') {
                        return reject(error(403, 'Access forbidden'));
                    }
                    return reject(error(400, result_data.error));
                }
                return resolve(result_data);
            })
        });

        request.on('aborted', function () {
            return reject(error(504, 'Request has been aborted by the server'));
        });

        request.on('abort', function () {
            return reject(error(418, 'Request has been aborted by the client'));
        });

        request.on('error', function (err) {
            return reject(error(422, err.message));
        });

        request.setTimeout(2000, function(){
            request.abort();
        });

        request.end();
    });
}

function parseContent(contentType, data) {
    contentType = contentType || '';
    let result;

    let isJson = contentType.indexOf('application/json') !== -1;
    let isUrlencoded = contentType.indexOf('application/x-www-form-urlencoded') !== -1;

    if (isJson) {
        try {
            result = JSON.parse(data);
        } catch (err) {}
        return result;
    } else if (isUrlencoded) {
        return querystring.parse(data);
    } else if (contentType === '') {
        // Некоторые промышленные системы не указывают content-type в запросах, 
        // пробуем распарсить по содержимому
        try {
            // Парсим как application/json
            result = JSON.parse(data);
        } catch (e) {
            // Парсим как application/x-www-form-urlencoded
            result = querystring.parse(data);
        }
        return result;
    } else {
        return false;
    }
}

class BPM extends EventEmitter {
    constructor(workplace, process) {
        super();
        this.firstConnectorId = '';
        this.__runningWebhooks = {};
        this.connectors = {};

        this.__started = false;

        this.isPersistent = false;

        this.timers = [];

        this.__workplace = workplace;
        this.__processID = process.id;

        Object.defineProperty(this, 'ctx', {
            value: {},
            configurable: false,
            writable: false,
            enumerable: true
        });

        // Webhooks
        this.server = http.createServer((request, response) => {
            
            let auth = request.headers['authorization'] || '';
            let tmp = auth.split(' '); 

            response.writeHead(200, {"Content-Type": "application/json"});

            var _url = url.parse(request.url, true).pathname;
            if (_url[_url.length-1] === '/') {
                _url =_url.substr(0, _url.length-1);
            }

            var params = _url.split('/');
            if (params.length !== 5) {
                response.writeHead(400, {"Content-Type": "application/json"});
                response.write(JSON.stringify(error(618, 'Process not found')));
                response.end();
                return
            }

            let connector;
            for (let item in this.connectors) {
                if (!this.__runningWebhooks[this.connectors[item].id]) {
                    continue
                }
                if (this.connectors[item].type !== 'webservice') {
                    continue;
                }
                if (this.connectors[item].params.action !== params[4]) {
                    continue;
                }
                if (this.connectors[item].params.method !== request.method) {
                    continue;
                }

                connector = this.connectors[item];
                break
            }

            if (!connector) {
                response.writeHead(404, {"Content-Type": "application/json"});                
                response.write(JSON.stringify(error(669, 'Webhook not found')));
                response.end();
                return
            }

            if (!auth) {
                if (connector.params.auth === 'basic') {
                    response.writeHead(401, {"WWW-Authenticate": 'Basic realm="401"'});
                    response.end();
                    return;
                }
    
                if (connector.params.auth === 'oidc') {
                    response.writeHead(401, {"Content-Type": "application/json"});
                    response.write(JSON.stringify(error(401, 'Unauthorized')));
                    response.end();
                    return;
                }
            }

            // Check access
            if (connector.params.auth === 'basic') {
                
                let buf = new Buffer(tmp[1], 'base64');
                let plain_auth = buf.toString(); 
                
                let creds = plain_auth.split(':');
                let username = creds[0] || '';
                let password = creds[1] || '';

                if (username !== connector.params.username || password !== connector.params.password) {
                    response.writeHead(401, {"WWW-Authenticate": 'Basic realm="401"'});
                    response.end();
                    return;
                }
            }
        
            var queryData = url.parse(request.url, true).query;
            var data = {};

            (async () => {
                let user;
                try {
                    if (connector.params.auth === 'oidc') {
                        let auth_header = auth.match(/^Bearer ([a-zA-Z0-9]+)$/);
                        if (!auth_header) {
                            response.writeHead(401, {"Content-Type": "application/json"});
                            response.write(JSON.stringify(error(401, 'Unauthorized')));
                            response.end();
                            return;
                        }
                        let token = auth_header[1];

                        user = await getUserinfo(this.__workplace, token);
                    }

                    if (request.method == 'POST') {
                        data = await parse(request);
                    }
                    await this.responseHandle(request, response, queryData, data, connector, user);
                } catch(err) {
                    if (err.error_code) {
                        response.writeHead(err.error_code, {"Content-Type": "application/json"});
                        response.write(JSON.stringify(err));
                        response.end();
                        return
                    }

                    response.writeHead(500, {"Content-Type": "application/json"});
                    response.write(JSON.stringify(error(500, err.message)));
                    response.end();
                }
                
            })();
        });

        this.server.timeout = 5000;

        this.api = {
            getConnectorById: (id) => {
                return this.connectors[id];
            },
            stopProcess: () => {
                PROCESS.exit();
            },
            log: (msg) => {
                if (typeof msg == 'object') {
                    msg = JSON.stringify(msg);
                }
                console.log('Log: ', msg.toString());
            },
            error: (err) => {
                var res;
                if (err instanceof Error) {
                    res = err.message
                } else {
                    res = JSON.stringify(err);
                }
                console.log('Error: ', res);
            },
            storage: {
                get: (storageName, protocol) => {
                    return new Promise(async (resolve, reject) => {
                        try {
                            let st = await WORLPLACE.storages.get(storageName);
                            let res = await st.getDocuments(protocol)
                            resolve({result: res});
                        } catch (err) {
                            reject(err);
                        }
                    });
                },
                create: (storageName, protocol) => {
                    return new Promise(async (resolve, reject) => {
                        try {
                            let st = await WORLPLACE.storages.get(storageName);
                            let res = await st.createDocument(protocol)
                            resolve({result: res});
                        } catch (err) {
                            reject(err);
                        }
                    });
                },
                update: (storageName, protocol) => {
                    return new Promise(async (resolve, reject) => {
                        try {
                            let st = await WORLPLACE.storages.get(storageName);
                            let res = await st.updateDocuments(protocol);
                            resolve({result: res});
                        } catch (err) {
                            reject(err);
                        }
                    });
                },
                remove: (storageName, protocol) => {
                    return new Promise(async (resolve, reject) => {
                        try {
                            let st = await WORLPLACE.storages.get(storageName);
                            let res = await st.removeDocuments(protocol)
                            resolve({result: res});
                        } catch (err) {
                            reject(err);
                        }
                    });
                },
                count: (storageName, protocol) => {
                    return new Promise(async (resolve, reject) => {
                        try {
                            let st = await WORLPLACE.storages.get(storageName);
                            let res = await st.countDocuments(protocol)
                            resolve(res);
                        } catch (err) {
                            reject(err);
                        }
                    });
                }
            }
        };

        this.on('run', (id, data) => {
            this._run(id, data);
        });


    }

    _addCtxTree(id) {

        var handler = {
            get: (target, key) => {
                if (key === 'toJSON') {
                    return function() { return target; }
                }
                if (typeof target[key] === 'object' && target[key] !== null) {
                    return new Proxy(target[key], handler)
                } else {
                    return target[key];
                }
            },
            set: (target, key, value) => {
                target[key] = value;
                this.journal('upd_ctx', this.ctx);
                return true;
            },
            deleteProperty: (target, key) => {
                delete target[key];
                this.journal('upd_ctx', this.ctx);
                return true;
            },
            defineProperty: (target, prop, val) => {
                target[prop] = val;
                this.journal('upd_ctx', this.ctx);
                return true;
            }
        };

        Object.defineProperty(this.ctx, id, {
            value: new Proxy({}, handler),
            configurable: false,
            writable: false,
            enumerable: true
        });
    }

    journal(event, data) {

        if (this.isPersistent) {
            console.log("journal", event, JSON.stringify(data));
        }

        return Promise.resolve();
    }

    processTimers() {
        (async () => {
            while (true) {
                await this.timeout(10000);
                let now = new Date().getTime();
                for (let i = 0; i < this.timers.length; i++) {
                    let delta = this.timers[i].date.getTime() - now;
                    if (delta <= 0) {
                        this.emit('run', this.timers[i].connectorId, {lastId: this.timers[i].parentId});
                        this.journal("rem_timer", this.timers[i]);
                        this.timers.splice(i, 1);
                        i--;
                    }
                }
            }
        })();
    }

    timeout(delay) {
        return new Promise((resolve, reject) => {setTimeout(resolve, delay)});
    }

    async responseHandle(request, response, query, body, connector, user) {
        try {
            var handler = new Function('bpm', 'require', connector.params.handler);
            var resultData = {query: query, body: body, headers: request.headers};
            var bpm = {
                data: {
                    query: query,
                    body: body,
                    user: user,
                    headers: request.headers
                },
                ctx: this.ctx,
                connector: Object.assign({}, connector),
                setData: (data) => {
                    for (let prop in data) {
                        resultData[prop] = data[prop];
                    }
                },
                ...this.api
            };
            await connector.pre_handler(bpm, require);

            var result = await handler(bpm, require);
            
            if (!result) {
                result = {result:true};
            }

            await connector.post_handler(bpm, require);

            await this.release(connector.id, connector.nextConnectors, resultData);

            response.writeHead(200, {"Content-Type": "application/json"});
            response.write(JSON.stringify(result));
            response.end();
        } catch (e) {
            this.api.error(e);
            
            response.writeHead(400, {"Content-Type": "application/json"});
            response.write(JSON.stringify({error_code: 669, error_message: e.message, more_info: 'https://mixapp.github.io/main/errors/#669'}));
            response.end();
        }
    }

    createTimer(parentId, connector) {
        var timer = {
            id: this.genId(),
            parentId: parentId,
            connectorId: connector.id
        };

        var dateType = connector.params.dateType;
        var delay = parseInt(connector.params.dateDelay) || 0;
        var dateContext = connector.params.dateContext;
        var dateValue = connector.params.dateValue;

        var val;

        switch (dateType) {
            case 'customDate':

                val = new Date(dateValue);
                if (val.toString() === 'Invalid Date') {
                    throw new Error('Invalid value of date for timer');
                }

                break;
            case 'parentStart':

                val = new Date();
                val.setMinutes(val.getMinutes() + delay);

                break;
            case 'context':

                if (!this.ctx[connector.id] || !this.ctx[connector.id][dateContext]) {
                    throw new Error('Invalid context value for timer');
                }

                val = new Date(this.ctx[connector.id][dateContext]);
                if (val.toString() === 'Invalid Date') {
                    throw new Error('Invalid value of date for timer');
                }

                break;

            default:
                throw new Error('Invalid type of date for timer');
        }

        timer.date = val;
        this.journal("add_timer", timer);
        this.timers.push(timer);

    }

    release(id, nextIds, data) {

        return (async () => {
            try {
                for (let i = 0; i < nextIds.length; i++) {
                    let connector = this.api.getConnectorById(nextIds[i]);

                    if (!connector) {
                        continue;
                    }

                    if (connector.type === 'timer') {
                        await this.createTimer(id, connector);
                        continue
                    }

                    if (connector.type === 'webservice') {

                        if (!this.__runningWebhooks[connector.id]) {
                            this.journal("add_webhook", {connectorId: connector.id, parentId: id});
                            this.__runningWebhooks[connector.id] = true;
                        }

                        continue
                    }

                    this.emit('run',connector.id, data);
                }

            } catch (e) {
                throw e;
            }
        })();

    }

    genId() {
        return (parseInt(Math.random() * 10000000000) + "000000").slice(0, 10);
    }

    _run(id, data) {
        var queueId = this.genId();
        this.journal("reg_queue", {id: queueId, connectorId: id, parentId: null, data: data});
        let connector = this.api.getConnectorById(id);
        var resultData = {lastId: id};
        var bpm = {
            data: data,
            connector: Object.assign({}, connector),
            __rejected: false,
            __requeue: false,
            ctx: this.ctx,
            setData: (data) => {
                for (let prop in data) {
                    resultData[prop] = data[prop];
                }
            },
            reject: function(requeue) {
                this.__rejected = true;
                this.__requeue = !!requeue;
            },
            ...this.api
        };

        (async () => {
            try {
                
                await connector.handler(bpm, require);
                
                await this.timeout(0);

                if (!bpm.__rejected) {
                    await this.release(id, bpm.connector.nextConnectors, resultData);
                } else {
                    if (bpm.__requeue) {
                        this.emit('run', id, data);
                    }
                }

                this.journal("rem_queue", {id: queueId, connectorId: id, parentId: null, data: null});

            } catch (err) {
                try {
                    await this.api.error(err);
                } catch (err) {
                    console.error(err);
                }
            }
        })();
    }



    async start(process) {
        try {
            while (true) {

                if (!this.__started) {
                    this.__started = true;
                    for (let item in process.connectors) {
                        this._add(process.connectors[item]);
                    }

                    this._run(this.firstConnectorId, {});
                    this.server.listen(8081);
                    this.processTimers();
                }
                await this.timeout(20000);
            }
        } catch (err) {
            try {
                await this.api.error(err);
                await this.api.stopProcess();
            } catch (err) {
                console.error(err);
            }
            PROCESS.exit();
        }
    }

    _add(connector) {

        Object.defineProperty(connector, 'pre_handler', {
            value: new Function('bpm', 'require', connector.code.before),
            enumerable: false
        });

        Object.defineProperty(connector, 'post_handler', {
            value: new Function('bpm', 'require', connector.code.after),
            enumerable: false
        });

        Object.defineProperty(connector, 'handler', {
            value: new Function('bpm', 'require', connector.code.script),
            enumerable: false
        });

        this.connectors[connector.id] = connector;
        this._addCtxTree(connector.id);

        if (connector.type === 'start') {
            this.firstConnectorId = connector.id;
        }
    }

}

process.on('uncaughtException', (err) => {
    (async () => {
        try {
            await bpm.api.error(err);
            await bpm.api.stopProcess();
        } catch (err) {
            console.error(err);
        }
    })();
});

module.exports = (_process, wp, wp_name, process) => {
    PROCESS = _process;
    WORLPLACE = wp;
    var bpm = new BPM(wp_name, process);
    bpm.start(process);
};