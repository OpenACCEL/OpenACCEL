suite("DependencyPass", function() {

    var assert;
    var dependencyPass;

    setup(function(done) {
        requirejs(['assert', 'model/analyser/passes/dependencypass'], function(Assert, DependencyPass) {
            assert = Assert;
            dependencyPass = new DependencyPass();
            done();
        });
    });

    suite('DependencyPass', function() {

        /**
         * The script that we take as example for this pass.
         */
        var script = ['a = b + c',
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
                source: 'a = b + c',
                parameters: [],
                definition: 'b + c',
                todo: false,
                dependencies: [],
                isTimeDependent: false,
                reverseDeps: []
            },
            b: {
                name: 'b',
                LHS: 'b',
                source: 'b = 3',
                parameters: [],
                definition: '3',
                todo: false,
                dependencies: [],
                isTimeDependent: false,
                reverseDeps: []
            },
            c: {
                name: 'c',
                LHS: 'c',
                source: 'c = 5',
                parameters: [],
                definition: '5',
                todo: false,
                dependencies: [],
                isTimeDependent: false,
                reverseDeps: []
            },
            f: {
                name: 'f',
                LHS: 'f(x)',
                source: 'f(x) = b - x',
                parameters: ['x'],
                definition: 'b - x',
                todo: false,
                dependencies: [],
                isTimeDependent: false,
                reverseDeps: []
            },
            g: {
                name: 'g',
                LHS: 'g',
                source: 'g = [2, b, x:c]',
                parameters: [],
                definition: '[2, b, x:c]',
                todo: false,
                dependencies: [],
                isTimeDependent: false,
                reverseDeps: []
            },
            h: {
                name: 'h',
                LHS: 'h',
                source: 'h = [b, x:[1, y:c, b], 3]',
                parameters: [],
                definition: '[b, x:[1, y:c, b], 3]',
                todo: false,
                dependencies: [],
                isTimeDependent: false,
                reverseDeps: []
            },
            i: {
                name: 'i',
                LHS: 'i',
                source: 'i = b * b',
                parameters: [],
                definition: 'b * b',
                todo: false,
                dependencies: [],
                isTimeDependent: false,
                reverseDeps: []
            },
            j: {
                name: 'j',
                LHS: 'j',
                source: 'j = f(a) + sin(1)',
                parameters: [],
                definition: 'f(a) + sin(1)',
                todo: false,
                dependencies: [],
                isTimeDependent: false,
                reverseDeps: []
            },
            k: {
                name: 'k',
                LHS: 'k',
                source: 'k = #(i, [1,2,3], i * i, add)',
                parameters: [],
                definition: '#(i, [1,2,3], i * i, add)',
                todo: false,
                dependencies: [],
                isTimeDependent: false,
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
                source: 'a = b + c',
                dependencies: ['b', 'c'],
                todo: false,
                isTimeDependent: false,
                reverseDeps: ['j']
            },
            b: {
                name: 'b',
                LHS: 'b',
                parameters: [],
                definition: '3',
                source: 'b = 3',
                dependencies: [],
                todo: false,
                isTimeDependent: false,
                reverseDeps: ['a', 'f', 'g', 'h', 'i']
            },
            c: {
                name: 'c',
                LHS: 'c',
                parameters: [],
                definition: '5',
                source: 'c = 5',
                dependencies: [],
                todo: false,
                isTimeDependent: false,
                reverseDeps: ['a','g','h']
            },
            f: {
                name: 'f',
                LHS: 'f(x)',
                parameters: ['x'],
                definition: 'b - x',
                source: 'f(x) = b - x',
                dependencies: ['b'],
                todo: false,
                isTimeDependent: false,
                reverseDeps: ['j']
            },
            g: {
                name: 'g',
                LHS: 'g',
                parameters: [],
                dependencies: ['b','c'],
                definition: '[2, b, x:c]',
                source: 'g = [2, b, x:c]',
                todo: false,
                isTimeDependent: false,
                reverseDeps: []
            },
            h: {
                name: 'h',
                LHS: 'h',
                parameters: [],
                dependencies: ['b','c'],
                definition: '[b, x:[1, y:c, b], 3]',
                source: 'h = [b, x:[1, y:c, b], 3]',
                todo: false,
                isTimeDependent: false,
                reverseDeps: []
            },
            i: {
                name: 'i',
                LHS: 'i',
                parameters: [],
                dependencies: ['b'],
                definition: 'b * b',
                source: 'i = b * b',
                todo: false,
                isTimeDependent: false,
                reverseDeps: []
            },
            j: {
                name: 'j',
                LHS: 'j',
                parameters: [],
                dependencies: ['f','a'],
                definition: 'f(a) + sin(1)',
                source: 'j = f(a) + sin(1)',
                todo: false,
                isTimeDependent: false,
                reverseDeps: []
            },
            k: {
                name: 'k',
                LHS: 'k',
                parameters: [],
                dependencies: [],
                definition: '#(i, [1,2,3], i * i, add)',
                source: 'k = #(i, [1,2,3], i * i, add)',
                todo: false,
                isTimeDependent: false,
                reverseDeps: []
            }

        };

        /**
         * Test case for analyse()
         */
        test('analyze()', function() {
            var result = beginReport;

            script.forEach(function(line) {
                // Parse quantity name from line
                var equalsIndex = line.indexOf('=');
                var lhs = line.substring(0, equalsIndex).trim();
                var qtyName =  lhs.match(/(\w*[a-zA-Z_]\w*(?!\w*\s*:))/g)[0];
                var quantity = result[qtyName];

                quantity = dependencyPass.analyse(line, quantity, result);
            });

            assert.deepEqual(result, endReport);
        });
    });
});
