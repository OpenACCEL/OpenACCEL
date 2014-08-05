suite("Object to Array function", function() {
    var compiler;
    var macros;
    var assert;
    var Script;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "Model/Compiler", "Model/FileLoader", "Model/Script"], function(Assert, module, FileLoader, scriptModule) {
            assert = Assert;
            compiler = new module();
            fileLoader = new FileLoader();
            Script = scriptModule;
            fileLoader.load("objecttoarray", "library");
            done();
        });
    });

    suite("| __objectToArray()__", function() {

        /**
         * Test case for ObjectToArray.
         * 
         * @input objectToArray({a:1, b:2, c:3})
         * @expected [a:1, b:2, c:3] 
         */
        test("| Object with only named keys", function() {
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

        /**
         * Test case for ObjectToArray.
         * 
         * @input objectToArray({'0':1, '1':2, '2':3})
         * @expected [1,2,3] 
         */
        test("| Object with only numerical keys", function() {
            eval(fileLoader.getContent());
            var input = {'0':1, '1':2, '2':3};

            var expected = [1,2,3];

            var output = objectToArray(input);
            assert(expected instanceof Array);
            assert.deepEqual(output, expected);
        });

        /**
         * Test case for ObjectToArray.
         * 
         * @input objectToArray({'0':1, '2':3, '1':2})
         * @expected [1,2,3] 
         */
        test("| Object with only numerical keys shuffled", function() {
            eval(fileLoader.getContent());
            var input = {'0':1, '2':3, '1':2};

            var expected = [1,2,3];
            
            var output = objectToArray(input);
            assert(expected instanceof Array);
            assert.deepEqual(output, expected);
        }); 

        /**
         * Test case for ObjectToArray.
         * 
         * @input objectToArray({'0':1, a:3, '1':2})
         * @expected [1, 2, a:3] 
         */
        test("| Object mixed keys", function() {
            eval(fileLoader.getContent());
            var input = {'0':1, a:3, '1':2};

            var expected = [1,2];
            expected.a = 3;
            
            var output = objectToArray(input);
            assert(expected instanceof Array);
            assert.deepEqual(output, expected);
        });

    });
});
