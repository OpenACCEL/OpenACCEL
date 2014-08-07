 //This function was taken from keesvanoverveld.com
function vConvolve(x, y, n, m) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    std_vconv = exe.lib.std.vConvolve;
    var error = UnitObject.prototype.propagateError(std_vconv, x, y, n, m);
    if (error) {
        return error;
    }

    var xValues = UnitObject.prototype.toArray(x);
    var yValues = UnitObject.prototype.toArray(y);
    var xUnit = (x instanceof Array) ? x[0] : x;
    var yUnit = (y instanceof Array) ? y[0] : y;

    var ansValue = std_vconv(xValues, yValues, n.value, m.value);
    if (!n.isNormal() || !m.isNormal()) {
        ans = new UnitObject(ansValue, {}, "unitError",
            "In function vConvolve, third and fourth arguments must be unit-less. Current units are: <" + n.toString() + "> and <" + m.toString() + ">.");
    } else {
        var ansUnit = xUnit.multiply(yUnit);
        ans = UnitObject.prototype.create(ansValue, ansUnit.unit);
    }

    return ans;
}
