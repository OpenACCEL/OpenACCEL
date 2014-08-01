function vLen(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    var std_vLen = exe.lib.std.vLen;
    var error = UnitObject.prototype.propagateError(std_vLen, x);
    if (error) {
        return error;
    }

    // This works for arrays of UnitObjects as well.
    var ans = std_vLen(x);
    return new UnitObject(ans);
}
