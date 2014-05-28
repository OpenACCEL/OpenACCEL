function or(x, y) {
    return zip(x, y, function(x, y) {
        return (x || y);
    });
}

or.base = false;
