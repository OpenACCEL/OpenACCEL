let sin = macro {
    rule { ($x) } => {
        (function() {
            return Math.sin($x);
        })()
    }

    rule { ($x:expr) } => {
        (function() {
            return Math.sin($x);
        })()
    }
}