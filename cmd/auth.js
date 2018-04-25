const utils = require('../utils');


module.exports = async (path, ...args) => {
    try {
        let auth = await utils.userInput([{name:'email'}, {name:'password', hidden: true}])
        let result = await utils.service.signIn(auth.email, auth.password);
        utils.writeConfig(path, {
            token: result.token, 
            workplace: result.user.workplaces[0] ? result.user.workplaces[0] : '',
            processId: ''
        });
    } catch (err) {
        utils.error(err);
    }
};