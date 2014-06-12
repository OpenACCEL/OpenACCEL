macro history {
    rule {
        (((typeof $quantity:ident !== 'undefined') ? $quantity:ident : exe.$quantity:ident()), $time:expr)
    } => {
        (function() {
            if ($time < 1) {
                throw new Error('For delayed qyantities, the value must be at leat 1. (porblematic quantity:' + $quantity + ')');
            }
            var historyValue = exe.$quantity.hist[exe.time - $time];
            if (historyValue === undefined) {
                return 0;
            } else {
                return historyValue;
            }
        })()
    }
}
