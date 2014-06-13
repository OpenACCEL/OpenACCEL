function bin(x, y) {
    return zip([x, y], function(a, b) {
        if (b > a) {
            return 0;
        } else {
            return factorial(a) / (factorial(b) * factorial(a - b));
        }
    });
}
