function iSpike(x1,x2,y1,y2) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    if (!(x1 instanceof UnitObject)) {
        x1 = new UnitObject(x1);
    }
    if (!(x2 instanceof UnitObject)) {
        x2 = new UnitObject(x2);
    }
    if (!(y1 instanceof UnitObject)) {
        y1 = new UnitObject(y1);
    }
    if (!(y2 instanceof UnitObject)) {
        y2 = new UnitObject(y2);
    }

    var std_iSpike = exe.lib.std.iSpike;
    var error = UnitObject.prototype.propagateError(std_iSpike, x1, x2, y1, y2);
    if (error) {
        return error;
    }

    var ans;
    if(!x1.isNormal() || !x2.isNormal() || !y1.isNormal() || !y2.isNormal()) {
        ans = new UnitObject(std_iSpike(x1.value, x2.value, y1.value, y2.value), {}, "unitError");
        ans.errorString = "All arguments of iSpike must be unitless; current units are: <"+ x1.toString() +">, <"+ x2.toString() +">, <" + y1.toString() + "> and <" + y2.toString() + "> respectively";
    } else {
        ans = new UnitObject(std_iSpike(x1.value, x2.value, y1.value, y2.value), {}, null);
    }

    return ans;
}
