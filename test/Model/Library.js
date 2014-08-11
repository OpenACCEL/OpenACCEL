suite("Library", function() {

    var assert;
    var lib;

    setup(function(done) {
        requirejs(["assert", "Model/Library"], function(Assert, Library) {
            assert = Assert;
            lib = new Library();
            done();
        });
    });

    suite("| Library", function() {
        test("| Loading library", function() {
            lib.load();
            assert(lib.lib.standard_functions.length > 0);
            assert(lib.lib.input_functions.length > 0);
            assert(lib.lib.help.length > 0);
        });

        test("| Escaping functions names", function() {
            lib.load();
            var escaped = lib.escape(lib.lib.standard_functions);

            
            for (var elem in escaped) {
                
            }
        });
    });
});
