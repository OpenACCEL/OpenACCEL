function foldl(a, func) {
    var result = func.base;
    if (a instanceof Object) {
        var length = vLen(a);
        for (var i = 0; i < length; i++) {
            result = func(a[i], result);
        }
    } else {
        result = func(a, result);
    }
    return result;
}
