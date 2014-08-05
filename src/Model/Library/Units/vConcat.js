function vConcat(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    
    // We just invoke the normal library function and make sure all elements are UnitObjects.
    return exe.lib.std.vConcat(x, y);
}

vConcat.base = [];
