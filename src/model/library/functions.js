/**
 * @memberof Model.Library
 * Returns one of two arguments based on a conditional argument.
 * @param  condition	array taking the role of the first input of the function
 * @param  ifTrue		Value returned if cond evaluates to true
 * @param  ifFalse		Value returned if cond evaluates to false
 * @return 				ifTrue if condition evaluates to true, ifFalse if condition evaluates to false
 */
function __if__(condition, ifTrue, ifFalse) {
    return multiaryZip([condition, ifTrue, ifFalse], function(conditionInner, ifTrueInner, ifFalseInner) {
        if (conditionInner) {
            return ifTrueInner;
        } else {
            return ifFalseInner;
        }
    });
}
function abs(x) {
    return unaryZip(x, Math.abs);
}
function acos(x) {
    return unaryZip(x, Math.acos);
}
function add(x, y) {
    return binaryZip(x, y, function(a, b) {
        return a + b;
    });
}
function and(x, y) {
    return binaryZip(x, y, function(a, b) {
        return (a && b);
    });
}
function asin(x) {
    return unaryZip(x, Math.asin);
}
function atan(x) {
    return unaryZip(x, Math.atan);
}
function atan2(x, y) {
	return Math.atan2(y, x);
}
function bin(x, y) {
    return binaryZip(x, y, function(a, b) {
        if (b > a) {
            return 0;
        } else {
            return fact(a) / (fact(b) * fact(a - b));
        }
    });
}
/**
 * @memberof Model.Library
 * Applies the given function on the given array. The function is aplied recursively,
 * so also to nested arrays.
 * @param  {Array}   a        array taking the role of the first input of the function
 * @param  {Array}   b        array taking the role of the second input of the function
 * @param  {Function} func function that should be applied
 * @return {Array}            Resulting array.
 *
 * @memberof Model.Library
 */
function binaryZip(a, b, func) {
    var isScalarA = !(a instanceof Object);
    var isScalarB = !(b instanceof Object);

    if (!isScalarA || !isScalarB) {
        // Recursive step, a or b is an array
        var result = [];
        if (isScalarA) {
            // Case, a is a scalar, b is an array
            for (var key in b) {
                result[key] = binaryZip(a, b[key], func);
            }
            return result;
        }
        if (isScalarB) {
            // Case, b is a scalar, a is an array
            for (var key in a) {
                result[key] = binaryZip(a[key], b, func);
            }
            return result;
        }
        // Case, a and b are both arrays
        for (var key in a) {
            if (b[key] !== undefined) {
                result[key] = binaryZip(a[key], b[key], func);
            }
        }
        return result;
    } else {
        // Base: a and b are both scalar
        return func(a, b);
    }
}
function ceil(x) {
    return unaryZip(x, Math.ceil);
}
function cos(x) {
    return unaryZip(x, Math.cos);
}
function divide(x, y) {
    return binaryZip(x, y, function(a, b) {
        return a / b;
    });
}
function equal(x, y) {
    return binaryZip(x, y, function(a, b) {
        return (a == b);
    });
}
function exp(x) {
    return unaryZip(x, Math.exp);
}
function fact(x) {
    return unaryZip(x, function(a) {

        var factNum = [
            1,
            1,
            2,
            6,
            24,
            120,
            720,
            5040,
            40320,
            362880,
            3628800,
            39916800,
            479001600,
            6227020800,
            87178291200,
            1307674368000,
            20922789888000,
            355687428096000,
            6402373705728000,
            121645100408832000,
            2432902008176640000,
            51090942171709440000,
            1124000727777607680000,
            25852016738884976640000,
            620448401733239439360000,
            15511210043330985984000000,
            403291461126605635584000000,
            10888869450418352160768000000,
            304888344611713860501504000000,
            8841761993739701954543616000000,
            265252859812191058636308480000000,
            8222838654177922817725562880000000,
            263130836933693530167218012160000000,
            8683317618811886495518194401280000000,
            295232799039604140847618609643520000000,
            10333147966386144929666651337523200000000,
            371993326789901217467999448150835200000000,
            13763753091226345046315979581580902400000000,
            523022617466601111760007224100074291200000000,
            20397882081197443358640281739902897356800000000,
            815915283247897734345611269596115894272000000000,
            33452526613163807108170062053440751665152000000000,
            1405006117752879898543142606244511569936384000000000,
            60415263063373835637355132068513997507264512000000000,
            2658271574788448768043625811014615890319638528000000000,
            119622220865480194561963161495657715064383733760000000000,
            5502622159812088949850305428800254892961651752960000000000,
            258623241511168180642964355153611979969197632389120000000000,
            12413915592536072670862289047373375038521486354677760000000000,
            608281864034267560872252163321295376887552831379210240000000000,
            30414093201713378043612608166064768844377641568960512000000000000,
            1551118753287382280224243016469303211063259720016986112000000000000,
            80658175170943878571660636856403766975289505440883277824000000000000,
            4274883284060025564298013753389399649690343788366813724672000000000000,
            230843697339241380472092742683027581083278564571807941132288000000000000,
            12696403353658275925965100847566516959580321051449436762275840000000000000,
            710998587804863451854045647463724949736497978881168458687447040000000000000,
            40526919504877216755680601905432322134980384796226602145184481280000000000000,
            2350561331282878571829474910515074683828862318181142924420699914240000000000000,
            138683118545689835737939019720389406345902876772687432540821294940160000000000000,
            8320987112741390144276341183223364380754172606361245952449277696409600000000000000,
            507580213877224798800856812176625227226004528988036003099405939480985600000000000000,
            31469973260387937525653122354950764088012280797258232192163168247821107200000000000000,
            1982608315404440064116146708361898137544773690227268628106279599612729753600000000000000,
            126886932185884164103433389335161480802865516174545192198801894375214704230400000000000000,
            8247650592082470666723170306785496252186258551345437492922123134388955774976000000000000000,
            544344939077443064003729240247842752644293064388798874532860126869671081148416000000000000000,
            36471110918188685288249859096605464427167635314049524593701628500267962436943872000000000000000,
            2480035542436830599600990418569171581047399201355367672371710738018221445712183296000000000000000,
            171122452428141311372468338881272839092270544893520369393648040923257279754140647424000000000000000,
            11978571669969891796072783721689098736458938142546425857555362864628009582789845319680000000000000000,
            850478588567862317521167644239926010288584608120796235886430763388588680378079017697280000000000000000,
            61234458376886086861524070385274672740778091784697328983823014963978384987221689274204160000000000000000,
            4470115461512684340891257138125051110076800700282905015819080092370422104067183317016903680000000000000000,
            330788544151938641225953028221253782145683251820934971170611926835411235700971565459250872320000000000000000,
            24809140811395398091946477116594033660926243886570122837795894512655842677572867409443815424000000000000000000,
            1885494701666050254987932260861146558230394535379329335672487982961844043495537923117729972224000000000000000000,
            145183092028285869634070784086308284983740379224208358846781574688061991349156420080065207861248000000000000000000,
            11324281178206297831457521158732046228731749579488251990048962825668835325234200766245086213177344000000000000000000,
            894618213078297528685144171539831652069808216779571907213868063227837990693501860533361810841010176000000000000000000,
            71569457046263802294811533723186532165584657342365752577109445058227039255480148842668944867280814080000000000000000000,
            5797126020747367985879734231578109105412357244731625958745865049716390179693892056256184534249745940480000000000000000000,
            475364333701284174842138206989404946643813294067993328617160934076743994734899148613007131808479167119360000000000000000000,
            39455239697206586511897471180120610571436503407643446275224357528369751562996629334879591940103770870906880000000000000000000,
            3314240134565353266999387579130131288000666286242049487118846032383059131291716864129885722968716753156177920000000000000000000,
            281710411438055027694947944226061159480056634330574206405101912752560026159795933451040286452340924018275123200000000000000000000,
            24227095383672732381765523203441259715284870552429381750838764496720162249742450276789464634901319465571660595200000000000000000000,
            2107757298379527717213600518699389595229783738061356212322972511214654115727593174080683423236414793504734471782400000000000000000000,
            185482642257398439114796845645546284380220968949399346684421580986889562184028199319100141244804501828416633516851200000000000000000000,
            16507955160908461081216919262453619309839666236496541854913520707833171034378509739399912570787600662729080382999756800000000000000000000,
            1485715964481761497309522733620825737885569961284688766942216863704985393094065876545992131370884059645617234469978112000000000000000000000,
            135200152767840296255166568759495142147586866476906677791741734597153670771559994765685283954750449427751168336768008192000000000000000000000,
            12438414054641307255475324325873553077577991715875414356840239582938137710983519518443046123837041347353107486982656753664000000000000000000000,
            1156772507081641574759205162306240436214753229576413535186142281213246807121467315215203289516844845303838996289387078090752000000000000000000000,
            108736615665674308027365285256786601004186803580182872307497374434045199869417927630229109214583415458560865651202385340530688000000000000000000000,
            10329978488239059262599702099394727095397746340117372869212250571234293987594703124871765375385424468563282236864226607350415360000000000000000000000,
            991677934870949689209571401541893801158183648651267795444376054838492222809091499987689476037000748982075094738965754305639874560000000000000000000000,
            96192759682482119853328425949563698712343813919172976158104477319333745612481875498805879175589072651261284189679678167647067832320000000000000000000000,
            9426890448883247745626185743057242473809693764078951663494238777294707070023223798882976159207729119823605850588608460429412647567360000000000000000000000,
            933262154439441526816992388562667004907159682643816214685929638952175999932299156089414639761565182862536979208272237582511852109168640000000000000000000000,
            93326215443944152681699238856266700490715968264381621468592963895217599993229915608941463976156518286253697920827223758251185210916864000000000000000000000000
        ];

        if (a > 100 || a < 0) {
            throw new Error("The factorial of numbers less than 0 or greater than 100 are not supported.");
        } else {
            a = Math.round(a);
            return factNum[a];
        }
    });
}
function floor(x) {
    return unaryZip(x, Math.floor);
}
function greaterThan(x, y) {
    return binaryZip(x, y, function(a, b) {
        return (a > b);
    });
}
function greaterThanEqual(x, y) {
    return binaryZip(x, y, function(a, b) {
        return (a >= b);
    });
}
function imply(x, y) {
    return binaryZip(x, y, function(a, b) {
        return (!a || b);
    });
}
function lessThan(x, y) {
    return binaryZip(x, y, function(a, b) {
        return (a < b);
    });
}
function lessThanEqual(x, y) {
    return binaryZip(x, y, function(a, b) {
        return (a <= b);
    });
}
function ln(x) {
    return unaryZip(x, Math.log);
}
function log(x) {
    return Math.log(x) / Math.log(10);
}
function max() {
    return zip(arguments, Math.max);
}
function min() {
    return zip(arguments, Math.min);
}
function modulo(x, y) {
    return binaryZip(x, y, function(a, b) {
        return a % b;
    });
}
/**
 * Applies the given function on the given array of arrays. The function is aplied recursively,
 * so also to nested arrays.
 * @param  {Array}      x       array of inputs used in the function of interest, each of which may be an array itself
 * @param  {Function}   func    function that should be applied
 * @return {Array}              resulting array
 */
function multiaryZip(x, func) {
    var numArgs = x.length;
    var allScalar = true;
    for (var inKey = numArgs - 1; inKey >= 0; inKey--) {
        if (x[inKey] instanceof Object) {
            // Determine if there is an array in the input.
            allScalar = false;
            break;
        }
    }
    if (allScalar) {
        // Base: all elements in x are scalar
        return func.apply(this, x);
    } else {
        // Return variable.
        var result = [];
        // Set of keys that are valid candidates for matching with the rest of the input,
        // thus having a potential place in the output.
        var referenceKeys;
        // Number of keys in the set of referenceKeys.
        var numKeys;
        for (var inKey = numArgs - 1; inKey >= 0; inKey--) {
            if (x[inKey] instanceof Object) {
                // Keys of contender for input of reference found.
                referenceKeys = Object.keys(x[inKey]);
                numKeys = referenceKeys.length;
                // Cut off the loop as soon as possible
                break;
            }
        }
        // True if resultKey occurs in every input in x.
        var isCommonKey;
        // Input to be used for the recursive call.
        var recursiveInput;
        for (var resultKey = numKeys - 1; resultKey >= 0; resultKey--) {
            // Start with empty input
            recursiveInput = [];
            // Key occurs in every input until proven otherwise.
            isCommonKey = true;
            // Loop over all inputs in x.
            for (var inKey = numArgs - 1; inKey >= 0; inKey--) {
                if (x[inKey] instanceof Object) {
                    // Check if keys contained in all objects
                    if (x[inKey][referenceKeys[resultKey]] !== undefined) {
                        recursiveInput[inKey] = x[inKey][referenceKeys[resultKey]];
                    } else {
                        // Key does not occur in this array.
                        isCommonKey = false;
                        // Cut short loop to save processing time.
                        break;
                    }
                } else {
                    // Input x[inKey] is a scalar.
                    recursiveInput[inKey] = x[inKey];
                }
            }
            // Key occurs in all non-scalar inputs.
            if (isCommonKey) {
                // Put the recursive result in the representative key.
                result[referenceKeys[resultKey]] = multiaryZip(recursiveInput, func);
            }
        }
        return result;
    }
}
function multiply(x, y) {
    return binaryZip(x, y, function(a, b) {
        return a * b;
    });
}
function not(x) {
    return unaryZip(x, function(a) {
        return (!a);
    });
}
function notEqual(x, y) {
    return binaryZip(x, y, function(a, b) {
        return (a != b);
    });
}
function or(x, y) {
    return binaryZip(x, y, function(a, b) {
        return (a || b);
    });
}
// TODO: UNIT checking, since poisson function should not allow arguments with units.


function poisson(x, y, z) {
    return multiaryZip([x, y, z], function(a, b, c) {
        if (a < 0 || b < 0) {
            throw new Error("The poisson of numbers less than 0 are not supported.");
        } else {
            if (!c) {
                return ((Math.pow(b, a) * Math.exp(-b)) / fact(a));
            } else {
                if (b < 20 && a < 20) {
                    var poisson = 0;
                    var expY = Math.exp(-b)
                    var power = 1;
                    for (i = 0; i <= a; i++) {
                        poisson += expY * power / fact(i);
                        power *= b;
                    }
                    return poisson;
                } else {
                    //from: http://www.questia.com/googleScholar.qst?docId=5000227714
                    var a = Math.exp(-b);
                    var poisson = a;
                    for (i = 2; i < a + 1; i++) {
                        a = a * b / (i - 1);
                        poisson += a;
                    }
                    return poisson;
                }
            }
        }
    });

}
function pow(x, y) {
    return Math.pow(x, y);
}
function random() {
	return Math.random();
}
function round(x) {
    return unaryZip(x, Math.round);
}
function sin(x) {
    return unaryZip(x, Math.sin);
}
function sqrt(x) {
    return unaryZip(x, Math.sqrt);
}
function subtract(x, y) {
    return binaryZip(x, y, function(a, b) {
        return a - b;
    });
}
function sum() {
    return zip(arguments, function() {
        var _sum = 0;
        for (var i = arguments.length - 1; i >= 0; i--) {
            _sum += arguments[i];
        }
        return _sum;
    });
}
function tan(x) {
    return unaryZip(x, Math.tan);
}
/**
 * Applies the given function on the given array or scalar. The function is aplied recursively,
 * so also to nested arrays.
 * @param  {Array | Number}   a        array or scalar to which the given function should be applied
 * @param  {Function} func function that should be applied
 * @return {Array | Number}            Result of applying operator.
 *
 * @memberof Model.Library
 */
function unaryZip(a, func) {
    if (a instanceof Object) {
        // Recursive step, a is an array
        var result = [];
        for (var key in a) {
            result[key] = unaryZip(a[key], func);
        }
        return result;
    } else {
        // Base: a is a scalar
        return func(a);
    }
}
/**
 * Applies the given function on the given array of inputs. The function is aplied recursively,
 * so also to nested arrays. This fucntion is to be called by anything that wants to use either map, binaryZip or nzip.
 * This function automatically calls the most efficient function for the job.
 * @param  {Array}      x       array of inputs used in the function of interest, each of which may be an array itself
 * @param  {Function}   func    function that should be applied
 * @return {Array}              resulting array
 * @throws
 */
function zip(x, func) {
    var numArgs = x.length;
    switch (numArgs) {
        case 0:
            throw new error("Cannot zip with zero arguments, attempted by: " + arguments.callee.caller.name);
            break;
        case 1:
            return unaryZip(x[0], func);
            break;
        case 2:
            return binaryZip(x[0], x[1], func);
            break;
        default:
            return multiaryZip(x, func);
            break;
    }
}
