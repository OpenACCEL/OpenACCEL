operator (__add__) 12 left { $l, $r } => #{ add($l, $r) }
operator (__subtract__) 12 left { $l, $r } => #{ subtract($l, $r) }
operator (__multiply__) 14 left { $l, $r } => #{ multiply($l, $r) }
operator (__divide__) 14 left { $l, $r } => #{ divide($l, $r) }
operator (__modulo__) 14 left { $l, $r } => #{ modulo($l, $r) }

operator (__and__) 5 left { $l, $r } => #{ and($l, $r) }
operator (__equal__) 9 left { $l, $r } => #{ equal($l, $r) }
operator (__gt__) 10 left { $l, $r } => #{ greaterThan($l, $r) }
operator (__geq__) 10 left { $l, $r } => #{ greaterThanEqual($l, $r) }
operator (__lt__) 10 left { $l, $r } => #{ lessThan($l, $r) }
operator (__leq__) 10 left { $l, $r } => #{ lessThanEqual($l, $r) }
operator (__neq__) 9 left { $l, $r } => #{ notEqual($l, $r) }
operator (__or__) 4 left { $l, $r } => #{ orEqual($l, $r) }

operator (__not__) 14 { $u } => #{ not($u) }
operator (__subtract__) 14 { $u } => #{ -$u }
