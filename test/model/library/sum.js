suite("Sum Library", function() {

    var assert;
    var compiler;
    var script;

    setup(function(done) {
        requirejs(["assert", "model/compiler", "model/script"], function(Assert, Compiler, Script) {
            console.log("Loaded 'Sum' module.");
            assert = Assert;
            compiler = new Compiler();
            script = Script;
            done();
        });
    });

    suite("expansion", function() {
        test("should expand for 'x = sum(5, 2, 3, 7, 1, 0, -8)'", function() {
            var input = "x = sum(5, 2, 3, 7, 1, 0, -8)";
            var output = compiler.compile(new script(input));
            assert.equal(output.exe.x(), 10);
        });

        test("should expand for 'x = 5, y = sum(x,4) + 2, z = sum(sum(x,2),y)'", function() {
            var input = "x = 5\ny = sum(x,4) + 2\nz = sum(sum(x,2),y)";
            var output = compiler.compile(new script(input));
            assert.equal(output.exe.z(), 18);
        });

        test("should expand for 'x = sum([1,2], [3,4])'", function() {
            var input = "x = sum([1,2], [3,4])";
            var output = compiler.compile(new script(input));
            assert.deepEqual(output.exe.x(), [4, 6]);
        });

        test("should expand for 'x = sum([1,2], [3,4], [1, [4,5]])'", function() {
            var input = "x = sum([1,2], [3,4], [1, [4,5]])";
            var output = compiler.compile(new script(input));
            assert.deepEqual(output.exe.x(), [5, [10, 11]]);
        });
    });
});
