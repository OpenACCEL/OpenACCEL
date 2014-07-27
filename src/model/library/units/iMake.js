function iMake(x,nrRows,nrCols) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    x = unaryZip(x, function(a) {
        if (!(a instanceof UnitObject)) {
            return new UnitObject(a);
        } else {
            return a;
        }
    });

    if (!(nrRows instanceof UnitObject)) {
        nrRows = new UnitObject(nrRows);
    }
    if (!(nrCols instanceof UnitObject)) {
        nrCols = new UnitObject(nrCols);
    }

    var std_iMake = exe.lib.std.iMake;
    // TODO error propagation

    var ans;
    if(!nrRows.isNormal() || !nrCols.isNormal()) {
        ans = new UnitObject(std_iMake(x,nrRows,nrCols), {}, "unitError");
        ans.errorString = "Arguments 2 and 3 (=dimensions) of iMake must be unitless; current units are: <"+ nrRows.toString() +">  and <"+ nrCols.toString() +">, respectively";
    } else {
        ans = std_iMake(x, nrRows.value, nrCols.value);
    }
    return ans
}
