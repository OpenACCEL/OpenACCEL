function iMedian(x,n,m) {
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
    if (!(n instanceof UnitObject)) {
        n = new UnitObject(n);
    }
    if (!(m instanceof UnitObject)) {
        m = new UnitObject(m);
    }

    var std_iMedian = exe.lib.std.iMedian;
    var error = UnitObject.prototype.propagateError(std_iMedian, x, n, m);
    if (error) {
        return error;
    }

    var xValues = UnitObject.prototype.toArray(x);
    var ans;
    if(!UnitObject.prototype.isNormal(x) || !n.isNormal() || !m.isNormal()) {
        ans = new UnitObject(std_iMedian(xValues, n.value, m.value), {}, "unitError");
        ans.errorString = "All arguments of iMedian must be unitless; current units are: <"+ x.toString() +">, <"+ n.toString() +"> and <" + m.toString() + "> respectively";
    } else {
        ans = UnitObject.prototype.create(std_iMedian(xValues, n.value, m.value), {});
    }

    return ans;
}
