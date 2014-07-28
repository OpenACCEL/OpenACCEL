suite("iMake Library", function() {
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
            fileLoader.load("iMake", "library");
            fileLoader.load("objecttoarray", "library");
            done();
        });
    });

    /**
     * Test case for iMake.
     *
     * @input       iMake(3,2,2)
     * @expected    [[3,3],[3,3]]
     */
    test("| Test #1", function() {
        eval(fileLoader.getContent());

        var expected = [[3,3],[3,3]];
        var result =iMake(3,2,2);

        assert.deepEqual(result, expected);
    });
});
