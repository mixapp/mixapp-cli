export class Storage {
    constructor(data = {}, workplace, client) {
        for (let prop in data) {
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

    fetch() {
        return this._client.get('/v1/workplaces/' + this._workplace + '/storages/' + this.name)
            .then(res => {
                for (let prop in res.result) {
                    this[prop] = res.result[prop];
                }

                return this;
            });
    }

    update(data) {
        return this._client.post('/v1/workplaces/' + this._workplace + '/storages/' + this.name, {}, data)
            .then(res => {
                for (let prop in res.result) {
                    this[prop] = res.result[prop];
                }

                return this;
            });
    }

    remove() {
        return this._client.del('/v1/workplaces/' + this._workplace + '/storages/' + this.name);
    }

    getIndexes() {
        return this._client.get('/v1/workplaces/' + this._workplace + '/storages/' + this.name + '/indexes');
    }

    createIndex(index) {
        return this._client.post('/v1/workplaces/' + this._workplace + '/storages/' + this.name + '/indexes', {}, index);
    }

    removeIndex(name) {
        name = name.toLowerCase();
        return this._client.del('/v1/workplaces/' + this._workplace + '/storages/' + this.name + '/indexes/' + name);
    }

    setACL(acl) {
        if (!(acl instanceof Array)) {
            throw new Error('acl must be an array')
        }

        this._ACL = acl;
    }

    getDocuments(protocol) {
        const header = {'X-Auth-Keys': this._ACL.join(',')};
        return this._client.post('/v1/workplaces/' + this._workplace + '/storages/' + this.name + '/read', {}, protocol, header)
            .then(res => res.result);
    }

    createDocument(protocol) {
        const header = {'X-Auth-Keys': this._ACL.join(',')};
        return this._client.post('/v1/workplaces/' + this._workplace + '/storages/' + this.name + '/create', {}, protocol, header)
            .then(res => res.result);
    }

    updateDocuments(protocol) {
        const header = {'X-Auth-Keys': this._ACL.join(',')};
        return this._client.post('/v1/workplaces/' + this._workplace + '/storages/' + this.name + '/update', {}, protocol, header)
            .then(res => res.result);
    }

    removeDocuments(protocol) {
        const header = {'X-Auth-Keys': this._ACL.join(',')};
        return this._client.post('/v1/workplaces/' + this._workplace + '/storages/' + this.name + '/delete', {}, protocol, header)
            .then(res => res.result);
    }

    countDocuments(protocol) {
        const header = {'X-Auth-Keys': this._ACL.join(',')}
        return this._client.post('/v1/workplaces/' + this._workplace + '/storages/' + this.name + '/count', {}, protocol, header);
    }
}