suite("Fact Library", function() {
    var compiler;
    var macros;
    var assert;
    var Script;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "model/compiler", "model/fileloader", "model/script"], function(assertModule, module, FileLoader, scriptModule) {
            console.log("Loaded 'Compiler & FileLoader' module.");
            assert = assertModule;
            compiler = new module();
            fileLoader = new FileLoader();
            Script = scriptModule;
            fileLoader.load("fact", "library");
            fileLoader.load("map", "library");
            done();
        });
    });

    suite("fact", function() {

        test("fact function with the 'smallest' variable", function() {
            eval(fileLoader.getContent());
            var x = 0;
            output = fact(x);
            expected = 1;
            assert.deepEqual(output, expected);
        });

        test("fact function with decimal variable", function() {
            eval(fileLoader.getContent());
            var x = 3.2;
            output = fact(x);
            expected = 6;
            assert.deepEqual(output, expected);
        });

        test("fact function with the 'smallest' variable", function() {
            eval(fileLoader.getContent());
            var x = 5;
            output = fact(x);
            expected = 120;
            assert.deepEqual(output, expected);
        });

        test("fact function with the 'largest' variable", function() {
            eval(fileLoader.getContent());
            var x = 100;
            output = fact(x);
            expected = 93326215443944152681699238856266700490715968264381621468592963895217599993229915608941463976156518286253697920827223758251185210916864000000000000000000000000;
            assert.deepEqual(output, expected);
        });

        test("fact function with variable greater than 100", function() {
            eval(fileLoader.getContent());
            var x = 101;
            expected = /The factorial of numbers less than 0 or greater than 100 are not supported./;
            assert.throws(function(){fact(x);}, expected);
        });

    });

});
