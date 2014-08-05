function iMedian(x,n,m) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    var std_iMedian = exe.lib.std.iMedian;
    var error = UnitObject.prototype.propagateError(std_iMedian, x, n, m);
    if (error) {
        return error;
    }

    var xValues = UnitObject.prototype.toArray(x);
    if(!UnitObject.prototype.isNormal(x) || !n.isNormal() || !m.isNormal()) {
        return new UnitObject(std_iMedian(xValues, n.value, m.value), {}, "unitError",
            "All arguments of iMedian must be unitless; current units are: <"+ x.toString() +">, <"+ n.toString() +"> and <" + m.toString() + "> respectively");
    } else {
        return new UnitObject(std_iMedian(xValues, n.value, m.value), {}, null);
    }
}
