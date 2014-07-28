function iConvolve(x,y,n1,n2,m) {
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
    if (!(n1 instanceof UnitObject)) {
        n1 = new UnitObject(n1);
    }
    if (!(n2 instanceof UnitObject)) {
        n2 = new UnitObject(n2);
    }
    if (!(m instanceof UnitObject)) {
        m = new UnitObject(m);
    }

    var std_iConvolve = exe.lib.std.iConvolve;
    var error = UnitObject.prototype.propagateError(std_iConvolve, x, y, n1, n2, m);
    if (error) {
        return error;
    }

    var xValues = UnitObject.prototype.toArray(x);
    var yValues = UnitObject.prototype.toArray(y);
    var ans;
    if(!x.isNormal() || !y.isNormal() || !n1.isNormal() || !n2.isNormal() || !m.isNormal()) {
        ans = new UnitObject(std_iConvolve(xValues, yValues, n1.value, n2.value, m.value), {}, "unitError");
        ans.errorString = "All arguments of iConvolve must be unitless; current units are: <"+ x.toString() +">, <"+ y.toString() +">, <" + n1.toString() + ">, <" + n2.toString() + "> and <" + m.toString() + "> respectively";
    } else {
        ans = new UnitObject(std_iConvolve(xValues, yValues, n1.value, n2.value, m.value), {}, null);
    }

    return ans;
}
