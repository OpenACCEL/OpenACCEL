//This function was taken from keesvanoverveld.com
function vNormAbs(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    // vNormAbs works on vectors with just values, thus we remove any UnitObjects in the argument.
    x = unaryZip(x, function(a) {
        if (a instanceof UnitObject) {
            return a.value;
        } else {
            return a;
        }
    });

    // Propagate any error.
    var std_vNormAbs = exe.lib.std.vNormAbs;
    var error = UnitObject.prototype.propagateError(std_vNormAbs, x);
    if (error) {
        return error;
    }

    // Because we're summing, all units need to be of the same type.
    if (!a.equals(b)) {
        return new UnitObject(std_vNormAbs(x.value), {}, "Atan2 units should be equal.");
    } else {
        var ans = a.clone()
        ans.value = std_atan2(a.value, b.value);
        return ans;
    }
}
