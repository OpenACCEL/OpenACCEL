suite('analyser.js', function() {
    // Template module.
    var analyser;
    var instance;
    var assert;
    var Script;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(['assert', 'model/analyser', "model/analyser", "model/script"],
            function(assertModule, module, analyserModule, scriptModule) {
                console.log('Loaded \'analyser\' module.');
                assert = assertModule;
                instance = new module();
                analyser = new analyserModule();
                Script = scriptModule;
                done();
            });
    });

    suite('analyse', function() {

    });
});