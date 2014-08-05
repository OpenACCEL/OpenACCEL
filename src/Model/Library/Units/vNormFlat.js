//This function was taken from keesvanoverveld.com
function vNormFlat(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    // vNormFlat works on vectors with just values, thus we remove any UnitObjects in the argument.
    a = unaryZip(x, function(a) {
        return a.value;
    });

    // Propagate any error.
    var std_vNormFlat = exe.lib.std.vNormFlat;
    var error = UnitObject.prototype.propagateError(std_vNormFlat, x);
    if (error) {
        return error;
    }

    // Because we're summing, all units need to be of the same type.
    var ans = std_vNormFlat(a);
    var homUnit = UnitObject.prototype.isHomogeneous(x);
    if (!homUnit) {
        return new UnitObject(ans, {}, "unitError",
            "vNormFlat argument's units should be homogeneous.");
    } else {
        return new UnitObject(ans, homUnit);
    }
}
