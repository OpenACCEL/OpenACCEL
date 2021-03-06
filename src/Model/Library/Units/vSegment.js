function vSegment(x, y, z) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    var ans = exe.lib.std.vSegment(x, y.value, z.value)
    
    // We just invoke the normal library function and make sure all elements are UnitObjects in the end.
    // This is because this function may produce extra values that are not UnitObjects.
    return unaryZip(ans, function(elem) {
        if (elem instanceof UnitObject) {
            return elem;
        } else {
            return new UnitObject(elem);
        }
    });
}
