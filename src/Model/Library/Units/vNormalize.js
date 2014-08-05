//This function was taken from keesvanoverveld.com
function vNormalize(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    // vNormalize works on vectors with just values, thus we remove any UnitObjects in the argument.
    a = unaryZip(x, function(a) {
        return a.value;
    });

    // Propagate any error.
    var std_vNormalize = exe.lib.std.vNormalize;
    var error = UnitObject.prototype.propagateError(std_vNormalize, x);
    if (error) {
        return error;
    }

    // Because we're summing, all units need to be of the same type.
    var ans = std_vNormalize(a);
    var homUnit = UnitObject.prototype.isHomogeneous(x);
    if (!homUnit) {
        return unaryZip(ans, function(a) {
            return new UnitObject(a, {}, "unitError",
                "vNormalize argument's units should be homogeneous."
            );
        });
    } else {
        // Normalizing can be seen as dividing by the units, thus all answers are unitless.
        return unaryZip(ans, function(a) {
            return new UnitObject(a);
        });
    }
}
