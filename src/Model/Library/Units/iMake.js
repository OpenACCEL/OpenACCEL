function iMake(x,nrRows,nrCols) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    var std_iMake = exe.lib.std.iMake;
    var error = UnitObject.prototype.propagateError(std_iMake, x, nrRows, nrCols);
    if (error) {
        return error;
    }

    if(!nrRows.isNormal() || !nrCols.isNormal()) {
        return new UnitObject(std_iMake(x, nrRows.value, nrCols.value), {}, "unitError",
            "Arguments 2 and 3 (=dimensions) of iMake must be unitless; current units are: <"+ nrRows.toString() +">  and <"+ nrCols.toString() +">, respectively");
    } else {
        return std_iMake(x, nrRows.value, nrCols.value);
    }
}
