function history(quantity, time) {
    if (time < 1) {
        throw new Error('For delayed quantities, the value must be at least 1');
    }

    quantity = exe[quantity];
    if (time > quantity.timespan) {
        quantity.timespan = time;
    }

    var historyValue = quantity.hist[time];
    if (historyValue === undefined) {
        return 0;
    } else {
        return historyValue;
    }
}