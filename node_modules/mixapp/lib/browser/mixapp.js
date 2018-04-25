(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Mixapp = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var https = null;
var http = null;
if (typeof XMLHttpRequest === 'undefined') {
    https = require('https');
    http = require('http');
}

var Http = function () {
    function Http(params) {
        _classCallCheck(this, Http);

        this.port = params.port || 443;
        this.host = params.host || 'api.mixapp.io';
        this.headers = {};
        this.token = params.token || '';
        this.timeout = params.timeout || 10000;
    }

    _createClass(Http, [{
        key: 'get',
        value: function get(path, data, headers) {
            return this._request('get', path, data, null, headers);
        }
    }, {
        key: 'post',
        value: function post(path, query) {
            var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
            var headers = arguments[3];

            return this._request('POST', path, query, data, headers);
        }
    }, {
        key: 'del',
        value: function del(path, data, headers) {
            return this._request('DELETE', path, data, null, headers);
        }
    }, {
        key: 'setToken',
        value: function setToken(token) {
            this.token = token;
            this.setHeader('X-Auth-Token', token);
        }
    }, {
        key: 'setHeader',
        value: function setHeader(name, val) {
            this.headers[name] = val;
        }
    }, {
        key: 'setTimeout',
        value: function setTimeout() {}
    }, {
        key: '_node_request',
        value: function _node_request(method, path) {
            var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

            var _this = this;

            var data = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
            var headers = arguments[4];


            headers = _extends({}, this.headers, headers);

            if (method.toLowerCase() === 'post') {
                headers['Content-Type'] = 'application/json';
            }

            var query = '';
            if (method.toLowerCase() === 'post' || method.toLowerCase() === 'get' || method.toLowerCase() === 'delete') {
                var _query = [];
                for (var prop in params) {
                    _query.push(prop + '=' + params[prop]);
                }

                query = _query.join('&');
            }

            var promise = new Promise(function (resolve, reject) {
                var provider = _this.port === 443 ? https : http;

                var request = provider.request({
                    method: method,
                    port: _this.port,
                    path: path + '?' + query,
                    host: _this.host,
                    headers: headers
                }, function (res) {
                    var result = "";
                    if (res.statusCode !== 200 && res.statusCode !== 201) {
                        return reject({
                            error_code: res.statusCode,
                            error_message: res.responseText || 'Invalid statusCode'
                        });
                    }

                    res.on('data', function (data) {
                        result += data.toString();
                    });

                    res.on('error', function (err) {
                        return reject({
                            error_code: res.statusCode,
                            error_message: err.message
                        });
                    });

                    res.on('end', function () {
                        return resolve(result);
                    });
                });

                request.on('aborted', function () {
                    return reject({
                        error_code: 504,
                        error_message: 'Request has been aborted by the server'
                    });
                });

                request.on('abort', function () {
                    return reject({
                        error_code: 418,
                        error_message: 'Request has been aborted by the client'
                    });
                });

                request.on('error', function (err) {
                    return reject({
                        error_code: 422,
                        error_message: err.message
                    });
                });

                request.setTimeout(_this.timeout, function () {
                    request.abort();
                });

                if (method.toLowerCase() === 'post') {
                    request.write(JSON.stringify(data));
                }

                request.end();
            }).then(function (res) {
                return JSON.parse(res);
            }).then(function (res) {
                if (res.error_code) {
                    return Promise.reject(res);
                }

                if (res.error) {
                    return Promise.reject({
                        error_code: 500,
                        error_message: res.error_description
                    });
                }

                return res;
            });

            return promise;
        }
    }, {
        key: '_ajax',
        value: function _ajax(method, path, params, data, headers) {
            var _this2 = this;

            var promise = new Promise(function (resolve, reject) {

                var query = '';
                if (method.toLowerCase() === 'post' || method.toLowerCase() === 'get' || method.toLowerCase() === 'delete') {
                    var _query = [];
                    for (var prop in params) {
                        _query.push(prop + '=' + params[prop]);
                    }

                    query = _query.join('&');
                }

                var scheme = _this2.port == 443 ? 'https' : 'http';

                var url = scheme + '://' + _this2.host + ':' + _this2.port + path + '?' + query;
                var xhr = new XMLHttpRequest();

                xhr.timeout = _this2.timeout;
                xhr.open(method, url, true);

                for (var _prop in _this2.headers) {
                    xhr.setRequestHeader(_prop, _this2.headers[_prop]);
                }

                for (var _prop2 in headers) {
                    xhr.setRequestHeader(_prop2, headers[_prop2]);
                }

                if (method.toLowerCase() === 'post') {
                    xhr.setRequestHeader('Content-Type', 'application/json');
                }

                xhr.onreadystatechange = function () {
                    if (xhr.readyState != 4) return;

                    if (xhr.status != 200 && xhr.status != 201) {

                        return reject({
                            error_code: xhr.status,
                            error_message: xhr.responseText || 'Invalid statusCode'
                        });
                    } else {
                        resolve(xhr.responseText);
                    }
                };

                if (method.toLowerCase() === 'post') {
                    xhr.send(JSON.stringify(data));
                } else {
                    xhr.send();
                }
            }).then(function (res) {
                return JSON.parse(res);
            }).then(function (res) {
                if (res.error_code) {
                    return Promise.reject(res);
                }

                if (res.error) {
                    return Promise.reject({
                        error_code: 500,
                        error_message: res.error_description
                    });
                }

                return res;
            });

            return promise;
        }
    }, {
        key: '_request',
        value: function _request(method, path, params, data, headers) {
            if (typeof XMLHttpRequest !== 'undefined') {
                return this._ajax(method, path, params, data, headers);
            }
            return this._node_request(method, path, params, data, headers);
        }
    }]);

    return Http;
}();

exports.default = Http;

},{"http":undefined,"https":undefined}],2:[function(require,module,exports){
'use strict';

var _service = require('./service');

var PaaS = {
    Service: _service.Service
};

module.exports = PaaS;

},{"./service":4}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Process = exports.Process = function () {
    function Process(data, workplace, client) {
        _classCallCheck(this, Process);

        for (var prop in data) {
            this[prop] = data[prop];
        }

        Object.defineProperty(this, '_workplace', {
            enumerable: false,
            value: workplace
        });
        Object.defineProperty(this, '_client', {
            enumerable: false,
            value: client
        });
    }

    _createClass(Process, [{
        key: 'fetch',
        value: function fetch() {
            var _this = this;

            return this._client.get('/v1/workplaces/' + this._workplace + '/processes/' + this.id).then(function (res) {
                for (var prop in res.result) {
                    _this[prop] = res.result[prop];
                }
                return _this;
            });
        }
    }, {
        key: 'getContext',
        value: function getContext(skip, limit) {
            return this._client.get('/v1/workplaces/' + this._workplace + '/processes/' + this.id + '/context', {
                skip: skip,
                limit: limit
            });
        }
    }, {
        key: 'getLogs',
        value: function getLogs(skip, limit) {
            return this._client.get('/v1/workplaces/' + this._workplace + '/processes/' + this.id + '/logs', {
                skip: skip,
                limit: limit
            });
        }
    }, {
        key: 'flushLogs',
        value: function flushLogs() {
            return this._client.del('/v1/workplaces/' + this._workplace + '/processes/' + this.id + '/logs', {});
        }
    }, {
        key: 'update',
        value: function update(data) {
            var _this2 = this;

            return this._client.post('/v1/workplaces/' + this._workplace + '/processes/' + this.id, {}, data).then(function (res) {
                for (var prop in res.result) {
                    _this2[prop] = res.result[prop];
                }
                return _this2;
            });
        }
    }, {
        key: 'clone',
        value: function clone(data) {
            return this._client.post('/v1/workplaces/' + this._workplace + '/processes/' + this.id + '/clone', {}, data);
        }
    }, {
        key: 'remove',
        value: function remove() {
            return this._client.del('/v1/workplaces/' + this._workplace + '/processes/' + this.id);
        }

        /*createVariable(data) {
            return this._client.post('/v1/workplaces/' + this._workplace + '/processes/' + this.id + '/variables', data)
                .then(res => {
                    return res.result;
                });
        }
         updateVariable(name, data) {
            return this._client.post('/v1/workplaces/' + this._workplace + '/processes/' + this.id + '/variables/' + name, data)
                .then(res => {
                    return res.result;
                });
        }
         removeVariable(name) {
            return this._client.del('/v1/workplaces/' + this._workplace + '/processes/' + this.id + '/variables/' + name);
        }*/

    }, {
        key: 'start',
        value: function start(data) {
            return this._client.post('/v1/workplaces/' + this._workplace + '/processes/' + this.id + '/start', {}, data);
        }
    }, {
        key: 'stop',
        value: function stop() {
            return this._client.post('/v1/workplaces/' + this._workplace + '/processes/' + this.id + '/stop', {});
        }
    }, {
        key: 'createConnector',
        value: function createConnector(data) {
            return this._client.post('/v1/workplaces/' + this._workplace + '/processes/' + this.id + '/connectors', {}, data).then(function (res) {
                return res.result;
            });
        }
    }, {
        key: 'updateConnector',
        value: function updateConnector(id, data) {
            return this._client.post('/v1/workplaces/' + this._workplace + '/processes/' + this.id + '/connectors/' + id, {}, data).then(function (res) {
                return res.result;
            });
        }
    }, {
        key: 'moveConnector',
        value: function moveConnector(id, x, y) {
            return this._client.post('/v1/workplaces/' + this._workplace + '/processes/' + this.id + '/connectors/' + id + '/move', {}, {
                positionX: x,
                positionY: y
            });
        }
    }, {
        key: 'removeConnector',
        value: function removeConnector(id) {
            return this._client.del('/v1/workplaces/' + this._workplace + '/processes/' + this.id + '/connectors/' + id, {});
        }
    }, {
        key: 'setRelation',
        value: function setRelation(source, target) {
            return this._client.post('/v1/workplaces/' + this._workplace + '/processes/' + this.id + '/connectors/' + source + '/relation/' + target, {});
        }
    }, {
        key: 'setRelationName',
        value: function setRelationName(source, target, name) {
            return this._client.post('/v1/workplaces/' + this._workplace + '/processes/' + this.id + '/connectors/' + source + '/relation/' + target + '/' + name, {});
        }
    }, {
        key: 'unsetRelation',
        value: function unsetRelation(source, target) {
            return this._client.del('/v1/workplaces/' + this._workplace + '/processes/' + this.id + '/connectors/' + source + '/relation/' + target, {});
        }
    }]);

    return Process;
}();

},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Service = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _client = require('./client');

var _client2 = _interopRequireDefault(_client);

var _workplace = require('./workplace');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Service = exports.Service = function () {
    function Service() {
        var _this = this;

        var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, Service);

        Object.defineProperty(this, '_client', {
            enumerable: false,
            value: new _client2.default(params)
        });

        this.workplaces = {
            getList: function getList(skip, limit) {
                return _this._client.get('/v1/workplaces', {
                    skip: skip,
                    limit: limit
                }).then(function (res) {
                    res.items = res.items.map(function (it) {
                        return new _workplace.Workplace(it, _this._client);
                    });
                    return res;
                });
            },
            get: function get(name) {
                return _this._client.get('/v1/workplaces/' + name).then(function (res) {
                    return new _workplace.Workplace(res.result, _this._client);
                });
            },
            create: function create(data) {
                return _this._client.post('/v1/workplaces', {}, data).then(function (res) {
                    return new _workplace.Workplace(res.result, _this._client);
                });
            }
        };
    }

    _createClass(Service, [{
        key: 'get',
        value: function get() {
            return this._client.get('/v1', null);
        }
    }, {
        key: 'getPlans',
        value: function getPlans() {
            return this._client.get('/v1/plans', null).then(function (res) {
                return res.result;
            });
        }
    }, {
        key: 'getOrders',
        value: function getOrders(skip, limit) {
            return this._client.get('/v1/orders', { skip: skip, limit: limit });
        }
    }, {
        key: 'signIn',
        value: function signIn(email, password) {
            var _this2 = this;

            return this._client.post('/v1/signin', {}, {
                email: email,
                password: password
            }).then(function (res) {
                _this2._client.setToken(res.token);

                return res;
            });
        }
    }, {
        key: 'signUp',
        value: function signUp(data) {
            var _this3 = this;

            return this._client.post('/v1/signup', {}, data).then(function (res) {
                _this3._client.setToken(res.token);

                return res;
            });
        }
    }, {
        key: 'update',
        value: function update(data) {
            return this._client.post('/v1/update', {}, data);
        }
    }, {
        key: 'restore',
        value: function restore(email) {
            return this._client.post('/v1/repair', {}, {
                email: email
            });
        }
    }, {
        key: 'confirmRestore',
        value: function confirmRestore(token, pass) {
            return this._client.post('/v1/repair/' + token, {}, {
                password: pass
            });
        }
    }]);

    return Service;
}();

},{"./client":1,"./workplace":6}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Storage = exports.Storage = function () {
    function Storage() {
        var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var workplace = arguments[1];
        var client = arguments[2];

        _classCallCheck(this, Storage);

        for (var prop in data) {
            this[prop] = data[prop];
        }

        Object.defineProperty(this, '_ACL', {
            enumerable: false,
            value: []
        });

        Object.defineProperty(this, '_workplace', {
            enumerable: false,
            value: workplace
        });
        Object.defineProperty(this, '_client', {
            enumerable: false,
            value: client
        });
    }

    _createClass(Storage, [{
        key: 'fetch',
        value: function fetch() {
            var _this = this;

            return this._client.get('/v1/workplaces/' + this._workplace + '/storages/' + this.name).then(function (res) {
                for (var prop in res.result) {
                    _this[prop] = res.result[prop];
                }

                return _this;
            });
        }
    }, {
        key: 'update',
        value: function update(data) {
            var _this2 = this;

            return this._client.post('/v1/workplaces/' + this._workplace + '/storages/' + this.name, {}, data).then(function (res) {
                for (var prop in res.result) {
                    _this2[prop] = res.result[prop];
                }

                return _this2;
            });
        }
    }, {
        key: 'remove',
        value: function remove() {
            return this._client.del('/v1/workplaces/' + this._workplace + '/storages/' + this.name);
        }
    }, {
        key: 'getIndexes',
        value: function getIndexes() {
            return this._client.get('/v1/workplaces/' + this._workplace + '/storages/' + this.name + '/indexes');
        }
    }, {
        key: 'createIndex',
        value: function createIndex(index) {
            return this._client.post('/v1/workplaces/' + this._workplace + '/storages/' + this.name + '/indexes', {}, index);
        }
    }, {
        key: 'removeIndex',
        value: function removeIndex(name) {
            name = name.toLowerCase();
            return this._client.del('/v1/workplaces/' + this._workplace + '/storages/' + this.name + '/indexes/' + name);
        }
    }, {
        key: 'setACL',
        value: function setACL(acl) {
            if (!(acl instanceof Array)) {
                throw new Error('acl must be an array');
            }

            this._ACL = acl;
        }
    }, {
        key: 'getDocuments',
        value: function getDocuments(protocol) {
            var header = { 'X-Auth-Keys': this._ACL.join(',') };
            return this._client.post('/v1/workplaces/' + this._workplace + '/storages/' + this.name + '/read', {}, protocol, header).then(function (res) {
                return res.result;
            });
        }
    }, {
        key: 'createDocument',
        value: function createDocument(protocol) {
            var header = { 'X-Auth-Keys': this._ACL.join(',') };
            return this._client.post('/v1/workplaces/' + this._workplace + '/storages/' + this.name + '/create', {}, protocol, header).then(function (res) {
                return res.result;
            });
        }
    }, {
        key: 'updateDocuments',
        value: function updateDocuments(protocol) {
            var header = { 'X-Auth-Keys': this._ACL.join(',') };
            return this._client.post('/v1/workplaces/' + this._workplace + '/storages/' + this.name + '/update', {}, protocol, header).then(function (res) {
                return res.result;
            });
        }
    }, {
        key: 'removeDocuments',
        value: function removeDocuments(protocol) {
            var header = { 'X-Auth-Keys': this._ACL.join(',') };
            return this._client.post('/v1/workplaces/' + this._workplace + '/storages/' + this.name + '/delete', {}, protocol, header).then(function (res) {
                return res.result;
            });
        }
    }, {
        key: 'countDocuments',
        value: function countDocuments(protocol) {
            var header = { 'X-Auth-Keys': this._ACL.join(',') };
            return this._client.post('/v1/workplaces/' + this._workplace + '/storages/' + this.name + '/count', {}, protocol, header);
        }
    }]);

    return Storage;
}();

},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Workplace = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _storage = require('./storage');

var _process = require('./process');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Workplace = exports.Workplace = function () {
    function Workplace() {
        var _this = this;

        var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var client = arguments[1];

        _classCallCheck(this, Workplace);

        Object.defineProperty(this, '_client', {
            enumerable: false,
            value: client
        });

        Object.defineProperty(this, 'storages', {
            enumerable: false,
            value: {
                getAll: function getAll() {
                    return _this._client.get('/v1/workplaces/' + _this.name + '/storages').then(function (res) {
                        return res.result.map(function (item) {
                            return new _storage.Storage(item, _this.name, _this._client);
                        });
                    });
                },

                create: function create(data) {
                    return _this._client.post('/v1/workplaces/' + _this.name + '/storages', {}, data).then(function (res) {
                        return new _storage.Storage(res.result, _this.name, _this._client);
                    });
                },

                get: function get(name) {
                    return _this._client.get('/v1/workplaces/' + _this.name + '/storages/' + name).then(function (res) {
                        return new _storage.Storage(res.result, _this.name, _this._client);
                    });
                }
            }
        });

        Object.defineProperty(this, 'processes', {
            enumerable: false,
            value: {
                search: function search(filter) {
                    return _this._client.get('/v1/workplaces/' + _this.name + '/processes', filter).then(function (res) {
                        return {
                            total: res.total,
                            items: res.items.map(function (item) {
                                return new _process.Process(item, _this.name, _this._client);
                            })
                        };
                    });
                },

                get: function get(id) {
                    return _this._client.get('/v1/workplaces/' + _this.name + '/processes/' + id).then(function (res) {
                        return new _process.Process(res.result, _this.name, _this._client);
                    });
                },

                create: function create(data) {
                    return _this._client.post('/v1/workplaces/' + _this.name + '/processes', {}, data).then(function (res) {
                        return new _process.Process(res.result, _this.name, _this._client);
                    });
                }
            }
        });

        Object.defineProperty(this, 'marketplace', {
            enumerable: false,
            value: {
                getConnectors: function getConnectors(skip, limit) {
                    return _this._client.get('/v1/workplaces/' + _this.name + '/marketplace/connectors', { skip: skip, limit: limit });
                },
                installConnector: function installConnector(id) {
                    return _this._client.post('/v1/workplaces/' + _this.name + '/marketplace/connectors/' + id + '/install', {}, {});
                },
                getProcesses: function getProcesses(skip, limit) {
                    return _this._client.get('/v1/workplaces/' + _this.name + '/marketplace/processes', { skip: skip, limit: limit });
                },
                installProcess: function installProcess(id) {
                    var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

                    return _this._client.post('/v1/workplaces/' + _this.name + '/marketplace/processes/' + id + '/install', {}, data);
                }
            }
        });

        Object.defineProperty(this, 'settings', {
            enumerable: false,
            value: {
                oidc: {
                    get: function get() {
                        return _this._client.get('/v1/workplaces/' + _this.name + '/oidc');
                    },
                    update: function update(data) {
                        return _this._client.post('/v1/workplaces/' + _this.name + '/oidc', {}, data);
                    },
                    refreshToken: function refreshToken() {
                        return _this._client.post('/v1/workplaces/' + _this.name + '/oidc/token', {}, {});
                    }
                }
            }
        });

        Object.defineProperty(this, 'oidc', {
            enumerable: false,
            value: {
                getClients: function getClients(token) {
                    return _this._client.get('/oidc/' + _this.name + '/registration', {}, { 'Authorization': 'Bearer ' + token }).then(function (res) {
                        return { result: res };
                    });
                },
                createClient: function createClient(token, data) {
                    return _this._client.post('/oidc/' + _this.name + '/registration', {}, data, { 'Authorization': 'Bearer ' + token });
                },
                getClient: function getClient(token, id) {
                    return _this._client.get('/oidc/' + _this.name + '/registration', { client_id: id }, { 'Authorization': 'Bearer ' + token });
                },
                updateClient: function updateClient(token, id, data) {
                    return _this._client.post('/oidc/' + _this.name + '/registration', { client_id: id }, data, { 'Authorization': 'Bearer ' + token });
                },
                removeClient: function removeClient(token, id) {
                    return _this._client.del('/oidc/' + _this.name + '/registration', { client_id: id }, { 'Authorization': 'Bearer ' + token });
                }
            }
        });

        this.name = params.name;
        this.title = params.title;
        this.plan = params.plan;
        this.npm = params.npm;
    }

    _createClass(Workplace, [{
        key: 'stats',
        value: function stats() {
            return this._client.get('/v1/workplaces/' + this.name + '/statistics');
        }
    }, {
        key: 'fetch',
        value: function fetch() {
            var _this2 = this;

            return this._client.get('/v1/workplaces/' + this.name).then(function (res) {
                for (var prop in res.result) {
                    _this2[prop] = res.result[prop];
                }

                return res;
            });
        }
    }, {
        key: 'getBills',
        value: function getBills(skip, limit) {
            return this._client.get('/v1/workplaces/' + this.name + '/billing', { skip: skip, limit: limit });
        }
    }, {
        key: 'buyPlan',
        value: function buyPlan(plan) {
            return this._client.post('/v1/workplaces/' + this.name + '/billing', {}, plan).then(function (res) {
                return res.result;
            });
        }
    }, {
        key: 'getKeys',
        value: function getKeys() {
            return this._client.get('/v1/workplaces/' + this.name + '/keys');
        }
    }, {
        key: 'createKey',
        value: function createKey(model) {
            return this._client.post('/v1/workplaces/' + this.name + '/keys', {}, model);
        }
    }, {
        key: 'updateKey',
        value: function updateKey(id) {
            return this._client.post('/v1/workplaces/' + this.name + '/keys/' + id, {}, {});
        }
    }, {
        key: 'removeKey',
        value: function removeKey(id) {
            return this._client.del('/v1/workplaces/' + this.name + '/keys/' + id);
        }
    }, {
        key: 'update',
        value: function update(data) {
            var _this3 = this;

            data = _extends({
                name: this.name
            }, data);

            return this._client.post('/v1/workplaces/' + this.name, {}, data).then(function (res) {
                for (var prop in res.result) {
                    _this3[prop] = res.result[prop];
                }

                return res;
            });
        }
    }, {
        key: 'remove',
        value: function remove() {
            return this._client.del('/v1/workplaces/' + this.name);
        }
    }, {
        key: 'getConnectors',
        value: function getConnectors(filter) {
            return this._client.get('/v1/workplaces/' + this.name + '/connectors', filter);
        }
    }, {
        key: 'uploadConnector',
        value: function uploadConnector(model) {
            return this._client.post('/v1/workplaces/' + this.name + '/connectors', {}, model);
        }
    }, {
        key: 'removeConnector',
        value: function removeConnector(id) {
            return this._client.del('/v1/workplaces/' + this.name + '/connectors/' + id);
        }
    }, {
        key: 'getConnector',
        value: function getConnector(id) {
            return this._client.get('/v1/workplaces/' + this.name + '/connectors/' + id, {}).then(function (res) {
                return res.result;
            });
        }
    }]);

    return Workplace;
}();

},{"./process":3,"./storage":5}]},{},[2])(2)
});