function vDom(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    var domain = exe.lib.std.vDom(unaryZip(x, function(a) {
        return a.value;
    }));

    // Transform the result back into UnitObjects with no unit.
    return unaryZip(domain, function(a) {
        return new UnitObject(a);
    });
}
