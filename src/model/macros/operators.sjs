operator (_+_) 12 left { $l, $r } => #{ add($l, $r) }
operator (_-_) 12 left { $l, $r } => #{ subtract($l, $r) }
operator (_*_) 14 left { $l, $r } => #{ multiply($l, $r) }
operator (_/_) 14 left { $l, $r } => #{ divide($l, $r) }
