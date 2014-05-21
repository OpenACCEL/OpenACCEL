// Set up various shit so require works with Mocha.

requirejs = require("requirejs");
requirejs.config({
    shim: {
        'underscore': {
            exports: '_'
        }
    },
    baseUrl: __dirname + "/../../../../src"
});

suite("namedvectorpass.js", function() {
    // Template module.
    var instance;
    var assert;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "model/passes/preprocessor/namedvectorpass"], function(assertModule, module) {
            console.log("Loaded 'namedVectorPass' module.");
            assert = assertModule;
            instance = new module();
            done();
        });
    });

    suite("namedVectorPass", function() {

        test("replaceBrackets: [4, 5]", function() {
            var input = "[4, 5]";
            var expected = "{'0':4,'1': 5}";
            assert.equal(instance.replaceBrackets(input), expected);
        });

        test("replaceBrackets: [4, 5, c: 5]", function() {
            var input = "[4, 5, c: 5]";
            var expected = "{'0':4,'1': 5, c: 5}";
            assert.equal(instance.replaceBrackets(input), expected);
        });

        test("replaceBrackets: [4, 5, c: [1, 2]]", function() {
            var input = "[4, 5, c: [1, 2]]";
            var expected = "{'0':4,'1': 5, c: {'0':1, '1':2}}";
            assert.equal(instance.replaceBrackets(input), expected);
        });

    //     //TODO: TEST MORE PARSE
    //     /**
    //     /**
    //      * Tests replaceBrackets(). Simple definition of vector.
    //      */
    //     test('replaceBrackets() simple definition', function() {
    //         assert.equal(instance.replaceBrackets('y = [1,2]'), 'y = {1,2}');
    //     });

    //     /**
    //      * Tests replaceBrackets(). Includes a nested vector.
    //      */
    //     test('replaceBrackets() nested vector', function() {
    //         assert.equal(instance.replaceBrackets('y = [1,2,[3,4]]'), 'y = {1,2,{3,4}}');
    //     })
    //     ';'

    //     /**
    //      * Tests replaceBrackets(). Calls a vector. Should not do anything.
    //      */
    //     test('replaceBrackets() calling vector', function() {
    //         assert.equal(instance.replaceBrackets('y = b[0]'), 'y = b[0]');
    //     });

    //     /**
    //      * Tests replaceBrackets(). Calls a named attribute of a vector. Should not do anything.
    //      */
    //     test('replaceBrackets() calling named vector', function() {
    //         assert.equal(instance.replaceBrackets('y = b[\'x\']'), 'y = b[\'x\']');
    //     });

    //     /**
    //      * Tests replaceBrackets(). Calls a vector in the vector definition. The brackets of the
    //      * definition should be translated in curly braces, while the called ones should not.
    //      */
    //     test('replaceBrackets() calling vector in vector definition', function() {
    //         assert.equal(instance.replaceBrackets('y = [1, b[0]]'), 'y = {1, b[0]}');
    //     })

    //     /**
    //      * replaceBrackets() robustness tests.
    //      */
    //     test('replaceBrackets() robustness', function() {
    //         assert.throws(
    //             function() {
    //                 namedVectorPass.replaceBrackets(null);
    //             });
    //         assert.throws(
    //             function() {
    //                 namedVectorPass.replaceBrackets();
    //             });
    //     });

    });
});