let cos = macro {
    rule { ($x) } => {
        (function() {
            return Math.cos($x);
        })()
    }

    rule { ($x:expr) } => {
        (function() {
            return Math.cos($x);
        })()
    }
}