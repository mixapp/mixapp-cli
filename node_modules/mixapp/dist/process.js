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