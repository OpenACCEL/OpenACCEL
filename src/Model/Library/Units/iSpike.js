function iSpike(x1,x2,y1,y2) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    var std_iSpike = exe.lib.std.iSpike;
    var error = UnitObject.prototype.propagateError(std_iSpike, x1, x2, y1, y2);
    if (error) {
        return error;
    }

    if(!x1.isNormal() || !x2.isNormal() || !y1.isNormal() || !y2.isNormal()) {
        return new UnitObject(std_iSpike(x1.value, x2.value, y1.value, y2.value), {}, "unitError",
            "All arguments of iSpike must be unitless; current units are: <"+ x1.toString() +">, <"+ x2.toString() +">, <" + y1.toString() + "> and <" + y2.toString() + "> respectively");
    } else {
        return new UnitObject(std_iSpike(x1.value, x2.value, y1.value, y2.value), {}, null);
    }
}
