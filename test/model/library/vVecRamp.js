suite("vVecRamp Library", function() {
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
            fileLoader.load("vVecRamp", "library");
            fileLoader.load("objecttoarray", "library");
            done();
        });
    });

    suite("vVecRamp", function() {
        /**
         * Test case for vVecRamp.
         *
         * @input: vVecRamp([10,20,30,40],[0,100,150,0],30)
         * @expected: 150
         */
        test("vVecRamp([10,20,30,40],[0,100,150,0],30) = 150", function() {
            eval(fileLoader.getContent());

            var expected = 150;
            var result = vVecRamp([10, 20, 30, 40], [0, 100, 150, 0], 30);

            assert.deepEqual(result, expected);
        });

        /**
         * Test case for vVecRamp.
         *
         * @input: vVecRamp([100,80,60,40],[0,5,10,0],90)
         * @expected: 2.5
         */
        test("vVecRamp([100,80,60,40],[0,5,10,0],90) = 2.5", function() {
            eval(fileLoader.getContent());

            var expected = 2.5;
            var result = vVecRamp([100, 80, 60, 40], [0, 5, 10, 0], 90);

            assert.deepEqual(result, expected);
        });

        /**
         * Test case for vVecRamp.
         *
         * @input: vVecRamp([24,16,28,9,16,36],[14,7,28,4,4,0],30)
         * @expected: 21
         */
        test("vVecRamp([24,16,28,9,16,36],[14,7,28,4,4,0],30) = 21", function() {
            eval(fileLoader.getContent());

            var expected = 21;
            var result = vVecRamp([24, 16, 28, 9, 16, 36], [14, 7, 28, 4, 4, 0], 30);

            assert.deepEqual(result, expected);
        });


    });
});
