function poisson(x, y, z) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    return zip([x, y, z], function(a, b, c) {
        if (a < 0 || b < 0) {
            throw new Error("The poisson of numbers less than 0 are not supported.");
        } else {
            if (!c) {
                return ((Math.pow(b, a) * Math.exp(-b)) / factorial(a));
            } else {
                if (b < 20 && a < 20) {
                    var poisson = 0;
                    var expY = Math.exp(-b)
                    var power = 1;
                    for (i = 0; i <= a; i++) {
                        poisson += expY * power / factorial(i);
                        power *= b;
                    }
                    return poisson;
                } else {
                    //from: http://www.questia.com/googleScholar.qst?docId=5000227714
                    var a = Math.exp(-b);
                    var poisson = a;
                    for (i = 2; i < a + 1; i++) {
                        a = a * b / (i - 1);
                        poisson += a;
                    }
                    return poisson;
                }
            }
        }
    });

}
