function imply(x, y) {
    return binaryZip(x, y, function(a, b) {
        return (!a || b);
    });
}
