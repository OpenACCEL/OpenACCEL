function iMake(x,nrRows,nrCols) {
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
