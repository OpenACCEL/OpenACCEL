let exp = macro {
    rule { ($x) } => {
        (function() {
            return Math.exp($x);
        })()
    }

    rule { ($x:expr) } => {
        (function() {
            return Math.exp($x);
        })()
    }
}