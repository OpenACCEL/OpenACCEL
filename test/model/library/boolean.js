suite("Boolean Library", function() {
    var compiler;
    var macros;
    var assert;
    var Script;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "model/compiler", "model/fileloader", "model/script"], function(assertModule, module, FileLoader, scriptModule) {
            console.log("Loaded 'Boolean' module.");
            assert = assertModule;
            compiler = new module();
            fileLoader = new FileLoader();
            Script = scriptModule;
            done();
        });
    });

    suite("expansion", function() {

        test("should expand for 'x = if(true,10,30)'", function() {
            var input = "x = if(true,10,30)";
            var output = compiler.compile(new Script(input));
            assert.equal(output.exe.x(), 10);
        });

        test("should expand for 'x = 5, y = if(true,x,4) + 2, z = if(false,if(false,x,2),y)'", function() {
            var input = "x = 5\ny = if(true,x,4) + 2\nz = if(true,if(false,x,2),y)";
            var output = compiler.compile(new Script(input));
            assert.equal(output.exe.y(), 7);
            assert.equal(output.exe.z(), 2);
        });

        test("should expand for 'x = if([true,false], [1,2], [3,4])'", function() {
            var input = "x = if([true,false], [1,2], [3,4])";
            var output = compiler.compile(new Script(input));
            assert.deepEqual(output.exe.x(), [1, 4]);
        });
    });
});
