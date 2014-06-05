function multiply(x, y) {
    return zip([x, y], function(a, b) {
        return a * b;
    });
}

multiply.base = 1;
