function bin(x, y) {
    return zip(x, y, function(x, y) {
    	if (y > x) { 
    	    return 0;
    	} else {
    	    return fact(x) / (fact(y) * fact(x - y));
    	}
    });
}
