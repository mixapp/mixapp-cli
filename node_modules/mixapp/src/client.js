var https = null;
var http = null;
if (typeof XMLHttpRequest === 'undefined') {
    https = require('https');
    http = require('http');
}

export default class Http {

    constructor(params) {

        this.port = params.port || 443;
        this.host = params.host || 'api.mixapp.io';
        this.headers = {};
        this.token = params.token || '';
        this.timeout = params.timeout || 10000;

    }

    get(path, data, headers) {
        return this._request('get', path, data, null, headers);
    }

    post(path, query, data = {}, headers) {
        return this._request('POST', path, query, data, headers);
    }

    del(path, data, headers) {
        return this._request('DELETE', path, data, null, headers);
    }

    setToken(token) {
        this.token = token;
        this.setHeader('X-Auth-Token', token);
    }

    setHeader(name, val) {
        this.headers[name] = val;
    }

    setTimeout() {}


    _node_request(method, path, params = {}, data = {}, headers) {

        headers = {
            ...this.headers,
            ...headers
        };

        if (method.toLowerCase() === 'post') {
            headers['Content-Type'] = 'application/json';
        }

        var query = '';
        if (method.toLowerCase() === 'post' || method.toLowerCase() === 'get' || method.toLowerCase() === 'delete') {
            let _query = [];
            for (let prop in params) {
                _query.push(prop + '=' + params[prop])
            }

            query = _query.join('&');
        }

        const promise = new Promise((resolve, reject) => {
            const provider = this.port === 443 ? https : http;

            const request = provider.request({
                method: method,
                port: this.port,
                path: path + '?' + query,
                host: this.host,
                headers: headers
            }, function(res) {
                let result = "";
                if (res.statusCode !== 200 && res.statusCode !== 201) {
                    return reject({
                        error_code     : res.statusCode,
                        error_message      : res.responseText || 'Invalid statusCode'
                    });
                }

                res.on('data', function(data) {
                    result += data.toString();
                });

                res.on('error', function(err) {
                    return reject({
                        error_code     : res.statusCode,
                        error_message      : err.message
                    });
                });

                res.on('end', function(){
                    return resolve(result);
                })
            });

            request.on('aborted', function () {
                return reject({
                    error_code     : 504,
                    error_message      : 'Request has been aborted by the server'
                });
            });

            request.on('abort', function () {
                return reject({
                    error_code     : 418,
                    error_message      : 'Request has been aborted by the client'
                });
            });

            request.on('error', function (err) {
                return reject({
                    error_code     : 422,
                    error_message      : err.message
                });
            });

            request.setTimeout(this.timeout, function(){
                request.abort();
            });

            if (method.toLowerCase() === 'post') {
                request.write(JSON.stringify(data));
            }

            request.end();
        })
            .then(res => {
                return JSON.parse(res);
            })
            .then(res => {
                if (res.error_code) {
                    return Promise.reject(res);
                }

                if (res.error) {
                    return Promise.reject({
                        error_code     : 500,
                        error_message      : res.error_description
                    });
                }

                return res;
            });

        return promise

    }
    _ajax(method, path, params, data, headers) {
        const promise = new Promise((resolve, reject) => {

            var query = '';
            if (method.toLowerCase() === 'post' || method.toLowerCase() === 'get' || method.toLowerCase() === 'delete') {
                let _query = [];
                for (let prop in params) {
                    _query.push(prop + '=' + params[prop])
                }

                query = _query.join('&');
            }

            var scheme = this.port == 443 ? 'https' : 'http';

            let url = scheme+ '://' + this.host + ':' + this.port + path + '?' + query;
            var xhr = new XMLHttpRequest();

            xhr.timeout = this.timeout;
            xhr.open(method, url, true);

            for (let prop in this.headers) {
                xhr.setRequestHeader(prop, this.headers[prop]);
            }

            for (let prop in headers) {
                xhr.setRequestHeader(prop, headers[prop]);
            }

            if (method.toLowerCase() === 'post') {
                xhr.setRequestHeader('Content-Type', 'application/json');
            }

            xhr.onreadystatechange = () => {
                if (xhr.readyState != 4) return;

                if (xhr.status != 200 && xhr.status != 201) {
                    
                    return reject({
                        error_code     : xhr.status,
                        error_message      : xhr.responseText || 'Invalid statusCode'
                    });
                } else {
                    resolve(xhr.responseText)
                }
            };

            if (method.toLowerCase() === 'post') {
                xhr.send(JSON.stringify(data))
            } else {
                xhr.send()
            }

        })
            .then(res => {
                return JSON.parse(res);
            })
            .then(res => {
                if (res.error_code) {
                    return Promise.reject(res);
                }

                if (res.error) {
                    return Promise.reject({
                        error_code     : 500,
                        error_message  : res.error_description
                    });
                }

                return res;
            });

        return promise;
    }

    _request(method, path, params, data, headers) {
        if (typeof XMLHttpRequest !== 'undefined') {
            return this._ajax(method, path, params, data, headers);
        }
        return this._node_request(method, path, params, data, headers);
    }


}