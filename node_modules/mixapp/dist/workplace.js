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