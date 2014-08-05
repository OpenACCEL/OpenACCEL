function history(quantity, time, base) {
    if (time < 1) {
        throw new Error('For delayed quantities, the value must be at least 1');
    }

    quantity = exe[quantity];
    if (time > quantity.timespan) {
        quantity.timespan = time.value;
    }

    var historyValue = quantity.hist[time.value];
    if (historyValue === undefined) {
        // Check ofr the existance of a base case, which will be a function if present.
        if (base) {
            return base();
        } else {
            return new UnitObject(0);
        }
    } else {
        return historyValue;
    }
}