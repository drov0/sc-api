const steem = require('steem');
const config = require("./config.js");

class AuthError extends Error {
    constructor(message) {
	super(message);
	this.name = this.constructor.name
    }
}

class BadAuthDataError extends AuthError {}
class InvalidCredentialError extends AuthError {}
class AccessDeniedError extends AuthError {}

/**
 * Tests if an username/private key pair is correct
 * @param {String} username - username of the account
 * @param {String} wif - Private key used for login
 * @param {String} type - Type of the private key, can be "posting", "active" or "owner"
 * @return {boolean} valid - True if the password is correct, false if not (or if the account doesn't exists)
 */
function login_using_wif(username, wif, type) {

    steem.api.setOptions({url: 'https://rpc.buildteam.io'});

    return new Promise(resolve => {
        steem.api.getAccounts([username], function (err, result) {
	    console.log(err);
	    console.log(result);
            // check if the account exists
            if (result.length !== 0) {
                // get the public posting key
                let pubWif = "";
                if (type === "posting")
                    pubWif = result[0].posting.key_auths[0][0];
                else if (type === "active")
                    pubWif = result[0].active.key_auths[0][0];
                else if (type === "owner")
                    pubWif = result[0].owner.key_auths[0][0];
                else if (type === "memo")
                    pubWif = result[0].memo_key;
                let valid = false;
                try {
                    // Check if the private key matches the public one.
                    valid = steem.auth.wifIsValid(wif, pubWif)
                } catch (e) {
                }
                return resolve(valid);
            }
            return resolve(false);
        });
    });
}

function login(data)
{
    return new Promise(async resolve => {

        if (data['username'] && data['wif'] && data['type'] && data['username'] !== "" && data['wif'] !== "" && data['type'] !== "") {
            if (config.admins.indexOf(data['username']) === -1)
                return resolve({error: "You are not authorized to perform this action", ok : false});

            if (data['type'] !== "posting" && data['type'] !== "memo")
                return resolve({error: "Invalid key type"});
            const valid = await login_using_wif(data['username'], data['wif'], data['type']);

            if (valid === false)
                return resolve({error: "Wrong username/wif/type combination", ok : false});

            return resolve({ok : true});
        } else
        {
            return resolve({error: "Invalid login parameters", ok : false});
        }
    });
}

module.exports = {login,
		  login_using_wif,
		  AuthError,
		  BadAuthDataError,
		  InvalidCredentialError,
		  AccessDeniedError}
