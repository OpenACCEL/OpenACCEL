function quantifier(domain, mapFunc, foldFunc) {
    var mapResult = unaryZip(domain, mapFunc);
    return foldl(mapResult, foldFunc);
}