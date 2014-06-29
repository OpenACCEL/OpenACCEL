suite("Boolean Library", function() {

    var assert;
    var compiler;
    var macros;
    var script;

    setup(function(done) {
        requirejs(["assert", "model/compiler", "model/fileloader", "model/script"], function(Assert, Compiler, FileLoader, Script) {
            assert = Assert;
            compiler = new Compiler();
            fileLoader = new FileLoader();
            script = Script;
            done();
        });
    });

    /**
     * Basic true statement should not throw an error and work.
     *
     * @input       x = if(true, 10, 30)
     * @expected    x = 10
     */
    test("| Should expand for 'x = if(true,10,30)'", function() {
        var input = "x = if(true,10,30)";
        var output = compiler.compile(new script(input));
        assert.equal(output.__x__(), 10);
    });

    /**
     * Chaining of boolean statements, with false.
     *
     * @input       x = 5
     *              y = if(true, x, 4) + 2
     *              z = if(false, if(false, x, 2), y)
     * @expected    y = 7
     * @expected    z = 2
     */
    test("| Should expand for 'x = 5, y = if(true,x,4) + 2, z = if(false,if(false,x,2),y)'", function() {
        var input = "x = 5\ny = if(true,x,4) + 2\nz = if(true,if(false,x,2),y)";
        var output = compiler.compile(new script(input));
        assert.equal(output.__y__(), 7);
        assert.equal(output.__z__(), 2);
    });

    /**
     * Boolean statement should work inside vectors.
     *
     * @input       x = if([true, false], [1, 2], [3, 4])
     * @expected    x = [1, 4]
     */
    test("| Should expand for 'x = if([true,false], [1,2], [3,4])'", function() {
        var input = "x = if([true,false], [1,2], [3,4])";
        var output = compiler.compile(new script(input));
        assert.deepEqual(output.__x__(), [1, 4]);
    });
});
