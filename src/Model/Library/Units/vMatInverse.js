function vMatInverse(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    
    // Convert all to UnitObjects
    x = unaryZip(x, function(a) {
        if (!(a instanceof UnitObject)) {
            return new UnitObject(a);
        } else {
            return a;
        }
    });

    std_vmi = exe.lib.std.vMatInverse;
    var error = UnitObject.prototype.propagateError(std_vmi, x);
    if (error) {
        return error;
    }

    var xValues = UnitObject.prototype.toArray(x);
    var xUnit = x[0][0];

    // First compute the value, then set the units
    var ansValue = std_vmi(xValues);

    // The new unit is simply the inverse of the current unit
    var newUnit = xUnit.power(-1);

    // Assume homogenous square matrix. However, we also
    // support a single scalar value
    var ans = UnitObject.prototype.create(ansValue, newUnit.unit);

    return ans;
}
