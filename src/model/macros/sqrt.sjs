let sqrt = macro {
    rule { ($x) } => {
        (function() {
            return Math.sqrt($x);
        })()
    }

    rule { ($x:expr) } => {
        (function() {
            return Math.sqrt($x);
        })()
    }
}