suite("Factorial Library", function() {

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
    test("factorial function with variable greater than 100", function() {
        eval(fileLoader.getContent());
        var x = 101;
        expected = /The factorial of numbers less than 0 or greater than 100 are not supported./;
        assert.throws(function() {
            factorial(x);
        }, expected);
    });
});
