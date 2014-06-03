suite("PreProcessor", function() {
    var preProcessor;
    var Script;
    var assert;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "model/preprocessor", "model/script"], function(assertModule, module, scriptModule) {
            console.log("Loaded 'PreProcessor' module.");
            assert = assertModule;
            preProcessor = new module();
            Script = scriptModule;
            done();
        });
    });

    suite("processing", function() {
        test("default settings, no units", function() {
            var code = "x = 5\ny = sin(x)\nz = 2 + sin(y + sin(x)) + 4 + sin(2)\nu = x + y";
            var output = preProcessor.process(new Script(code));
            var expected = "(function () { exe = {}; exe.__time__ = 0; exe.step = function() { this.__time__++; };func(x = 5)func(y = sin(exe.x()))func(z = 2  __add__  sin(exe.y()  __add__  sin(exe.x()))  __add__  4  __add__  sin(2))func(u = exe.x()  __add__  exe.y())return exe; })()"
            assert.equal(output, expected);
        });


        test("default settings, with units", function() {
            var code = "x = 5 ; kg\ny = sin(x) ; kg2.s/m\nz = 2 + sin(y + sin(x)) + 4 + sin(2)\nu = x + y";
            var output = preProcessor.process(new Script(code));
            var expected = "(function () { exe = {}; exe.__time__ = 0; exe.step = function() { this.__time__++; };func(x = 5 ; {'kg': 1})func(y = sin(exe.x()) ; {'kg': 2, 's': 1, 'm': -1})func(z = 2  __add__  sin(exe.y()  __add__  sin(exe.x()))  __add__  4  __add__  sin(2))func(u = exe.x()  __add__  exe.y())return exe; })()"
            assert.equal(output, expected);
        });

    });
});
