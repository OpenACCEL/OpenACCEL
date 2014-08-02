function iGaussian(n1,n2,s1,s2) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    if (!(n1 instanceof UnitObject)) {
        n1 = new UnitObject(n1);
    }
    if (!(n2 instanceof UnitObject)) {
        n2 = new UnitObject(n2);
    }
    if (!(s1 instanceof UnitObject)) {
        s1 = new UnitObject(s1);
    }
    if (!(s2 instanceof UnitObject)) {
        s2 = new UnitObject(s2);
    }

    var std_iGaussian = exe.lib.std.iGaussian;
    var error = UnitObject.prototype.propagateError(std_iGaussian, n1, n2, s1, s2);
    if (error) {
        return error;
    }

    if(!n1.isNormal() || !n2.isNormal() || !s1.isNormal() || !s2.isNormal()) {
        return new UnitObject(std_iGaussian(n1.value, n2.value, s1.value, s2.value), {}, "unitError",
            "All arguments of iGaussian must be unitless; current units are: <"+ n1.toString() +">, <"+ n2.toString() +">, <" + s1.toString() + "> and <" + s2.toString() + "> respectively");
    } else {
        return new UnitObject(std_iGaussian(n1.value, n2.value, s1.value, s2.value), {}, null);
    }
}
