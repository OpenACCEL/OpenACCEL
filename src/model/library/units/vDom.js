function vDom(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    // Just get the values, not the units.
    x = unaryZip(x, function(a) {
        if (a instanceof UnitObject) {
            return a.value;
        } else {
            return a;
        }
    });

    var domain = exe.lib.std.vDom(x);

    // Transform the result back into UnitObjects with no unit.
    return unaryZip(domain, function(a) {
        return new UnitObject(a);
    });
}
