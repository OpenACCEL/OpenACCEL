assert 	= require("assert");
model 	= require("../src/template.js");

suite("sweet compilation", function() {
	test("should equal 6", function() {
		assert.equal(6, model.compile());
	});
});