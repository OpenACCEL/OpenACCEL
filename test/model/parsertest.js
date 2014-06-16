suite("Parser", function() {

    var parser;
    var script;

    setup(function (done) {
        requirejs(["assert", "model/parser", "model/script"], function(Assert, Parser, Script) {
            assert = Assert;
            parser = Parser;
            script = Script;

            done();
        });
    });

    /**
     * Test for Operator precedence: no operator
     */
    test("| Simple syntax checking", function() {
        var code = "\nx = b[5]\n// Testing comments 123\nb=[1,2,3,4,5,[7,6]]; kg/m2";
        var result;

        try {
        	result = parser.parse(code);
        } catch(e) {
        	result = false;
        	console.log(e.hash.loc.first_line);
        }

		assert(result);
	});
});
