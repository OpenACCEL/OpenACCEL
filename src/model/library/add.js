function add(x, y) {
    return zip(x, y, function() {
        return x + y;
    });
}
