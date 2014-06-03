suite("ControllerAPI", function() {

    var assert;
    var controller;

    setup(function (done) {
        requirejs(["assert", "controller/ControllerAPI"], function(Assert, ControllerAPI) {
            console.log("Loaded 'Controller' module.");
            assert = Assert;
            controller = new ControllerAPI();
            done();
        });
    });

    suite("Controlling", function() {

        test("Constructor tests", function() {
            var expected = 0;
            var output = controller.numIterations;
            assert.equal(output,expected);
            var output = controller.executing;
            assert.equal(output, false);
        });

        test("Normal Execution tests", function() {
            controller.execute;
        });

        test("Pause Execution tests", function() {
            var expected = false;
            controller.stop();
            var output = controller.executing;
            assert.equal(output, expected);
        });

        test("Normal get quantities tests", function() {
            controller.getQuantities;
        });

        test("Normal add quantity tests", function() {
            controller.addQuantity("test = b");
        });

        test("Setting iterations to valid number", function() {
            var iterations = 1;
            var output = controller.numIterations;
            assert.equal(output, 0);
            controller.setIterations(iterations);
            output = controller.numIterations;
            var expected = 1;
            assert.equal(output, expected);
        });

        test("Set value in model", function() {
            var input = "a = b + 10 ";
            controller.addQuantity(input);
            var input = "b = 10";
            controller.addQuantity(input);
            var output = controller.getQuantityValue('a');
            var expected = 20;
            assert.equal(output, expected);
        });

    });
});
