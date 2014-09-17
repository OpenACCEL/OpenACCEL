// Set up various shit so require works with Mocha.

requirejs = require("requirejs");
requirejs.config({
    baseUrl: __dirname + "/../src/"
});
