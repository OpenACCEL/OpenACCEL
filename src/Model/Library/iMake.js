//This function was taken from keesvanoverveld.com
function iMake(x,nrRows,nrCols) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    var r1 = Math.round(nrRows);
    var r2 = Math.round(nrCols);
    if (r1 >= 0 && r2 >= 0) {
        var rr = [];
        for (i = 0; i < r1; i++) {
            rr[i] = [];
            for (j = 0; j < r2; j++) {
                rr[i][j] = x;
            }
        }
        return rr;
    } else {
        return [];
    }
}
