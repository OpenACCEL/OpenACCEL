//This function was taken from keesvanoverveld.com
function vDot(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    // vDot works on vectors with just values, thus we remove any UnitObjects in the argument.
    a = unaryZip(x, function(i) {
        return i.value;
    });

    b = unaryZip(x, function(j) {
        return j.value;
    });

    // Propagate any error.
    var std_vDot = exe.lib.std.vDot;
    var error = UnitObject.prototype.propagateError(std_vDot, x, y);
    if (error) {
        return error;
    }

    // Because we're summing, all units need to be of the same type.
    var ans = std_vDot(a, b);
    var homUnitX = UnitObject.prototype.isHomogeneous(x);
    var homUnitY = UnitObject.prototype.isHomogeneous(y);
    if (!homUnitX || !homUnitY) {
        return new UnitObject(ans, {}, "unitError",
            "vDot argument's units should both be homogeneous.");
    } else {
    	var unit = new UnitObject(0, homUnitX).multiply(new UnitObject(0, homUnitY));
        return new UnitObject(ans, unit.unit);
    }
}
