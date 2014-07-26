//This function was taken from keesvanoverveld.com
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
    return std_iMake(x, nrRows.value, nrCols.value);

    // var r1 = Math.round(nrRows);
    // var r2 = Math.round(nrCols);
    // if (r1 >= 0 && r2 >= 0) {
    //     var rr = [];
    //     for (i = 0; i < r1; i++) {
    //         rr[i] = [];
    //         for (j = 0; j < r2; j++) {
    //             rr[i][j] = x;
    //         }
    //     }
    //     return rr;
    // } else {
    //     return [];
    // }
}
