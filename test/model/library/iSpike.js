suite("iSpike Library", function() {
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
            fileLoader.load("iSpike", "library");
            fileLoader.load("objecttoarray", "library");
            done();
        });
    });

    /**
     * Test case for iSpike.
     *
     * @input       iSpike(0,0,3,3)
     * @expected    [[1,0,0],[0,0,0],[0,0,0]]
     */
    test("| Test #1", function() {
        eval(fileLoader.getContent());

        var expected = [[1,0,0],[0,0,0],[0,0,0]];
        var result =iSpike(0,0,3,3);

        assert.deepEqual(result, expected);
    });
});
