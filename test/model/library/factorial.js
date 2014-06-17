suite("factorial Library", function() {

    var assert;
    var compiler;
    var macros;

    setup(function(done) {
        requirejs(["assert", "model/compiler", "model/fileloader"], function(Assert, Compiler, FileLoader) {
            assert = Assert;
            compiler = new Compiler();
            fileLoader = new FileLoader();
            fileLoader.load("factorial", "library");
            fileLoader.load("unaryZip", "library");
            fileLoader.load("binaryZip", "library");
            fileLoader.load("multiaryZip", "library");
            fileLoader.load("zip", "library");
            done();
        });
    });

    suite("factorial", function() {

        test("factorial function with the 'smallest' variable", function() {
            eval(fileLoader.getContent());
            var x = 0;
            output = factorial(x);
            expected = 1;
            assert.deepEqual(output, expected);
        });

        test("factorial function with decimal variable", function() {
            eval(fileLoader.getContent());
            var x = 3.2;
            output = factorial(x);
            expected = 6;
            assert.deepEqual(output, expected);
        });

        test("factorial function with the 'smallest' variable", function() {
            eval(fileLoader.getContent());
            var x = 5;
            output = factorial(x);
            expected = 120;
            assert.deepEqual(output, expected);
        });

        test("factorial function with the 'largest' variable", function() {
            eval(fileLoader.getContent());
            var x = 100;
            output = factorial(x);
            expected = 93326215443944152681699238856266700490715968264381621468592963895217599993229915608941463976156518286253697920827223758251185210916864000000000000000000000000;
            assert.deepEqual(output, expected);
        });

        test("factorial function with variable greater than 100", function() {
            eval(fileLoader.getContent());
            var x = 101;
            expected = /The factorial of numbers less than 0 or greater than 100 are not supported./;
            assert.throws(function() {
                factorial(x);
            }, expected);
        });

    });

});
