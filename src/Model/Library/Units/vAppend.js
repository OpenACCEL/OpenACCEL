function vAppend(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    
    // We just invoke the normal library function.
    return exe.lib.std.vAppend(x, y);
}

vAppend.base = [];
