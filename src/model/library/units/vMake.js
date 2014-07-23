function vMake(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    x = unaryZip(x, function(a) {
        if (!(a instanceof UnitObject)) {
            return new UnitObject(a);
        } else {
            return a;
        }
    });

    if (!(y instanceof UnitObject)) {
        y = new UnitObject(y);
    }

    var std_vMake = exe.lib.std.vMake;
    return std_vMake(x, y.value);
}
