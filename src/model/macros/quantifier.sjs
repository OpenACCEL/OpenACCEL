let quantifier = macro {
    rule {
        ($dummy:ident, $domain:expr, $exp:expr, $func:expr)
    } => {
        (function() {
            var domain = $domain;

            var zipResult = unaryZip(domain, (function($dummy) {
                return $exp;
            }).bind(this));

            return foldl(zipResult, $func);
        }).call(this)
    }
}
