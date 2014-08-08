//This function was taken from keesvanoverveld.com
function vMatMatMul(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    std_vmm = exe.lib.std.vMatMatMul;
    var error = UnitObject.prototype.propagateError(std_vmm, x, y);
    if (error) {
        return error;
    }

    // We assume homogenous matrices, so the only thing to do is to determine
    // the units to multiply with eachother. Both arguments can either be scalars,
    // vectors or matrices
    var xUnit = (x instanceof Array) ? ((x[0] instanceof Array) ? x[0][0] : x[0]) : x;
    var yUnit = (y instanceof Array) ? ((y[0] instanceof Array) ? y[0][0] : y[0]) : y;
    var ansUnit = xUnit.multiply(yUnit);

    // Convert to value arrays/matrices and compute the value
    var xValues = UnitObject.prototype.toArray(x);
    var yValues = UnitObject.prototype.toArray(y);
    var ansValue = std_vmm(xValues, yValues);

    // Zip units and values together and we are done!
    var ans = UnitObject.prototype.create(ansValue, ansUnit.unit);

    return ans;
}
