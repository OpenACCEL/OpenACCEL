function not(x) {
    return unaryZip(x, function(a) {
        return (!a);
    });
}
