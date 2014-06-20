suite("vMake Library", function() {
    var compiler;
    var macros;
    var assert;
    var Script;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "model/compiler", "model/fileloader", "model/script"], function(assertModule, module, FileLoader, scriptModule) {
            assert = assertModule;
            compiler = new module();
            fileLoader = new FileLoader();
            Script = scriptModule;
            fileLoader.load("vMake", "library");
            done();
        });
    });

    suite("vMake", function() {

        /**
         * Test case for vMake.
         *
         * @input vMake(2,3)
         * @expected [2,2,2]
         */
        test("create an array with 3 times the number 2", function() {
            eval(fileLoader.getContent());
            x = 2;
            y = 3;
            output = vMake(x, y);
            expected = [];
            expected[0] = 2;
            expected[1] = 2;
            expected[2] = 2;
            assert.deepEqual(output, expected);
        });

        /**
         * Test case for vMake.
         *
         * @input vMake("bla",3)
         * @expected ["bla", "bla", "bla"]
         */
        test("create an array with 3 times the string 'bla'", function() {
            eval(fileLoader.getContent());
            x = "bla";
            y = 3;
            output = vMake(x, y);
            expected = [];
            expected[0] = "bla";
            expected[1] = "bla";
            expected[2] = "bla";
            assert.deepEqual(output, expected);
        });

        /**
         * Test case for vMake.
         *
         * @input vMake(2,-3)
         * @expected {}
         */
        test("create an empty array with attempted negative number of elements", function() {
            eval(fileLoader.getContent());
            x = 2;
            y = -3;
            output = vMake(x, y);
            expected = {};
            assert.deepEqual(output, expected);
        });
    });

    suite("expansion", function() {

        /**
         * Test case for expansion of vMake.
         *
         * @input x = vMake('stuff', 2)
         * @expected x = ["stuff", "stuff"]
         */
        test("should expand for 'x = vMake('stuff', 2)'", function() {
            var input = "x = vMake('stuff', 2)";
            expected = [];
            expected[0] = "stuff";
            expected[1] = "stuff";
            var output = compiler.compile(new Script(input));
            assert.deepEqual(output.__x__(), expected);
        });
    });
});
