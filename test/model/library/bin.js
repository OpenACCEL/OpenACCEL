suite("Bin Library", function() {

    var assert;
    var compiler;
    var macros;

    setup(function(done) {
        requirejs(["assert", "model/compiler", "model/fileloader"], function(Assert, Compiler, FileLoader) {
            assert = Assert;
            compiler = new Compiler();
            fileLoader = new FileLoader();
            fileLoader.load("bin", "library");
            fileLoader.load("factorial", "library");
            fileLoader.load("unaryZip", "library");
            fileLoader.load("binaryZip", "library");
            fileLoader.load("multiaryZip", "library");
            fileLoader.load("zip", "library");
            done();
        });
    });

    /**
     * @input       x = 25
     *              y = 24
     *              bin(x, y)
     * @expected    25
     */
    test("| Bin function with the 'smallest' variable", function() {
        eval(fileLoader.getContent());
        var x = 25;
        var y = 24;
        output = bin(x, y);
        expected = 25;
        assert.deepEqual(output, expected);
    });

    /**
     * @input       x = 0
     *              y = 10
     *              bin(x, y)
     * @expected    0
     */
    test("| Bin function with the numerator set to 0", function() {
        eval(fileLoader.getContent());
        var x = 0;
        var y = 10;
        output = bin(x, y);
        expected = 0;
        assert.deepEqual(output, expected);
    });

    /**
     * @input       x = 10
     *              y = 0
     *              bin(x, y)
     * @expected    1
     */
    test("| Bin function with the denominator set to 0", function() {
        eval(fileLoader.getContent());
        var x = 10;
        var y = 0;
        output = bin(x, y);
        expected = 1;
        assert.deepEqual(output, expected);
    });

    /**
     * @input       x = 3.2
     *              y = 1
     *              bin(x, y)
     * @expected    3
     */
    test("| Bin function with decimals", function() {
        eval(fileLoader.getContent());
        var x = 3.2;
        var y = 1;
        output = bin(x, y);
        expected = 3;
        assert.deepEqual(output, expected);
    });

    /**
     * @input       x = 1
     *              y = 5
     *              bin(x, y)
     * @expected    0
     */
    test("| Bin function with 'normal' variables", function() {
        eval(fileLoader.getContent());
        var x = 1;
        var y = 5;
        output = bin(x, y);
        expected = 0;
        assert.deepEqual(output, expected);
    });

    /**
     * The bin function cannot have arguments that are less than zero, and thus should throw an error.
     *
     * @input       x = -1
     *              y = -5
     *              bin(x, y)
     * @expected    error
     */
    test("| Bin function with variable less than 0", function() {
        eval(fileLoader.getContent());
        var x = -1;
        var y = -5;
        expected = /The factorial of numbers less than 0 or greater than 100 are not supported./;
        assert.throws(function() {
            bin(x, y);
        }, expected);
    });

    /**
     * Factorial numbers of less than 0 or greater than 100 are not supported.
     *
     * @input       x = 101
     *              y = 5
     *              bin(x, y)
     * @expected    error
     */
    test("| Bin function with variables greater than 100", function() {
        eval(fileLoader.getContent());
        var x = 101;
        var y = 5;
        expected = /The factorial of numbers less than 0 or greater than 100 are not supported./;
        assert.throws(function() {
            bin(x, y);
        }, expected);
    });
});
