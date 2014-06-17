suite("ramp Library", function() {
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
            fileLoader.load("ramp", "library");
            fileLoader.load("zip", "library");
            fileLoader.load("multiaryZip", "library");
            fileLoader.load("objecttoarray", "library");
            done();
        });
    });

    suite("ramp", function() {

        /**
         * Test case for ramp.
         * Based on an example of the help documentation
         * 
         * input: ramp(0.5,0,0,1,1)
         * expected: 0.5
         */
        test("Example from help ramp(0.5,0,0,1,1)=0.5", function() {
            eval(fileLoader.getContent());
            assert.deepEqual(ramp(0.5,0,0,1,1), 0.5);
        });

    });
});
