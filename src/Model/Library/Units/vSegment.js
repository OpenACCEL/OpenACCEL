function vSegment(x, y, z) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    if (y instanceof UnitObject) {
        y = y.value;
    }

    if (z instanceof UnitObject) {
        z = z.value;
    }
    
    // We just invoke the normal library function and make sure all elements are UnitObjects in the end.
    return unaryZip(exe.lib.std.vSegment(x, y, z), function(elem) {
        if (elem instanceof UnitObject) {
            return elem;
        } else {
            return new UnitObject(elem);
        }
    });
}
