suite("BinaryTournamentMutantTest", function() {
    var assert;
    var compiler;
    var BinaryTournamentMutant;

    setup(function(done) {
        requirejs(["assert"], function(Assert) {
            console.log("Loaded 'BinaryTournamentMutantTest' module.");
            assert = Assert;
            instance = new BinaryTournamentMutant();
            BinaryTournamentMutant = scriptModule;
            done();
        });
    });

    suite("BinaryTournamentMutantTest", function() {

    });
});