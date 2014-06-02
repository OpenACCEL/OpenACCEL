function not(x) {
    return zip([x], function(a) {
        return (!a);
    });
}
