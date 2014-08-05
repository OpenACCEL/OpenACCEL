suite("Factorial Library", function() {

    var assert;
    var compiler;
    var macros;
    var script;

    setup(function(done) {
        requirejs(["assert", "Model/Compiler", "Model/FileLoader", "Model/Script"], function(Assert, Compiler, FileLoader, Script) {
            assert = Assert;
            compiler = new Compiler();
            fileLoader = new FileLoader();
            fileLoader.load("factorial", "library");
            fileLoader.load("unaryZip", "library");
            fileLoader.load("binaryZip", "library");
            fileLoader.load("multiaryZip", "library");
            fileLoader.load("zip", "library");
            script = Script;
            done();
        });
    });

    /**
     * The base case of the factorial function is factorial(0) = 1.
     *
     * @input       factorial(0)
     * @expected    1
     */
    test("| Base case", function() {
        eval(fileLoader.getContent());
        var x = 0;
        output = factorial(x);
        expected = 1;
        assert.deepEqual(output, expected);
    });

    /**
     * Factorials of decimal numbers operate on a rounded parameter.
     *
     * @input       x = 3.2
     *              factorial(x)
     * @expected    6
     */
    test("| Decimal", function() {
        eval(fileLoader.getContent());
        var x = 3.2;
        output = factorial(x);
        expected = 6;
        assert.deepEqual(output, expected);
    });

    /**
     * Just a general test case.
     *
     * @input       x = 5
     *              factorial(x)
     * @expected    120
     */
    test("| General", function() {
        eval(fileLoader.getContent());
        var x = 5;
        output = factorial(x);
        expected = 120;
        assert.deepEqual(output, expected);
    });

    /**
     * The biggest support parameter is 100.
     *
     * @input       x = 100
     *              factorial(x)
     * @expected    93326215443944152681699238856266700490715968264381621468592963895217599993229915608941463976156518286253697920827223758251185210916864000000000000000000000000
     */
    test("| Largest", function() {
        eval(fileLoader.getContent());
        var x = 100;
        output = factorial(x);
        expected = 93326215443944152681699238856266700490715968264381621468592963895217599993229915608941463976156518286253697920827223758251185210916864000000000000000000000000;
        assert.deepEqual(output, expected);
    });

    /**
     * Factorials above the highest support number should throw an error.
     *
     * @input       x = 101
     *              factorial(x)
     * @expected    error
     */
    test("| Greater than largest", function() {
        eval(fileLoader.getContent());
        var x = 101;
        expected = /The factorial of numbers less than 0 or greater than 100 are not supported./;
        assert.throws(function() {
            factorial(x);
        }, expected);
    });

    suite("| Units", function() {
        test("| Dimension", function() {
            compiler.setUnits(true);
            var input = 
            "x = 0.5; kg\n" +
            "y = factorial(x)\n";
            var output = compiler.compile(new script(input));

            assert.ok(output.__y__().error);
            assert.equal(1, output.__y__().value);
        });

        test("| Dimensionless", function() {
            compiler.setUnits(true);
            var input = 
            "x = 0.5\n" +
            "y = factorial(x)\n";
            var output = compiler.compile(new script(input));

            assert.equal(true, output.__y__().isNormal());
            assert.equal(1, output.__y__().value);
            assert.ifError(output.__y__().error);
        });
    });
});
