function vEigenSystem(x) {
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

    std_es = exe.lib.std.vEigenSystem;
    var error = UnitObject.prototype.propagateError(std_es, x);
    if (error) {
        return error;
    }

    var xValues = UnitObject.prototype.toArray(x);
    var xUnit = x[0][0].unit;

    // First compute the value, then set the units
    var ansValue = std_es(xValues);

    // The first two vectors have the same unit as x[0][0] === xUnit,
    // the third vector is unitless
    var ans = UnitObject.prototype.create(ansValue, xUnit);

    // Make the last vector unitless
    for (var i=0; i<ans[ans.length-1].length; i++) {
        UnitObject.prototype.setUnitsRecursively(ans[ans.length-1][i], {});
    }

    return ans;
}
