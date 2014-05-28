function foldl(a, func) {
    var result = func.base;
    if (a instanceof Object) {
        for (var i = 0; i < a.length; i++) {
            result = func(a[i], result);
        }
    } else {
        result = func(a, result);
    }
    return result;
}
