function debug(c, v) {
    return new UnitObject(exe.lib.std.debug(c.value, unaryZip(v, function(x) {
    	return x.value;
    })));
}
