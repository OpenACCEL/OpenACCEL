function __do__(code, args) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    // Translate arguments from UnitObject, invoke normal function and translate back to a normal unit.
    var code = code.value;
    var args = unaryZip(args, function(x) {
        return x.value;
    });

    return unaryZip(exe.lib.std.__do__(code, args), function(x) {
        return new UnitObject(x);
    });
}
