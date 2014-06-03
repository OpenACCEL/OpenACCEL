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


        test('parse() : a = [1 + 10, b[1 + 2], c[x:2, y:3, 5], b[0, 2, y:3, t5: 4, 6, 3, o93e: 0, 5]', function() {
            var exScript = ['a = [1 + 10, b[1 + 2]]', 'c = [x:2, y:3, a.1]', 'b = [0, 2, y:3, t5: c.0, 6, 3, o93e: 0, 5]'];
            var resultScript = ["a = {'0':1 + 10,'1': b[1 + 2]}", "c = {x:2, y:3,'0': a.1}", "b = {'0':0,'1': 2, y:3, t5: c.0,'2': 6,'3': 3, o93e: 0,'4': 5}"];
            assert.deepEqual(instance.parse(exScript, {}), resultScript);
        });

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

        test('replaceBrackets() y = [1,2,[1,2]]', function() {
            assert.equal(instance.replaceBrackets("y = [1,2,[1,2]]"), "y = {'0':1,'1':2,'2':{'0':1,'1':2}}");
        });

        /**
         * Tests replaceBrackets(). Calls a vector in the vector definition. The brackets of the
         * definition should be translated in curly braces, while the called ones should not.
         */
        test('replaceBrackets() calling vector in vector definition', function() {
            assert.equal(instance.replaceBrackets("y = [1, b[0]]"), "y = {'0':1,'1': b[0]}");
        })

        test('replaceBrackets() y = [[1],[2],[3],[4],[5]]', function() {
            assert.equal(instance.replaceBrackets("y = [[1],[2],[3],[4],[5]]"), "y = {'0':{'0':1},'1':{'0':2},'2':{'0':3},'3':{'0':4},'4':{'0':5}}");
        })

        test('replaceBrackets() y = [[[[1]]], [[1]]]', function() {
            assert.equal(instance.replaceBrackets("y = [[[[1]]], [[1]]]"), "y = {'0':{'0':{'0':{'0':1}}},'1': {'0':{'0':1}}}");
        });

        test('replaceBrackets() y = [[1, a[0 + 10], b[x + 5]],[2],[3],[4],[5]]', function() {
            assert.equal(instance.replaceBrackets("y = [[1,a[0+10],b[x+5]],[2],[3],[4],[5]]"), "y = {'0':{'0':1,'1':a[0+10],'2':b[x+5]},'1':{'0':2},'2':{'0':3},'3':{'0':4},'4':{'0':5}}");
        });

        test('replaceBrackets() y = a[1 + a[0 + b[0]] + c[0]]', function() {
            assert.equal(instance.replaceBrackets("y = a[1 + a[0 + b[0]] + c[0]]"), "y = a[1 + a[0 + b[0]] + c[0]]");
        });

        test('replaceBrackets() y = a[[1,2,3]*[1,2,3]]', function() {
            assert.equal(instance.replaceBrackets("y = a[[1,2,3]*[1,2,3]]"), "y = a[{'0':1,'1':2,'2':3}*{'0':1,'1':2,'2':3}]");
        });

        test('replaceBrackets() y = a[f([1,2,3],[1,2,3])]', function() {
            assert.equal(instance.replaceBrackets("y = a[f([1,2,3],[1,2,3])]"), "y = a[f({'0':1,'1':2,'2':3},{'0':1,'1':2,'2':3})]");
        });

        test('replaceBrackets() y = [[1, a[0 + 10], b[x + 5]],[2],[3],[4],[5],f([1,2,3],[1,2,3])]', function() {
            assert.equal(instance.replaceBrackets("y = [[1,a[0+10],b[x+5]],[2],[3],[4],[5],f([1,2,3],[1,2,3])]"), "y = {'0':{'0':1,'1':a[0+10],'2':b[x+5]},'1':{'0':2},'2':{'0':3},'3':{'0':4},'4':{'0':5},'5':f({'0':1,'1':2,'2':3},{'0':1,'1':2,'2':3})}");
        });
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
