function greaterThanEqual(x, y) {
    return zip(x, y, function(x, y) {
        return (x >= y);
    });
}
