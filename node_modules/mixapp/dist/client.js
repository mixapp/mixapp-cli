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