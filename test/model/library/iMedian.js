suite("iMedian Library", function() {
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
            fileLoader.load("iMedian", "library");
            fileLoader.load("objecttoarray", "library");
            done();
        });
    });

    /**
     * Test case for iMedian.
     *
     * @input       iMedian([[1,2,3,4],[1,2,3,4]],5,0)
     * @expected    [[2,2,3,3],[2,2,3,3]]
     */
    test("| Test #1", function() {
        eval(fileLoader.getContent());

        var expected = [[2,2,3,3],[2,2,3,3]];
        var result =iMedian([[1,2,3,4],[1,2,3,4]],5,0);

        assert.deepEqual(result, expected);
    });
});
