function vMatSolve(mm, v) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    // Convert all to UnitObjects
    m = unaryZip(mm, function(a) {
        if (!(a instanceof UnitObject)) {
            return new UnitObject(a);
        } else {
            return a;
        }
    });
    v = unaryZip(v, function(a) {
        if (!(a instanceof UnitObject)) {
            return new UnitObject(a);
        } else {
            return a;
        }
    });

    var std_vms = exe.lib.std.vMatSolve;
    var error = UnitObject.prototype.propagateError(std_vms, m, v);
    if (error) {
        return error;
    }

    var mValues = UnitObject.prototype.toArray(m);
    var vValues = UnitObject.prototype.toArray(v);
    var mUnit = m[0][0];
    var vUnit = v[0];

    var ansUnit = vUnit.divide(mUnit).unit;
    var ans = UnitObject.prototype.create(std_vms(mValues, vValues), ansUnit);
    return ans;
}
