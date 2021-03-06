function ramp(x, x1, y1, x2, y2) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    var std_ramp = exe.lib.std.ramp;
    var error = UnitObject.prototype.propagateError(std_ramp, x, x1, y1, x2, y2);
    if (error) {
        return error;
    }

    if(!x.equals(x1)) {
        return new UnitObject(std_ramp(x.value, x1.value, y1.value, x2.value, y2.value), {}, "unitError",
            "In the ramp-function, the first and second arguments must have the same units; now these are respectively <"+ x.toString() +"> and <"+ x1.toString() +">.");
    } else if (!x.equals(x2)) {
        return new UnitObject(std_ramp(x.value, x1.value, y1.value, x2.value, y2.value), {}, "unitError",
            "In the ramp-function, the first and fourth arguments must have the same units; now these are respectively <"+ x.toString() +"> and <"+ x2.toString() +">.");
    } else if (!y1.equals(y2)) {
        return new UnitObject(std_ramp(x.value, x1.value, y1.value, x2.value, y2.value), {}, "unitError",
            "In the ramp-function, the third and fifth arguments must have the same units; now these are respectively <"+ y1.toString() +"> and <"+ y2.toString() +">.");
    } else {
        return y1.clone(std_ramp(x.value, x1.value, y1.value, x2.value, y2.value));
    }
}
