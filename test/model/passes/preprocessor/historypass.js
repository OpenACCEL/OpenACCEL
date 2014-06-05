suite('historypass.js', function() {

    var assert;
    var historyPass;

    setup(function(done) {
        requirejs(['assert', 'model/passes/preprocessor/historypass', "model/analyser"], function(assertModule, HistoryPass, analyserModule) {
            console.log('Loaded \'HistoryPass\' module.');
            assert = assertModule;
            historyPass = new HistoryPass();
            analyser = new analyserModule();
            done();
        });
    });

    suite('HistoryPass', function() {

        test('parse() s = s{1} + 1', function() {
            var actual = historyPass.parse(['s = s{1} + 1'], {});
            var expected = ['s = __history__(s, 1) + 1'];
            assert.deepEqual(actual, expected);
        });

        test('parse() s = t{1} + 1\n t = t{2} + 2', function() {
            var actual = historyPass.parse(['s = t{1} + 1', 't = t{2} + 2'], {});
            var expected = ['s = __history__(t, 1) + 1', 't = __history__(t, 2) + 2'];
            assert.deepEqual(actual, expected);
        });

        test('parse() s = s{cond(c{1} > 4, 5, 6)} + 1', function() {
            var actual = historyPass.parse(['s = s{cond(c{1} > 4, 5, 6)} + 1'], {});
            var expected = ['s = __history__(s, cond(__history__(c, 1) > 4, 5, 6)) + 1'];
            assert.deepEqual(actual, expected);
        });

        // test('parse() s = s{t {1}}')
        test('parse() t=t{1}+2 \n s=s{1+t}+2', function() {
            var actual = historyPass.parse(['t = t{1} + 2', 's = s{1 + t} + 2'], {});
            var expected = ['t = __history__(t, 1) + 2', 's = __history__(s, 1 + t) + 2'];
            assert.deepEqual(expected, actual);
        });

                // test('parse() s = s{t {1}}')
        test('parse() t=t{1}+2 \n s=s{1+t}+2', function() {
            var actual = historyPass.parse(['t = t{1 + b{0}} + 2', 's = s{1 + t} + 2'], {});
            var expected = ['t = __history__(t, 1 + __history__(b, 0)) + 2', 's = __history__(s, 1 + t) + 2'];
            assert.deepEqual(expected, actual);
        });
    });
});
