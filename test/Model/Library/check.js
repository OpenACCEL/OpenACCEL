suite("check Library", function() {
    var compiler;
    var macros;
    var assert;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "Model/Compiler", "Model/FileLoader", "Model/Script"], function(Assert, module, FileLoader) {
            assert = Assert;
            compiler = new module();
            fileLoader = new FileLoader();
            fileLoader.load("check", "library");
            fileLoader.load("objecttoarray", "library");
            done();
        });
    });

    /**
     * Input without errors: true
     *
     * @input       check(true)
     * @expected    [true]
     */
    test("| Input without errors: true", function() {
        eval(fileLoader.getContent());

        var expected = [true];
        var result = check(true);

        assert.deepEqual(result, expected);
    });

    /**
     * Input without errors: false
     *
     * @input       check(false)
     * @expected    [false]
     */
    test("| Input without errors: false", function() {
        eval(fileLoader.getContent());

        var expected = [false];
        var result = check(false);

        assert.deepEqual(result, expected);
    });

    /**
     * Error check: non-boolean argument
     *
     * @input       check(1)
     * @expected    throw error
     */
    test("| Error check: non-boolean argument", function() {
        eval(fileLoader.getContent());

        assert.throws(function() {
            check(1);
            
        });
    });

    /**
     * Error check: non-boolean argument
     *
     * @input       check(0)
     * @expected    throw error
     */
    test("| Error check: non-boolean argument", function() {
        eval(fileLoader.getContent());

        assert.throws(function() {
            check(0);
            
        });
    });

});
