macro history {
    rule {
        (exe.$quantity:ident(), $time:expr)
    } => {
        (function() {
            var historyValue = exe.$quantity[exe.__time__ - $time];
            if (historyValue === undefined) {
                return 0;
            } else {
                return historyValue;
            }
        })()
    }
}
