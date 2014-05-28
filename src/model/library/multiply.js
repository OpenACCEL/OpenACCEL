function multiply(x, y) {
	return zip(x, y, function() {
        return x * y;
    });
}

multiply.base = 1;
