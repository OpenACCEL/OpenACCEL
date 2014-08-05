function vVecRamp(x, y, z) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    var std_vvec = exe.lib.std.vVecRamp;
    var error = UnitObject.prototype.propagateError(std_vvec, x, y, z);
    if (error) {
        return error;
    }

    var xValues = UnitObject.prototype.toArray(x);
    var yValues = UnitObject.prototype.toArray(y);
    var xUnit = UnitObject.prototype.isHomogeneous(x);
    var xObj = (x instanceof Array) ? x[0] : x;
    var yUnit = (y instanceof Array) ? y[0].unit : y.unit;
    if (xUnit === false || !xObj.equals(z)) {
        return new UnitObject(std_vvec(xValues, yValues, z.value), {}, "unitError",
            "In vVecRamp the first argument must be a vector where elements have the same unit as the third argument");
    } else {
        return new UnitObject(std_vvec(xValues, yValues, z.value), yUnit);
    }
}
