function iMedian(x,n,m) {
    x = objectToArray(x);
    n = objectToArray(n);
    if (x instanceof Array) {
        var r1 = x.length;
        if (x[0] instanceof Array) {
            var r2 = x[0].length;
            if (!(n instanceof Array)) {
                n = Math.round(n);
                var nn = ((2 * n + 1) * (2 * n + 1) - 1) / 2;
                var j = 0;
                var jj = 0;
                var res = [];
                switch (m) {
                    case 0:
                        for (i = 0; i < r1; i++) {
                            res[i] = [];
                            for (ii = 0; ii < r2; ii++) {
                                res[i][ii] = 0;
                                var st = [];
                                for (j = -n; j <= n; j++) {
                                    var index1 = i + j;
                                    while (index1 < 0)
                                        index1 += r1;
                                    while (index1 >= r1)
                                        index1 -= r1;
                                    for (jj = -n; jj <= n; jj++) {
                                        var index2 = ii + jj;
                                        while (index2 < 0)
                                            index2 += r2;
                                        while (index2 >= r2)
                                            index2 -= r2;
                                        st.push(x[index1][index2]);
                                    }
                                }
                                st.sort();
                                var ppp = st[nn];
                                res[i][ii] = ppp;
                            }
                        }
                        return res;
                        break;
                    case 1:
                        for (i = 0; i < r1; i++) {
                            res[i] = [];
                            for (ii = 0; ii < r2; ii++) {
                                res[i][ii] = 0;
                                var st = [];
                                for (j = -n; j <= n; j++) {
                                    if (i + j >= 0 && i + j < r1) {
                                        for (jj = -n; jj <= n; jj++) {
                                            if (ii + jj >= 0 && ii + jj < r2) {
                                                st.push(x[i + j][ii + jj]);
                                            }
                                        }
                                    }
                                }
                                st.sort();
                                var ppp = st[nn];
                                res[i][ii] = ppp;
                            }
                        }
                        return res;
                        break;
                    case 2:
                        for (i = 0; i < r1; i++) {
                            res[i] = [];
                            for (ii = 0; ii < r2; ii++) {
                                res[i][ii] = 0;
                                var st = [];
                                for (j = -n; j <= n; j++) {
                                    var index1 = i + j;
                                    index1 = index1 < 0 ? 0 : (index1 >= r1 ? r1 - 1 : index1);
                                    for (jj = -n; jj <= n; jj++) {
                                        var index2 = ii + jj;
                                        index2 = index2 < 0 ? 0 : (index2 >= r2 ? r2 - 1 : index2);
                                        st.push(x[index1][index2]);
                                    }
                                }
                                st.sort();
                                var ppp = st[nn];
                                res[i][ii] = ppp;
                            }
                        }
                        return res;
                        break;
                    default:
                        throw new Error("\nconvolution: fourth argument must be 0, 1 or 2.");
                        break;
                }
            } else {
                throw new Error("\nconvolution: auto-mapping is not supported, third argument must be scalar.");
            }

        } else {
            return [];
        }
    } else {
        return [];
    }
}
