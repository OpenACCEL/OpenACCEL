let quantifier = macro {
    rule {
        ($dummy:ident, $domain:expr, $exp:expr, $func:expr)
    } => {
        (function() {
            var domain = $domain;

            var zipResult = unaryZip(domain, function($dummy) {
                return $exp;
            });

            return foldl(zipResult, $func);
        })()
    }
}
