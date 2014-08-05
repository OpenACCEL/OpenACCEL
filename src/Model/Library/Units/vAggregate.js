function vAggregate(x, y, z) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    var ans = exe.lib.std.vAggregate(x, y, z);

    if (z.hasUnit()) {
        var errorStr = "Third argument of vAggregate must be unit-less. Current unit is <" + z.toString() + ">.";
        
        return unaryZip(ans, function(elem) {
            elem.error = "unitError";
            elem.errorString = errorStr;

            return elem;
        });
    }

    return ans;
}
