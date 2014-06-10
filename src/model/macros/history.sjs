macro history {
    rule {
        (((typeof $quantity:ident !== 'undefined') ? $quantity:ident : exe.$quantity:ident()), $time:expr)
    } => {
        (function() {
            var historyValue = exe.$quantity[exe.time - $time];
            if (historyValue === undefined) {
                return 0;
            } else {
                return historyValue;
            }
        })()
    }
}
