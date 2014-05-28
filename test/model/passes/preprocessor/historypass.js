suite('historypass.js', function() {
    // Template module.
    var instance;
    var assert;
    var Script;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(['assert', 'model/passes/preprocessor/historypass', "model/analyser", "model/script"],
            function(assertModule, module, analyserModule, scriptModule) {
                console.log('Loaded \'Historypass\' module.');
                assert = assertModule;
                instance = new module();
                analyser = new analyserModule();
                Script = scriptModule;
                done();
            });
    });

    suite('HistoryPass', function() {

        test('parse() s = s{1} + 1', function() {
            var actual = instance.parse(['s = s{1} + 1'], {});
            var expected = ['s = history(s, 1) + 1'];
            assert.deepEqual(actual, expected);
        });

        test('parse() s = t{1} + 1\n t = t{2} + 2', function() {
            var actual = instance.parse(['s = t{1} + 1', 't = t{2} + 2'], {});
            var expected = ['s = history(t, 1) + 1', 't = history(t, 2) + 2'];
            assert.deepEqual(actual, expected);
        });

        test('parse() s = s{cond(c{1} > 4, 5, 6)} + 1', function() {
            var actual = instance.parse(['s = s{cond(c{1} > 4, 5, 6)} + 1'], {});
            var expected = ['s = history(s, cond(history(c, 1) > 4, 5, 6)) + 1'];
            assert.deepEqual(actual, expected);
        });

        test('parse() t=t{1}+2 \n s=s{1+t}+2', function() {
            var actual = instance.parse(['t = t{1} + 2', 's = s{1 + t} + 2']);
            var expected = ['t = history(t, 1) + 1', 's = history(s, 1 + t) + 2'];
            assert.deepEqual(expected, actual);
        });
    });
});