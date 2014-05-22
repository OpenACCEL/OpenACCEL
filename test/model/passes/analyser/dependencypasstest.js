suite('dependencypass.js', function() {
    // Template module.
    var instance;
    var assert;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(['assert', 'model/passes/analyser/dependencypass'], function(assertModule, module) {
            console.log('Loaded \'DependencyPass\' module.');
            assert = assertModule;
            instance = new module();
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
            'j = f(a) + sin(1)'
        ];

        /**
         * The starting point from this Pass, starting from the script.
         */
        var beginReport = {
            a: {
                name: 'a',
                parameters: [],
                definition: 'b + c',
                todo: false,
                reverseDeps: []
            },
            b: {
                name: 'b',
                parameters: [],
                definition: '3',
                todo: false,
                reverseDeps: []
            },
            c: {
                name: 'c',
                parameters: [],
                definition: '5',
                todo: false,
                reverseDeps: []
            },
            f: {
                name: 'f',
                parameters: ['x'],
                definition: 'b - x',
                todo: false,
                reverseDeps: []
            },
            g: {
                name: 'g',
                parameters: [],
                definition: '[2, b, x:c]',
                todo: false,
                reverseDeps: []
            },
            h: {
                name: 'h',
                parameters: [],
                definition: '[b, x:[1, y:c, b], 3]',
                todo: false,
                reverseDeps: []
            },
            i: {
                name: 'i',
                parameters: [],
                definition: 'i = b * b',
                todo: false,
                reverseDeps: []
            },
            j: {
                name: 'j',
                parameters: [],
                definition: 'j = f(a) + sin(1)',
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
                parameters: [],
                definition: 'b + c',
                dependencies: ['b', 'c'],
                todo: false,
                reverseDeps: ['j']
            },
            b: {
                name: 'b',
                parameters: [],
                definition: '3',
                dependencies: [],
                todo: false,
                reverseDeps: ['a', 'f', 'g', 'h', 'i']
            },
            c: {
                name: 'c',
                parameters: [],
                definition: '5',
                dependencies: [],
                todo: false,
                reverseDeps: ['a','g','h']
            },
            f: {
                name: 'f',
                parameters: ['x'],
                definition: 'b - x',
                dependencies: ['b'],
                todo: false,
                reverseDeps: ['j']
            },
            g: {
                name: 'g',
                parameters: [],
                dependencies: ['b','c'],
                definition: '[2, b, x:c]',
                todo: false,
                reverseDeps: []
            },
            h: {
                name: 'h',
                parameters: [],
                dependencies: ['b','c'],
                definition: '[b, x:[1, y:c, b], 3]',
                todo: false,
                reverseDeps: []
            },
            i: {
                name: 'i',
                parameters: [],
                dependencies: ['b'],
                definition: 'i = b * b',
                todo: false,
                reverseDeps: []
            },
            j: {
                name: 'j',
                parameters: [],
                dependencies: ['f','a'],
                definition: 'j = f(a) + sin(1)',
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
                result = instance.analyse(line, result);
            });
            assert.deepEqual(result, endReport);
        });
    });
});
