suite('ifpass.js', function() {

    var analyser;
    var assert;
    var ifPass;
    var Script;

    setup(function(done) {
        requirejs(['assert', 'model/passes/preprocessor/ifpass', "model/analyser", "model/script"], function(Assert, IfPass, Analyser, scriptModule) {
            console.log('Loaded \'IfPass\' module.');
            assert = Assert;
            ifPass = new IfPass();
            analyser = new Analyser();
            Script = scriptModule;
            done();
        });
    });

    suite('IfPass', function() {

        /**
         * Tests whether references to the if function are properly replaced.
         */
        test('IfPass: reference to if function', function() {
            var lines = [
                'x = if(1 == 1, 1, 2)',
                'y = if(sin(0) == 0, if(1 == 1, 2, 3),if(1 == 4, 5, 6))'

            ];
            var expResult = [
                'x = __if__(1 == 1, 1, 2)',
                'y = __if__(sin(0) == 0, __if__(1 == 1, 2, 3),__if__(1 == 4, 5, 6))'
            ];
            var script = new Script(lines.join("\n"));
            var report = script.getQuantities();
            assert.deepEqual(ifPass.parse(lines, report), expResult);
        });

        /**
         * Tests whether other instances of "if" are not replaced
         */
        test('IfPass: reference to if function', function() {
            var lines = [
                'gif(x) = x',
                'y = gif(4) + \'if this is ok\''
            ];

            var script = new Script(lines.join("\n"));
            var report = script.getQuantities();

            assert.deepEqual(ifPass.parse(lines, report), lines);
        });
    });
});
