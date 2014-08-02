//This function was taken from keesvanoverveld.com
function vSeq(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    if (!(x instanceof UnitObject)) {
        x = new UnitObject(x);
    }

    if (!(y instanceof UnitObject)) {
        y = new UnitObject(y);
    }

    var std_vSeq = exe.lib.std.vSeq;
    var ans = std_vSeq(x.value, y.value);

    // Don't forget to transform all the answers to UnitObjects.
    if (x.hasUnit() || y.hasUnit()) {
        return unaryZip(ans, function(a) {
            return new UnitObject(a, {}, "unitError",
                "Both arguments of the \"vSeq\" function must be unit-less. Current units are <" + x.toString() + "> and <" + y.toString() + ">.");
        });
    }

    return unaryZip(ans, function(a) {
        return new UnitObject(a);
    });
}
