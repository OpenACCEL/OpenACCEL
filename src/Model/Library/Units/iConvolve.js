function iConvolve(x,y,n1,n2,m) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    var std_iConvolve = exe.lib.std.iConvolve;
    var error = UnitObject.prototype.propagateError(std_iConvolve, x, y, n1, n2, m);
    if (error) {
        return error;
    }

    var xValues = UnitObject.prototype.toArray(x);
    var yValues = UnitObject.prototype.toArray(y);
    var ansValue = std_iConvolve(xValues, yValues, n1.value, n2.value, m.value);
    var ans;
    if (!UnitObject.prototype.isNormal(x) || !UnitObject.prototype.isNormal(y) || !n1.isNormal() || !n2.isNormal() || !m.isNormal()) {
        ans = new UnitObject(ansValue, {}, "unitError");
        ans.errorString = "All arguments of iConvolve must be unitless; current units are: <"+ x.toString() +">, <"+ y.toString() +">, <" + n1.toString() + ">, <" + n2.toString() + "> and <" + m.toString() + "> respectively";
    } else {
        ans = UnitObject.prototype.create(ansValue, {});
    }

    return ans;
}
