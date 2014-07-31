function vAppend(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    
    // We just invoke the normal library function and make sure all elements are UnitObjects.
    return unaryZip(exe.lib.std.vAppend(x, y), function(elem) {
        if (elem instanceof UnitObject) {
            return elem;
        } else {
            return new UnitObject(elem);
        }
    });
}

vAppend.base = [];
