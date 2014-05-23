function sum() {
    var _sum = 0;
    for (var i = arguments.length - 1; i >= 0; i--) {
        _sum += arguments[i];
    }
    return _sum;
}
