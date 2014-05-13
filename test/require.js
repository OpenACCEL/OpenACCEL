// Set up various shit so require works with Mocha.

requirejs = require("requirejs");
requirejs.config({
    shim: {
        'underscore': {
            exports: '_'
        }
    },
    baseUrl: __dirname + "/../src/"
});