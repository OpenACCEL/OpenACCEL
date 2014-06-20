suite("slider Library", function() {
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
            fileLoader.load("slider", "library");
            fileLoader.load("objecttoarray", "library");
            done();
        });
    });

    /**
     * Input without errors
     *
     * @input       slider(1,0,2)
     * @expected    [1,0,2]
     */
    test("| Input without errors", function() {
        eval(fileLoader.getContent());

        var expected = [1,0,2];
        var result = slider(1,0,2);

        assert.deepEqual(result, expected);
    });

    /**
     * Error check: non numeric arguments, test 1
     *
     * @input       slider(0,0,'a')
     * @expected    throw error
     */
    test("| Error check: non numeric arguments, test 1", function() {
        eval(fileLoader.getContent());

        assert.throws(function() {
            slider(0,0,'a');
            
        });
    });

    /**
     * Error check: non numeric arguments, test 2
     *
     * @input       slider(0,'a',1)
     * @expected    throw error
     */
    test("| Error check: non numeric arguments, test 2", function() {
        eval(fileLoader.getContent());

        assert.throws(function() {
            slider(0,'a',1);
            
        });
    });

    /**
     * Error check: non numeric arguments, test 3
     *
     * @input       slider(false,0,1)
     * @expected    throw error
     */
    test("| Error check: non numeric arguments, test 3", function() {
        eval(fileLoader.getContent());

        assert.throws(function() {
            slider(false,0,1);
            
        });
    });

    /**
     * Error check: Default out of bounds
     *
     * @input       slider(2,0,1)
     * @expected    throw error
     */
    test("| Error check: Default out of bounds", function() {
        eval(fileLoader.getContent());

        assert.throws(function() {
            slider(2,0,1);
            
        });
    });

    /**
     * Error check: min > max
     *
     * @input       slider(2,1,0)
     * @expected    throw error
     */
    test("| Error check: min > max", function() {
        eval(fileLoader.getContent());

        assert.throws(function() {
            slider(2,0,1);
            
        });
    });
});
