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