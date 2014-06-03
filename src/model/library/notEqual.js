function notEqual(x, y) {
    return zip([x, y], function(a, b) {
        return (a != b);
    });
}
