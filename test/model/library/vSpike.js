suite("vSpike Library", function() {
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
            fileLoader.load("vSpike", "library");
            fileLoader.load("objecttoarray", "library");
            done();
        });
    });

    suite("vSpike", function() {

        /**
         * Test case for vSpike.
         *
         * input:vSpike(0,5)
         * expected: [1,0,0,0,0]
         */
        test("vSpike(0,5) = [1,0,0,0,0]", function() {
            eval(fileLoader.getContent());

            var expected = [1,0,0,0,0];
            var result =vSpike(0,5);

            assert.deepEqual(result, expected);
        });

    });
});
