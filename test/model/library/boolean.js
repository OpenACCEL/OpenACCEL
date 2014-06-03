suite("Boolean Library", function() {

    var assert;
    var compiler;
    var macros;
    var script;

    setup(function(done) {
        requirejs(["assert", "model/compiler", "model/fileloader", "model/script"], function(Assert, Compiler, FileLoader, Script) {
            console.log("Loaded 'Boolean' module.");
            assert = Assert;
            compiler = new Compiler();
            fileLoader = new FileLoader();
            script = Script;
            done();
        });
    });

    suite("expansion", function() {

        test("should expand for 'x = if(true,10,30)'", function() {
            var input = "x = if(true,10,30)";
            var output = compiler.compile(new script(input));
            assert.equal(output.exe.x(), 10);
        });

        test("should expand for 'x = 5, y = if(true,x,4) + 2, z = if(false,if(false,x,2),y)'", function() {
            var input = "x = 5\ny = if(true,x,4) + 2\nz = if(true,if(false,x,2),y)";
            var output = compiler.compile(new script(input));
            assert.equal(output.exe.y(), 7);
            assert.equal(output.exe.z(), 2);
        });

        test("should expand for 'x = if([true,false], [1,2], [3,4])'", function() {
            var input = "x = if([true,false], [1,2], [3,4])";
            var output = compiler.compile(new script(input));
            assert.deepEqual(output.exe.x(), [1, 4]);
        });
    });
});
