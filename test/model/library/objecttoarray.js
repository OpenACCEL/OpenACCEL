suite("Object to Array function", function() {
    var compiler;
    var macros;
    var assert;
    var Script;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "model/compiler", "model/fileloader", "model/script"], function(Assert, module, FileLoader, scriptModule) {
            assert = Assert;
            compiler = new module();
            fileLoader = new FileLoader();
            Script = scriptModule;
            fileLoader.load("objecttoarray", "library");
            done();
        });
    });

    suite("__objectToArray()__", function() {

        test("Object with only named keys", function() {
            eval(fileLoader.getContent());
            var input = {a:1, b:2, c:3};

            var expected = [];
            expected.a = 1;
            expected.b = 2;
            expected.c = 3;

            var output = objectToArray(input);
            assert(expected instanceof Array);
            assert.deepEqual(output, expected);
        });

        test("Object with only numerical keys", function() {
            eval(fileLoader.getContent());
            var input = {'0':1, '1':2, '2':3};

            var expected = [1,2,3];

            var output = objectToArray(input);
            assert(expected instanceof Array);
            assert.deepEqual(output, expected);
        });

        test("Object with only numerical keys shuffled", function() {
            eval(fileLoader.getContent());
            var input = {'0':1, '2':3, '1':2};

            var expected = [1,2,3];
            
            var output = objectToArray(input);
            assert(expected instanceof Array);
            assert.deepEqual(output, expected);
        }); 

        test("Object mixed keys", function() {
            eval(fileLoader.getContent());
            var input = {'0':1, a:3, '1':2};

            var expected = [1,2];
            expected.a = 3;
            
            var output = objectToArray(input);
            assert(expected instanceof Array);
            assert.deepEqual(output, expected);
        });

        test("Nested objects named", function() {
            eval(fileLoader.getContent());
            var input = {a:1, b:{x:10,y:11,z:12}, c: 2, d: {q:100}};

            var expected = [];
            expected.a = 1;
            expected.b = [];
            expected.b.x = 10;
            expected.b.y = 11;
            expected.b.z = 12;
            expected.c = 2;
            expected.d = [];
            expected.d.q = 100;
            
            var output = objectToArray(input);
            assert(expected instanceof Array);
            assert.deepEqual(output, expected);
        });

        test("Nested objects numeric", function() {
            eval(fileLoader.getContent());
            var input = {'0':1, '1':{'0':10,'1':11,'2':12}, '2': 2, '3': {'0':100}};

            var expected = [1, [10,11,12], 2, [100]];
            var output = objectToArray(input);
            assert(expected instanceof Array);
            assert.deepEqual(output, expected);
        });

        test("Nested objects mixed", function() {
            eval(fileLoader.getContent());
            var input = {'0':1, '1':{a:10,b:11,'0':12}, x: 'foobar'};

            var expected = [1, [12]];
            expected[1].a = 10;
            expected[1].b = 11;
            expected.x = 'foobar';

            var output = objectToArray(input);
            assert(expected instanceof Array);
            assert.deepEqual(output, expected);
        });

        test("Deep nesting", function() {
            eval(fileLoader.getContent());
            var input = {'0':{'0':{'0':{'0':{'0':{'0':{'0':{'0':{'0':{'0':{'0':{'0':{'0':{'0':{'0':{'0':{'0':{'0':{'0':{'0':'hello'}}}}}}}}}}}}}}}}}}}}

            var expected = [[[[[[[[[[[[[[[[[[[['hello']]]]]]]]]]]]]]]]]]]]
            
            var output = objectToArray(input);
            assert(expected instanceof Array);
            assert.deepEqual(output, expected);
        });                       
    });
});
