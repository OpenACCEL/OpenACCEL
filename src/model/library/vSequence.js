//This function was taken from keesvanoverveld.com
this.std.vSequence = function(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return this.libraries.std.vSeq(x, y);
};
