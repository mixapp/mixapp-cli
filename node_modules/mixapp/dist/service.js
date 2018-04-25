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