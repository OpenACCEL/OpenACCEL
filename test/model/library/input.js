suite("input Library", function() {
    var compiler;
    var macros;
    var assert;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "model/compiler", "model/fileloader", "model/script"], function(Assert, module, FileLoader) {
            assert = Assert;
            compiler = new module();
            fileLoader = new FileLoader();
            fileLoader.load("input", "library");
            fileLoader.load("objecttoarray", "library");
            done();
        });
    });

    /**
     * Numerical input
     *
     * @input       input(42)
     * @expected    [42]
     */
    test("| Numerical input", function() {
        eval(fileLoader.getContent());

        var expected = [42];
        var result = input(42);

        assert.deepEqual(result, expected);
    });

    /**
     * Boolean input
     *
     * @input       input(true)
     * @expected    [true]
     */
    test("| Boolean input", function() {
        eval(fileLoader.getContent());

        var expected = [true];
        var result = input(true);

        assert.deepEqual(result, expected);
    });

    /**
     * String input
     *
     * @input       input('Hello World')
     * @expected    ['Hello World']
     */
    test("| String input", function() {
        eval(fileLoader.getContent());

        var expected = ['Hello World'];
        var result = input('Hello World');

        assert.deepEqual(result, expected);
    });


});
