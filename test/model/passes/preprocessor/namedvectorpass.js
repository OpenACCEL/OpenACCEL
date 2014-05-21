suite("namedvectorpass.js", function() {
    // Template module.
    var namedVectorPass;
    var assert;

    // setup(function(done) {
    //     // This saves the module for use in tests. You have to use
    //     // the done callback because this is asynchronous.
    //     requirejs(["assert", "model/passes/preprocessor/namedvectorpass"], function(assertModule, module) {
    //         console.log("Loaded 'namedVectorPass' module.");
    //         assert = assertModule;
    //         instance = new module();
    //         done();
    //     });
    // });

    // suite("namedVectorPass", function() {

    //     test("parse() robustness", function() {
    //         assert.throws(
    //             function() {
    //                 namedVectorPass.parse(null);
    //             });
    //         assert.throws(
    //             function() {
    //                 namedVectorPass.parse();
    //             });
    //     });

    //     //TODO: TEST MORE PARSE
    //     /**
    //     /**
    //      * Tests replaceBrackets(). Simple definition of vector.
    //      */
    //     test('replaceBrackets() simple definition', function() {
    //         assert.equal(instance.replaceBrackets('y = [1,2]'), 'y = {1,2}');
    //     });

    //     /**
    //      * Tests replaceBrackets(). Includes a nested vector.
    //      */
    //     test('replaceBrackets() nested vector', function() {
    //         assert.equal(instance.replaceBrackets('y = [1,2,[3,4]]'), 'y = {1,2,{3,4}}');
    //     })
    //     ';'

    //     /**
    //      * Tests replaceBrackets(). Calls a vector. Should not do anything.
    //      */
    //     test('replaceBrackets() calling vector', function() {
    //         assert.equal(instance.replaceBrackets('y = b[0]'), 'y = b[0]');
    //     });

    //     /**
    //      * Tests replaceBrackets(). Calls a named attribute of a vector. Should not do anything.
    //      */
    //     test('replaceBrackets() calling named vector', function() {
    //         assert.equal(instance.replaceBrackets('y = b[\'x\']'), 'y = b[\'x\']');
    //     });

    //     /**
    //      * Tests replaceBrackets(). Calls a vector in the vector definition. The brackets of the
    //      * definition should be translated in curly braces, while the called ones should not.
    //      */
    //     test('replaceBrackets() calling vector in vector definition', function() {
    //         assert.equal(instance.replaceBrackets('y = [1, b[0]]'), 'y = {1, b[0]}');
    //     })

    //     /**
    //      * replaceBrackets() robustness tests.
    //      */
    //     test('replaceBrackets() robustness', function() {
    //         assert.throws(
    //             function() {
    //                 namedVectorPass.replaceBrackets(null);
    //             });
    //         assert.throws(
    //             function() {
    //                 namedVectorPass.replaceBrackets();
    //             });
    //     });

    // });
});