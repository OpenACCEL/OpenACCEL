//This function was taken from keesvanoverveld.com
function vTranspose(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return exe.lib.std.vTranspose(x);
}
