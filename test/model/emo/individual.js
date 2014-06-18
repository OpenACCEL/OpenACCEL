suite("Individual", function() {

    var assert;
    var individual;

    setup(function(done) {
        requirejs(["assert", "model/emo/individual"], function(Assert, Individual) {
            console.log("Loaded 'Individual' module.");
            assert = Assert;
            individual = Individual;
            done();
        });
    });

    // suite("dominates(): 2D", function() {
    //     test("individual1 dominates individual2", function() {
    //         var individual1 = new individual([], [1, 2]);
    //         var individual2 = new individual([], [1, 1]);
    //         assert.equal(true, individual1.dominates(individual2));
    //     });
    //     test("individual1 does not dominate individual2", function() {
    //         var individual1 = new individual([], [1, 1]);
    //         var individual2 = new individual([], [1, 2]);
    //         assert.equal(false, individual1.dominates(individual2));
    //     });
    //     test("individual1 does not dominate individual2", function() {
    //         var individual1 = new individual([], [1, 1]);
    //         var individual2 = new individual([], [1, 1]);
    //         assert.equal(false, individual1.dominates(individual2));
    //     });
    // });

    // suite("dominates(): 3D", function() {
    //     test("individual1 dominates individual2", function() {
    //         var individual1 = new individual([], [1, 2, 3]);
    //         var individual2 = new individual([], [1, 2, 2]);
    //         assert.equal(true, individual1.dominates(individual2));
    //     });
    //     test("individual1 does not dominate individual2", function() {
    //         var individual1 = new individual([], [1, 2, 2]);
    //         var individual2 = new individual([], [1, 2, 3]);
    //         assert.equal(false, individual1.dominates(individual2));
    //     });
    //     test("individual1 does not dominate individual2", function() {
    //         var individual1 = new individual([], [1, 2, 3]);
    //         var individual2 = new individual([], [1, 2, 3]);
    //         assert.equal(false, individual1.dominates(individual2));
    //     });
    // });
});
