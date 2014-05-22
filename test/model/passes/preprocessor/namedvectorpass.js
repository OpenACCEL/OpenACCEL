// Set up various shit so require works with Mocha.
/*
requirejs = require("requirejs");
requirejs.config({
    shim: {
        'underscore': {
            exports: '_'
        }
    },
    baseUrl: __dirname + "/../../../../src"
});
*/

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

        test("replaceBrackets:y = [4, 5]", function() {
            var input = "y = [4, 5]";
            var expected = "y = {'0':4,'1': 5}";
            assert.equal(instance.replaceBrackets(input), expected);
        });

        test("replaceBrackets: y = [4, 5, c: 5]", function() {
            var input = "y = [4, 5, c: 5]";
            var expected = "y = {'0':4,'1': 5, c: 5}";
            assert.equal(instance.replaceBrackets(input), expected);
        });

        test("replaceBrackets:y =  [4, 5, c: [1, 2]]", function() {
            var input = "y = [4,5,c:[1,2]]";
            var expected = "y = {'0':4,'1':5,c:{'0':1,'1':2}}";
            assert.equal(instance.replaceBrackets(input), expected);
        });

        test("replaceBrackets:y = [4, 5, c: [1, 2], [3, 4]]", function() {
            var input = "y = [4,5,c:[1,2],[3, 4]]";
            var expected = "y = {'0':4,'1':5,c:{'0':1,'1':2},'2':{'0':3,'1': 4}}";
            assert.equal(instance.replaceBrackets(input), expected);
        });

        test("replaceBrackets: y = [4, 5, c: [1, 2], [d: 3, 4]]", function() {
            var input = "y = [4,5,c:[1,2],[d: 3, 4]]";
            var expected = "y = {'0':4,'1':5,c:{'0':1,'1':2},'2':{d: 3,'0': 4}}";
            assert.equal(instance.replaceBrackets(input), expected);
        });

        test("replaceBrackets: y = [4, 5, c: [1, 2], [d: [5], 4]]", function() {
            var input = "y = [4,5,c:[1,2],[d: [5], 4]]";
            var expected = "y = {'0':4,'1':5,c:{'0':1,'1':2},'2':{d: {'0':5},'0': 4}}";
            assert.equal(instance.replaceBrackets(input), expected);
        });

        test("replaceBrackets: y = [4, 5, c: [1, 2], [d: [5], 4]] + sin(x)", function() {
            var input = "y = [4,5,c:[1,2],[d: [5], 4]] + sin(x)";
            var expected = "y = {'0':4,'1':5,c:{'0':1,'1':2},'2':{d: {'0':5},'0': 4}} + sin(x)";
            assert.equal(instance.replaceBrackets(input), expected);
        });

        test("replaceBrackets: y = [4, 5, c: [1, 2], [d: [5], 4], e: 4, [10, 12]] + sin(x)", function() {
            var input = "y = [4,5,c:[1,2],[d: [5], 4], e: 4, [10, 12]] + sin(x)";
            var expected = "y = {'0':4,'1':5,c:{'0':1,'1':2},'2':{d: {'0':5},'0': 4}, e: 4,'3': {'0':10,'1': 12}} + sin(x)";
            assert.equal(instance.replaceBrackets(input), expected);
        });

        test("replaceBrackets: y = [f: 2] + [4, 5, c: [1, 2], [d: [5], 4], e: 4, [10, 12]] + sin(x)", function() {
            var input = "y = [f: 2] + [4,5,c:[1,2],[d: [5], 4], e: 4, [10, 12]] + sin(x)";
            var expected = "y = {f: 2} + {'0':4,'1':5,c:{'0':1,'1':2},'2':{d: {'0':5},'0': 4}, e: 4,'3': {'0':10,'1': 12}} + sin(x)";
            assert.equal(instance.replaceBrackets(input), expected);
        });

        test("replaceBrackets: y = 3 + [f: 2] + [4, 5, c: [1, 2], [d: [5], 4], e: 4, [10, 12]] + sin(x)", function() {
            var input = "y = 3 + [f: 2] + [4,5,c:[1,2],[d: [5], 4], e: 4, [10, 12]] + sin(x)";
            var expected = "y = 3 + {f: 2} + {'0':4,'1':5,c:{'0':1,'1':2},'2':{d: {'0':5},'0': 4}, e: 4,'3': {'0':10,'1': 12}} + sin(x)";
            assert.equal(instance.replaceBrackets(input), expected);
        });

        test("replaceBrackets: y = 3 + [f: 2] + [4, 5, c: [1, 2], [d: [5, foo[5]], 4], e: 4, [10, 12]] + sin(x)", function() {
            var input = "y = 3 + [f: 2] + [4,5,c:[1,2],[d: [5, foo[5]], 4], e: 4, [10, 12]] + sin(x)";
            var expected = "y = 3 + {f: 2} + {'0':4,'1':5,c:{'0':1,'1':2},'2':{d: {'0':5,'1': foo[5]},'0': 4}, e: 4,'3': {'0':10,'1': 12}} + sin(x)";
            assert.equal(instance.replaceBrackets(input), expected);
        });

        /**
         * Tests replaceBrackets(). Calls a vector. Should not do anything.
         */
        test('replaceBrackets() calling vector', function() {
            assert.equal(instance.replaceBrackets('y = b[0]'), 'y = b[0]');
        });

        /**
         * Tests replaceBrackets(). Calls a vector in the vector definition. The brackets of the
         * definition should be translated in curly braces, while the called ones should not.
         */
        test('replaceBrackets() calling vector in vector definition', function() {
            assert.equal(instance.replaceBrackets("y = [1, b[0]]"), "y = {'0':1,'1': b[0]}");
        })

        /**
         * replaceBrackets() robustness tests.
         */
        test('replaceBrackets() robustness', function() {
            assert.throws(
                function() {
                    namedVectorPass.replaceBrackets(null);
                });
            assert.throws(
                function() {
                    namedVectorPass.replaceBrackets();
                });
        });

    });
});