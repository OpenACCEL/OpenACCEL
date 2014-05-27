function foldl(a, func) {
    var result = func.base;
    if (a instanceof Object) {
        for (var i = 0; i < a.length; i++) {
            result = func(foldl(a[i], func), result);
        }
    } else {
        result = func(a, result);
    }
    return result;
}
