function iGaussian(n1,n2,s1,s2) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
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
        return UnitObject.prototype.create(std_iGaussian(n1.value, n2.value, s1.value, s2.value), {});
    }
}
