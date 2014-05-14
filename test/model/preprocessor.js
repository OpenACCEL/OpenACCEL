suite("PreProcessor", function() {
    var preProcessor;
    var assert;

    setup(function (done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "model/preprocessor"], function(assertModule, module) {
            console.log("Loaded 'PreProcessor' module.");
            assert = assertModule;
            preProcessor = new module();
            done();
        });
    });

    suite("processing", function() {
        test("default settings, no units", function() {
            var code = "x = 5\ny = sin(x)\nz = 2 + sin(y + sin(x)) + 4 + sin(2)\nu = x + y";
            var output = preProcessor.process(code);
            var expected = "(function () { exe = {}; func(x = 5)func(y = sin(exe.x()))func(z = 2 + sin(exe.y() + sin(exe.x())) + 4 + sin(2))func(u = exe.x() + exe.y())return exe; })()"
            assert.equal(output, expected);
        });

        /*
        test("default settings, with units", function() {
            var code = "x = 5 ; kg\ny = sin(x) ; kg2.s/m\nz = 2 + sin(y + sin(x)) + 4 + sin(2)\nu = x + y";
            var output = preProcessor.process(code);
            var expected = "(function () { exe = {}; func(x = 5 ; {'kg': 2, 's': 1, 'm': -1})func(y = sin(exe.x()) ; {'kg'})func(z = 2 + sin(exe.y() + sin(exe.x())) + 4 + sin(2))func(u = exe.x() + exe.y())return exe; })()"
            assert.equal(output, expected);
        });
        */
    });
});