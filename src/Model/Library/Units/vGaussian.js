//This function was taken from keesvanoverveld.com
function vGaussian(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    
    var std_vGaussian = exe.lib.std.vGaussian;
    var error = UnitObject.prototype.propagateError(std_vGaussian, x, y);
    if (error) {
        return error;
    }

    var ans = std_vGaussian(x.value, y.value);
    if (x.hasUnit() || y.hasUnit()) {
        return unaryZip(ans, function(a) {
            return new UnitObject(a, {}, "unitError",
                "Both arguments of the \"vGaussian\" function must be unit-less. Current units are <" + x.toString() + "> and <" + y.toString() + ">.");
        });
    }

    return unaryZip(ans, function(a) {
        return new UnitObject(a);
    });
}
