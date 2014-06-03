suite('dependencypass.js', function() {
    // Template module.
    var instance;
    var qpass;
    var assert;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(['assert', 'model/passes/analyser/dependencypass', 'model/passes/analyser/quantitypass'],
                function(assertModule, module, qpassmodule) {
            console.log('Loaded \'DependencyPass\' module.');
            assert = assertModule;
            instance = new module();
            qpass = new qpassmodule();
            done();
        });
    });

    suite('DependencyPass', function() {


        /**
         * The script that we take as example for this pass.
         */
        var script = ['a = b + c ',
            'b = 3',
            'c = 5',
            'f(x) = b - x',
            'g = [2, b, x:c]',
            'h = [b, x:[1, y:c, b], 3]',
            'i = b * b',
            'j = f(a) + sin(1)',
            'k = #(i, [1,2,3], i * i, add)',
        ];

        /**
         * The starting point from this Pass, starting from the script.
         */
        var beginReport = {
            a: {
                name: 'a',
                LHS: 'a',
                parameters: [],
                definition: 'b + c',
                todo: false,
                dependencies: [],
                reverseDeps: []
            },
            b: {
                name: 'b',
                LHS: 'b',
                parameters: [],
                definition: '3',
                todo: false,
                dependencies: [],
                reverseDeps: []
            },
            c: {
                name: 'c',
                LHS: 'c',
                parameters: [],
                definition: '5',
                todo: false,
                dependencies: [],
                reverseDeps: []
            },
            f: {
                name: 'f',
                LHS: 'f(x)',
                parameters: ['x'],
                definition: 'b - x',
                todo: false,
                dependencies: [],
                reverseDeps: []
            },
            g: {
                name: 'g',
                LHS: 'g',
                parameters: [],
                definition: '[2, b, x:c]',
                todo: false,
                dependencies: [],
                reverseDeps: []
            },
            h: {
                name: 'h',
                LHS: 'h',
                parameters: [],
                definition: '[b, x:[1, y:c, b], 3]',
                todo: false,
                dependencies: [],
                reverseDeps: []
            },
            i: {
                name: 'i',
                LHS: 'i',
                parameters: [],
                definition: 'i = b * b',
                todo: false,
                dependencies: [],
                reverseDeps: []
            },
            j: {
                name: 'j',
                LHS: 'j',
                parameters: [],
                definition: 'j = f(a) + sin(1)',
                todo: false,
                dependencies: [],
                reverseDeps: []
            },
            k: {
                name: 'k',
                parameters: [],
                definition: 'k = #(i, [1,2,3], i * i, add)',
                todo: false,
                reverseDeps: []
            }
        };

        /**
         * The resulting report for this Pass.
         */
        var endReport = {
            a: {
                name: 'a',
                LHS: 'a',
                parameters: [],
                definition: 'b + c',
                dependencies: ['b', 'c'],
                todo: false,
                reverseDeps: ['j']
            },
            b: {
                name: 'b',
                LHS: 'b',
                parameters: [],
                definition: '3',
                dependencies: [],
                todo: false,
                reverseDeps: ['a', 'f', 'g', 'h', 'i']
            },
            c: {
                name: 'c',
                LHS: 'c',
                parameters: [],
                definition: '5',
                dependencies: [],
                todo: false,
                reverseDeps: ['a','g','h']
            },
            f: {
                name: 'f',
                LHS: 'f(x)',
                parameters: ['x'],
                definition: 'b - x',
                dependencies: ['b'],
                todo: false,
                reverseDeps: ['j']
            },
            g: {
                name: 'g',
                LHS: 'g',
                parameters: [],
                dependencies: ['b','c'],
                definition: '[2, b, x:c]',
                todo: false,
                reverseDeps: []
            },
            h: {
                name: 'h',
                LHS: 'h',
                parameters: [],
                dependencies: ['b','c'],
                definition: '[b, x:[1, y:c, b], 3]',
                todo: false,
                reverseDeps: []
            },
            i: {
                name: 'i',
                LHS: 'i',
                parameters: [],
                dependencies: ['b'],
                definition: 'b * b',
                todo: false,
                reverseDeps: []
            },
            j: {
                name: 'j',
                LHS: 'j',
                parameters: [],
                dependencies: ['f','a'],
                definition: 'f(a) + sin(1)',
                todo: false,
                reverseDeps: []
            },
            k: {
                name: 'k',
                parameters: [],
                dependencies: [],
                definition: 'k = #(i, [1,2,3], i * i, add)',
                todo: false,
                reverseDeps: []
            }

        };

        /**
         * Test case for analyse()
         */
        test('analyze()', function() {
            var result = beginReport;
            script.forEach(function(line) {
                var equalsIndex = line.indexOf('=');
                var lhs = line.substring(0, equalsIndex).trim();
                var qtyName =  lhs.match(/(\w*[a-zA-Z_]\w*(?!\w*\s*:))/g)[0];
                var quantity = result[qtyName];

                quantity = instance.analyse(line, quantity, result);
            });
            //assert.deepEqual(result, endReport);
        });
    });
});
