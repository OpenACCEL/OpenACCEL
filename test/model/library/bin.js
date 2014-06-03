suite("Bin Library", function() {
    var compiler;
    var macros;
    var assert;
    var Script;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "model/compiler", "model/fileloader", "model/script"], function(assertModule, module, FileLoader, scriptModule) {
            console.log("Loaded 'Bin' module.");
            assert = assertModule;
            compiler = new module();
            fileLoader = new FileLoader();
            Script = scriptModule;
            fileLoader.load("bin", "library");
            fileLoader.load("fact", "library");
            fileLoader.load("unaryZip", "library");
            fileLoader.load("binaryZip", "library");
            fileLoader.load("multiaryZip", "library");
            fileLoader.load("zip", "library");
            done();
        });
    });

    suite("bin", function() {

        test("bin function with the 'smallest' variable", function() {
            eval(fileLoader.getContent());
            var x = 25;
            var y = 24;
            output = bin(x, y);
            expected = 25;
            assert.deepEqual(output, expected);
        });

        test("bin function with the numerator set to 0", function() {
            eval(fileLoader.getContent());
            var x = 0;
            var y = 10;
            output = bin(x, y);
            expected = 0;
            assert.deepEqual(output, expected);
        });

        test("bin function with the denominator set to 0", function() {
            eval(fileLoader.getContent());
            var x = 10;
            var y = 0;
            output = bin(x, y);
            expected = 1;
            assert.deepEqual(output, expected);
        });

        test("bin function with decimals", function() {
            eval(fileLoader.getContent());
            var x = 3.2;
            var y = 1;
            output = bin(x, y);
            expected = 3;
            assert.deepEqual(output, expected);
        });

        test("bin function with 'normal' variables", function() {
            eval(fileLoader.getContent());
            var x = 1;
            var y = 5;
            output = bin(x, y);
            expected = 0;
            assert.deepEqual(output, expected);
        });

        test("bin function with variable less than 0", function() {
            eval(fileLoader.getContent());
            var x = -1;
            var y = -5;
            expected = /The factorial of numbers less than 0 or greater than 100 are not supported./;
            assert.throws(function() {
                bin(x, y);
            }, expected);
        });

        test("bin function with variables greater than 100", function() {
            eval(fileLoader.getContent());
            var x = 101;
            var y = 5;
            expected = /The factorial of numbers less than 0 or greater than 100 are not supported./;
            assert.throws(function() {
                bin(x, y);
            }, expected);
        });

    });

});
