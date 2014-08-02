function vVecRamp(x, y, z) {
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
    y = unaryZip(y, function(a) {
        if (!(a instanceof UnitObject)) {
            return new UnitObject(a);
        } else {
            return a;
        }
    });
    if (!(z instanceof UnitObject)) {
        z = new UnitObject(z);
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
    var ans;
    if (xUnit === false || !xObj.equals(z)) {
        ans = new UnitObject(std_vvec(xValues, yValues, z.value), {}, "unitError");
        ans.errorString = "In vVecRamp the first argument must be a vector where elements have the same unit as the third argument";
    } else {
        ans = new UnitObject(std_vvec(xValues, yValues, z.value), yUnit, null);
    }

    return ans;
}
