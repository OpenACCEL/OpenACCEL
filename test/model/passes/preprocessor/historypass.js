suite('historypass.js', function() {
    // Template module.
    var instance;
    var assert;
    var Script;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(['assert', 'model/passes/preprocessor/ifpass', "model/analyser", "model/script"],
            function(assertModule, module, analyserModule, scriptModule) {
                console.log('Loaded \'IfPass\' module.');
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
            var expected = ['s = history(s, 1)'];
            assert.deepEquals(expected, actual);
        });

        test('parse() s = t{1} + 1\n t = t{2} + 2', function() {
            var actual = instance.parse(['s = t{1} + 1', 't = t{2} + 2']);
            var expected = ['s = history(t, 1) + 1', 't = history(t, 2) + 2'];
            assert.deepEquals(expected, actual);
        });

        // test('parse() s = s{t {1}}')
    });
});