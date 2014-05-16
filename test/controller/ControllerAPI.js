suite("ControllerAPI", function() {
    var controller;
    var assert;

    setup(function (done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "controller/ControllerAPI"], function(assertModule, module) {
            console.log("Loaded 'Controller' module.");
            assert = assertModule;
            controller = new module();
            done();
        });
    });

    suite("Controlling", function() {
        test("Setting iterations to valid number", function() {
            var iterations = 1;
            var output = controller.iterations;
            assert.equal(output, 0);
            controller.setIterations(iterations);
            output = controller.iterations;
            var expected = 1;
            assert.equal(output, expected);
        });

        test("Set value in model", function() {
            var input = "a = b + 2";
            controller.addQuantity(input);
            var input = "b = 10";
            controller.addQuantity(input);
            var output = controller.getValue('a');
            var expected = 12;
            assert.equal(output, expected);
        });

    });
});