function history(quantity, time, base) {
    if (time < 1) {
        throw new Error('For delayed quantities, the value must be at least 1');
    }

    quantity = exe[quantity];

    // Bounds check for history span
    if (time > quantity.timespan) {
        quantity.timespan = time;
    }

    var historyValue = quantity.hist[time];
    if (historyValue === undefined) {
        // Check ofr the existance of a base case, which will be a function if present.
        if (base) {
            return base();
        } else {
            return 0;
        }
    } else {
        return historyValue;
    }
}
