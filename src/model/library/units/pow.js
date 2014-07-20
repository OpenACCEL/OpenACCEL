function pow(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    return zip([x, y], function(a, b) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        if (!(b instanceof UnitObject)) {
            b = new UnitObject(b);
        }

        var std_pow = exe.lib.std.pow;

        // The exponent must be unitless.
        // Take note however, that the exponent will also always be a UnitObject.
        if (b.hasUnit()) {
            ans = new UnitObject(std_pow(a.value, b.value), { }, "unitError");
            ans.errorString = "Exponent is not unitless";
            return ans;
        }

        // Throw an error if the exponent is not an integer.
        if (b.value % 1 !== 0) {
            ans = new UnitObject(std_pow(a.value, b.value), { }, "unitError");
            ans.errorString = "Non integer exponent";
            return ans;
        }

        ans = a.clone();
        ans.value = std_pow(ans.value, b.value);

        // Only modify the units if there's no error.
        if (!ans.error) {
            for (var key in ans.unit) {
                ans.unit[key] *= b.value;
            }
        }

        ans.clean();
        return ans;
    });

}
