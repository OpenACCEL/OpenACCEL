function nzipcees(x, f) {
    // x= array of arguments, starting with 0
    // f=Jensen's device, that is: the pointer to the actual function that is to be evaluated
    // first see if any of the arguments is an array
    var l = Number.MAX_VALUE;
    var n = x.length;
    var ntm = false;
    for (var i = 0; i < n; i++) {
        if (x[i]instanceof Array) {
            ntm = true;
        }
    }
    if (!ntm) {
        return f(x);
    } else {
        var rr,xx,k;
        for (var i = 0; i < n; i++) {
            if (x[i]instanceof Array) {
                // we are tolerant with respect to
                // size mismatches.
                l = Math.min(l, x[i].length);
            }
        }
        rr = [];
        for (var j = 0; j < l; j++) {
            xx = [];
            for (var i = 0; i < n; i++) {
                if (!(x[i]instanceof Array)) {
                    xx[i] = x[i];
                } else {
                    xx[i]=x[i][j];
                }
            }
            rr[j] = nzipcees(xx, f);
        }
        // perhaps there are also non-integer indices. These are not seen
        // by the length-operator; we need to use the for(var in array)-construction.
        var keys = [];
        for (i = 0; i < n; i++) {
            if (x[i]instanceof Array) {
                for (j in x[i]) {
                    if (!isNumeric(j)) {
                        if(keys.indexOf(j)== -1)
                            keys.push(j);
                    }
                }
            }
        }
        // the array keys now contains the keys that occur in at least one of the arrays
        for (k = 0; k < keys.length; k++) {
            var occursInAll = true;
            xx=[];
            for (i = 0; i < n; i++) {
                if (!(x[i]instanceof Array)) {
                    xx[i] = x[i];
                } else {
                    if (x[i][keys[k]] != undefined) {
                        xx[i]=x[i][keys[k]];
                    } else {
                        occursInAll = false;
                    }
                }
            }
            if (occursInAll) {
                rr[keys[k]] = nzipcees(xx, f);
            }
        }
        return rr;
    }
}

function isNumeric (o) {
    return ! isNaN (o-0);
}

function addCees(x) {
    return x[0] + x[1];
}

function sumCees(x) {
    var _sum = 0;
    for (var i = x.length - 1; i >= 0; i--) {
        _sum += x[i];
    }
    return _sum;
}
