function modulo(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    return binaryZip(x, y, function(a, b) {
        if (b != 0.0) {
            var mm = a % b;
            if (mm >= 0) {
                return mm;
            } else {
                return mm + b;
            }
        } else {
            throw new Error("\ndivision by zero in modulo");
        }
    });
}
