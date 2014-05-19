let asin = macro {
    rule { ($x) } => {
        (function() {
            return Math.asin($x);
        })()
    }

    rule { ($x:expr) } => {
        (function() {
            return Math.asin($x);
        })()
    }
}