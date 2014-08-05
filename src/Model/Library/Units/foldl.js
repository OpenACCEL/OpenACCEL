function foldl(a, func) {
    var result = new UnitObject(func.base);
    if (a instanceof Array) {
        var length = a.length;
        for (var i = 0; i < length; i++) {
            result = func(result, a[i]);
        }
    } else {
        result = func(result, a);
    }
    return result;
}
