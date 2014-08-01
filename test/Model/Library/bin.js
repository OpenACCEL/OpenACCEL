suite("Bin Library", function() {

    var assert;
    var compiler;
    var macros;
    var script;

    setup(function(done) {
        requirejs(["assert", "Model/Compiler", "Model/FileLoader", "Model/Script"], function(Assert, Compiler, FileLoader, Script) {
            assert = Assert;
            compiler = new Compiler();
            fileLoader = new FileLoader();
            fileLoader.load("bin", "library");
            fileLoader.load("factorial", "library");
            fileLoader.load("unaryZip", "library");
            fileLoader.load("binaryZip", "library");
            fileLoader.load("multiaryZip", "library");
            fileLoader.load("zip", "library");
            script = Script;
            exe = { lib: { std: { factorial: factorial }}};
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

    suite("| Units", function() {
        test("| Dimension", function() {
            compiler.loadUnitsLib();
            var input = 
            "a = 25; kg\n" +
            "b = 24\n" +
            "c = 24; kg\n" +
            "x = bin(a, c)\n" +
            "y = bin(a, b)\n" +
            "z = bin(b + 1, c)\n";
            var output = compiler.compile(new script(input));
            output.setUnits(true);

            assert.ok(output.__x__().error);
            assert.ok(output.__y__().error);
            assert.ok(output.__z__().error);
            assert.equal(25, output.__x__().value);
            assert.equal(25, output.__y__().value);
            assert.equal(25, output.__z__().value);
        });

        test("| Dimensionless", function() {
            compiler.loadUnitsLib();
            var input = 
            "x = 25\n" +
            "y = 24\n" +
            "z = bin(x, y)\n";
            var output = compiler.compile(new script(input));
            output.setUnits(true);

            assert.equal(true, output.__z__().isNormal());
            assert.equal(25, output.__z__().value);
            assert.ifError(output.__z__().error);
        });
    });
});
