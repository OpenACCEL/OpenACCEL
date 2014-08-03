//This function was taken from keesvanoverveld.com
function vNormSq(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    // vNormSq works on vectors with just values, thus we remove any UnitObjects in the argument.
    a = unaryZip(x, function(a) {
        if (a instanceof UnitObject) {
            return a.value;
        } else {
            return a;
        }
    });

    // Propagate any error.
    var std_vNormSq = exe.lib.std.vNormSq;
    var error = UnitObject.prototype.propagateError(std_vNormSq, x);
    if (error) {
        return error;
    }

    // Because we're summing, all units need to be of the same type.
    var ans = std_vNormSq(a);
    var homUnit = UnitObject.prototype.isHomogeneous(x);
    if (!homUnit) {
        return new UnitObject(ans, {}, "unitError",
            "vNormSq argument's units should be homogeneous.");
    } else {
        // Don't forget that all units are squared!
        return new UnitObject(ans, homUnit).power(2);
    }
}
