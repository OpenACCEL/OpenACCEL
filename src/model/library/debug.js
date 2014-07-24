function debug(c, v) {
    if (typeof c === "string") {
        if (v instanceof Array) {
            var val = '';
            if (v['return'] !== undefined) {
                for (var k in v) {
                    val = val.concat(k).concat(":").concat(JSON.stringify(v[k])).concat(",");
                }
                // TODO, write message to debug windo or something
                //console.log(c + ": " + val.substring(0, val.length - 1));
                return v['return'];
            } else {
                throw new Error("\nFor function debug(), the second argument must be a vector, which must contain an element named 'return'");
            }
        } else {
            throw new Error("\nFor function debug(), the second argument must be a vector, the first element of which is returned to the caller");
        }
    } else {
        throw new Error("\nFor function debug(), the first argument must be a string (= text to help identify the debug output)");
    }
}
