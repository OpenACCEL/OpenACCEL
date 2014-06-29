function pow(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    return zip([x, y], function(a, b) {
        if (a >= 0) {
            return Math.pow(a, b);
        } else {
            // a<0
            if (b > 0) {
                return Math.pow(Math.abs(a), b);
            } else {
                if (b == parseInt(b)) {
                    if ((b % 2) === 0) {
                        return 1.0 / Math.pow(Math.abs(a), Math.abs(b));
                    } else {
                        return -1.0 / Math.pow(Math.abs(a), Math.abs(b));
                    }
                } else {
                    throw new Error("\npower of negative number to a non-integer exponent is not defined in the real numbers (would be a complex number)");
                }
            }
        }
    });

}
