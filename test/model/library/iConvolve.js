suite("iConvolve Library", function() {
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
            fileLoader.load("iConvolve", "library");
            fileLoader.load("objecttoarray", "library");
            done();
        });
    });

    /**
     * Test case for iConvolve.
     *
     * @input       iConvolve([[1,2,3],[1,2,3]],[[4,5,6],[4,5,6]],5,5,0)
     * @expected    [[58,58,64],[58,58,64]]
     */
    test("| Test #1", function() {
        eval(fileLoader.getContent());

        var expected = [[58,58,64],[58,58,64]];
        var result =iConvolve([[1,2,3],[1,2,3]],[[4,5,6],[4,5,6]],5,5,0);

        assert.deepEqual(result, expected);
    });
});
