//This function was taken from keesvanoverveld.com
function vNormAbs(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    // vNormAbs works on vectors with just values, thus we remove any UnitObjects in the argument.
    a = unaryZip(x, function(a) {
        return a.value;
    });

    // Propagate any error.
    var std_vNormAbs = exe.lib.std.vNormAbs;
    var error = UnitObject.prototype.propagateError(std_vNormAbs, x);
    if (error) {
        return error;
    }

    // Because we're summing, all units need to be of the same type.
    var ans = std_vNormAbs(a);
    var homUnit = UnitObject.prototype.isHomogeneous(x);
    if (!homUnit) {
        return new UnitObject(ans, {}, "unitError",
            "vNormAbs argument's units should be homogeneous.");
    } else {
        return new UnitObject(ans, homUnit);
    }
}
