//This function was taken from keesvanoverveld.com
function vSpike(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    if (!(x instanceof UnitObject)) {
        x = new UnitObject(x);
    }

    if (!(y instanceof UnitObject)) {
        y = new UnitObject(y);
    }

    var std_vSpike = exe.lib.std.vSpike;
    var error = UnitObject.prototype.propagateError(std_vSpike, x, y);
    if (error) {
        return error;
    }

    var ans = std_vSpike(x.value, y.value);
    if (x.hasUnit() || y.hasUnit()) {
        return unaryZip(ans, function(a) {
            return new UnitObject(a, {}, "unitError",
                "Both arguments of the \"vSpike\" function must be unit-less. Current units are <" + x.toString() + "> and <" + y.toString() + ">.");
        });
    }

    return unaryZip(ans, function(a) {
        return new UnitObject(a);
    });
}
