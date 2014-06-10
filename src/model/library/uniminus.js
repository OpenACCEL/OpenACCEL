function uniminus(x) {
    return unaryZip(x, function(a) {
        return -1*a;
    });
}
