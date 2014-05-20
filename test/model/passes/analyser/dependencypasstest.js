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
        var script = ['a = b + c \n',
            'b = 3\n',
            'c = 5\n',
            'f(x) = b - x'
        ];

        /**
         * The starting point from this Pass, starting from the script.
         */
        var beginReport = {
            a: {
                name: 'a',
                parameters: [],
                definition: 'b + c',
                todo: false
            },
            b: {
                name: 'b',
                parameters: [],
                definition: '3',
                todo: false
            },
            c: {
                name: 'c',
                parameters: [],
                definition: '5',
                todo: false
            },
            f: {
                name: 'f',
                parameters: ['x'],
                definition: 'b - x',
                todo: false
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
                todo: false
            },
            b: {
                name: 'b',
                parameters: [],
                definition: '3',
                dependencies: [],
                todo: false
            },
            c: {
                name: 'c',
                parameters: [],
                definition: '5',
                dependencies: [],
                todo: false
            },
            f: {
                name: 'f',
                parameters: ['x'],
                definition: 'b - x',
                dependencies: ['b'],
                todo: false
            }
        };

        /**
         * Test case for analyse()
         */
        test('analyze()', function() {
            assert.deepEqual(instance.analyse(script, beginReport), endReport);
        });
    });
});
