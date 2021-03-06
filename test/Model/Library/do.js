suite("do Library", function() {
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
            fileLoader.load("do", "library");
            fileLoader.load("objecttoarray", "library");
            done();
        });
    });

    /**
     * Test case for do.
     * 
     * @input:          __do__('return Math.PI;', ['dummy':[]])
     * @expected:       Math.PI
     */
    test("| __do__('return Math.PI;', ['dummy':[]])=Math.PI", function() {
        eval(fileLoader.getContent());
        assert.deepEqual(__do__('return Math.PI;', {'dummy':[]}), Math.PI);
    });

     /**
     * Test case for do.
     * 
     * @input:          __do__('var k = _arr; return k.sort();', ['arr':[4,3,2,1]])
     * @expected:       [1,2,3,4]
     */
    test("| __do__('var k = _arr; return k.sort();', ['arr':[4,3,2,1]])=[1,2,3,4]", function() {
        eval(fileLoader.getContent());
        assert.deepEqual(__do__('var k = _arr; return k.sort();', {'arr':[4,3,2,1]}), [1,2,3,4]);
    });
});
