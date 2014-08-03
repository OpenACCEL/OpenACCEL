function vAggregate(x, y, z) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    if (!(z instanceof UnitObject)) {
        z = new UnitObject(z);
    }
    
    var ans = exe.lib.std.vAggregate(x, y, z);

    if (z.hasUnit()) {
        var errorStr = "Third argument of vAggregate must be unit-less. Current unit is <" + z.toString() + ">.";
        
        return unaryZip(ans, function(elem) {
            if (elem instanceof UnitObject) {
                elem.error = "unitError";
                elem.errorString = errorStr;
            } else {
                return new UnitObject(elem, {}, unitError, errorStr);
            }
        });
    }

    // We just invoke the normal library function and make sure all elements are UnitObjects in the end.
    return unaryZip(ans, function(elem) {
        if (elem instanceof UnitObject) {
            return elem;
        } else {
            return new UnitObject(elem);
        }
    });
}
