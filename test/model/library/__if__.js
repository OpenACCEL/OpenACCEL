suite("If Library", function() {
    var compiler;
    var macros;
    var assert;
    var Script;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "model/compiler", "model/fileloader", "model/script"], function(assertModule, module, FileLoader, scriptModule) {
            console.log("Loaded 'Compiler & FileLoader' module.");
            assert = assertModule;
            compiler = new module();
            fileLoader = new FileLoader();
            Script = scriptModule;
            fileLoader.load("__if__", "library");
            fileLoader.load("nzip", "library");
            done();
        });
    });

    suite("__if__", function() {

        test("if function with true condition", function() {
            eval(fileLoader.getContent());
            var condition = true;
            var ifTrue = 1;
            var ifFalse = 3;
            output = __if__(condition, ifTrue, ifFalse);
            assert.deepEqual(output, 1);
        });

        test("if function with false condition", function() {
            eval(fileLoader.getContent());
            var condition = false;
            var ifTrue = 1;
            var ifFalse = 3;
            output = __if__(condition, ifTrue, ifFalse);
            assert.deepEqual(output, 3);
        });

        test("if function with array condition, using nzip", function() {
            eval(fileLoader.getContent());
            var condition = [false, true, true];
            var ifTrue = 1;
            var ifFalse = 3;
            output = __if__(condition, ifTrue, ifFalse);
            assert.deepEqual(output, [3, 1, 1]);
        });

        test("if function with array condition and scalar or array choice, using nzip", function() {
            eval(fileLoader.getContent());
            var condition = [true, true, false];
            var ifTrue = 3;
            var ifFalse = [4, 5, 6];
            output = __if__(condition, ifTrue, ifFalse);
            assert.deepEqual(output, [3, 3, 6]);
        });

        test("if function with array condition and scalar or array choice, using nzip", function() {
            eval(fileLoader.getContent());
            var condition = [false, true, false];
            var ifTrue = [3, [4, 5]];
            var ifFalse = [4, 5, 6];
            output = __if__(condition, ifTrue, ifFalse);
            assert.deepEqual(output, [4, [4, 5]]);
        });
    });

        suite("expansion", function() {

        test("should expand for 'x = if(1 == 1,10,30)'", function() {
            var input = "x = if(1 == 1,10,30)";
            var output = compiler.compile(new Script(input));
            assert.equal(output.exe.x(), 10);
        });

        test("should expand for 'x = 5, y = if(1 == 1,x,4) + 2, z = if(1 == 0,if(1 == 0,x,2),y)'", function() {
            var input = "x = 5\ny = if(1 == 1,x,4) + 2\nz = if(1 == 1,if(1 == 0,x,2),y)";
            var output = compiler.compile(new Script(input));
            assert.equal(output.exe.y(), 7);
            assert.equal(output.exe.z(), 2);
        });

        test("should expand for 'x = if([1,2], [3,4])'", function() {
            var input = "x = if([1 == 1,1 == 0], [1,2], [3,4])";
            var output = compiler.compile(new Script(input));
            assert.deepEqual(output.exe.x(), [1, 4]);
        });
    });
});
