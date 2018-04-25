import Client from './client'
import {Workplace} from './workplace'


export class Service {
    constructor(params={}) {
        Object.defineProperty(this, '_client', {
            enumerable: false,
            value: new Client(params)
        });

        this.workplaces = {
            getList: (skip, limit) => {
                return this._client.get('/v1/workplaces', {
                    skip,
                    limit
                })
                    .then(res => {
                        res.items = res.items.map(it => {
                            return new Workplace(it, this._client);
                        });
                        return res;
                    }); 
            },
            get : (name) => {
                return this._client.get('/v1/workplaces/' + name)
                    .then(res => {
                        return new Workplace(res.result, this._client);
                    });
            },
            create: (data) => {
                return this._client.post('/v1/workplaces', {}, data)
                    .then(res => {
                        return new Workplace(res.result, this._client);
                    });
            }
        };
    }

    get() {
        return this._client.get('/v1', null);
    }

    getPlans() {
        return this._client.get('/v1/plans', null).then(res => res.result);
    }

    getOrders(skip, limit) {
        return this._client.get('/v1/orders', {skip, limit});
    }

    signIn(email, password) {
        return this._client.post('/v1/signin', {}, {
            email: email,
            password: password
        }).then(res => {
            this._client.setToken(res.token);

            return res;
        });
    }

    signUp(data) {
        return this._client.post('/v1/signup', {}, data).then(res => {
            this._client.setToken(res.token);

            return res;
        });
    }

    update(data) {
        return this._client.post('/v1/update', {}, data);
    }

    restore(email) {
        return this._client.post('/v1/repair', {}, {
            email: email
        });
    }

    confirmRestore(token, pass) {
        return this._client.post('/v1/repair/' + token, {}, {
            password: pass
        });
    }

}
