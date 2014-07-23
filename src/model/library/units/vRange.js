function vRange(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    var range = exe.lib.std.vRange(x);

    // Transform any scalar value into a UnitObject.
    return unaryZip(range, function(a) {
        if (!(a instanceof UnitObject)) {
            return new UnitObject(a);
        } else {
            return a;
        }
    });
}
