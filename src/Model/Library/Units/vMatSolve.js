function vMatSolve(mm, v) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    var std_vms = exe.lib.std.vMatSolve;
    var error = UnitObject.prototype.propagateError(std_vms, mm, v);
    if (error) {
        return error;
    }

    var mValues = UnitObject.prototype.toArray(mm);
    var vValues = UnitObject.prototype.toArray(v);
    var mUnit = mm[0][0];
    var vUnit = v[0];

    var ansUnit = vUnit.divide(mUnit).unit;
    var ans = UnitObject.prototype.create(std_vms(mValues, vValues), ansUnit);
    return ans;
}
