suite("iGaussian Library", function() {
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
            fileLoader.load("iGaussian", "library");
            fileLoader.load("objecttoarray", "library");
            done();
        });
    });

    /**
     * Test case for iGaussian.
     *
     * @input       iGaussian(2,2,1,4)
     * @expected    [[0.25,0.25],[0.25,0.25]]
     */
    test("| Test #1", function() {
        eval(fileLoader.getContent());

        var expected = [[0.25,0.25],[0.25,0.25]];
        var result = iGaussian(2,2,1,4);

        assert.deepEqual(result, expected);
    });
});
