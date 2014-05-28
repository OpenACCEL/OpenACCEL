// TODO: UNIT checking, since poisson function should not allow arguments with units.


function poisson(x, y, z) {
    return nzip([x, y, z], function(x, y, z) {
        if (x < 0 || y < 0) {
            throw new Error("The poisson of numbers less than 0 are not supported.");
        } else {
            if (!z) {
                return ((Math.pow(y, x) * Math.exp(-y)) / fact(x));
            } else {
                if (y < 20 && x < 20) {
                    var poisson = 0;
                    var expY = Math.exp(-y)
                    var power = 1;
                    for (i = 0; i <= x; i++) {
                        poisson += expY * power / fact(i);
                        power *= y;
                    }
                    return poisson;
                } else {
                    //from: http://www.questia.com/googleScholar.qst?docId=5000227714
                    var a = Math.exp(-y);
                    var poisson = a;
                    for (i = 2; i < x + 1; i++) {
                        a = a * y / (i - 1);
                        poisson += a;
                    }
                    return poisson;
                }
            }
        }
    });

}
