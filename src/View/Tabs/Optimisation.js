require.config({
    baseUrl: "scripts"
});

define(["View/HTMLBuffer"], /**@lends View*/ function(HTMLBuffer) {
    function Optimization() {
        this.individualPropertiesBuffer = new HTMLBuffer('#propertiesGO');

        this.geneticOptimisationValues = {
            population: 25,
            stepsize: 1,
            crossover: 90,
            mutation: [70, 85],
            maxfront: 50
        };

        $('#populationsize').slider({
            range: "min",
            value: this.geneticOptimisationValues.population,
            min: 1,
            max: 500,
            step: 1,
            slide: (function(event, ui) {
                $('#populationsizevalue').html('(' + ui.value + ')');

                this.geneticOptimisationValues.population = ui.value;
                //No controller call until the associated button is pressed
            }).bind(this)
        });

        $('#stepsize').slider({
            range: "min",
            value: this.geneticOptimisationValues.stepsize,
            min: 1,
            max: 100,
            step: 1,
            slide: (function(event, ui) {
                $('#stepsizevalue').html('(' + ui.value + ')');

                this.geneticOptimisationValues.stepsize = ui.value;
                //No controller call until the associated button is pressed
            }).bind(this)
        });

        $('#crossover').slider({
            range: 'min',
            value: this.geneticOptimisationValues.crossover,
            min: 1,
            max: 100,
            step: 1,
            slide: (function(event, ui) {
                $('#crossovervalue').html('(' + ui.value + '%)');

                this.geneticOptimisationValues.crossover = ui.value;
                try {
                    controller.setCrossover(this.geneticOptimisationValues.crossover);
                } catch (e) {}
            }).bind(this)
        });

        var mutationcontrol = $('#mutation');
        //Add second range div
        mutationcontrol.prepend('<div class="ui-slider-range ui-widget-header ui-corner-all"></div>');
        //jQuery sliderify
        mutationcontrol.slider({
            range: true,
            values: this.geneticOptimisationValues.mutation,
            min: 0,
            max: 100,
            step: 1,
            slide: (function(event, ui) {
                var close = ui.values[0];
                var arbitrary = ui.values[1] - close;
                var random = 100 - arbitrary - close;

                $('#mutation .ui-slider-range:first-child').css({
                    width: close + '%'
                });

                $('#mutationvalue').html('' +
                        '<ul>' +
                            '<li>' +
                                '<div class = "legendbox" style = "background: #331144"></div>' +
                                'Close (' + close + '%)' +
                            '</li>' +
                            '<li>' +
                                '<div class = "legendbox" style = "background: #9900AA"></div>' +
                                'Arbitrary (' + arbitrary + '%)' +
                            '</li>' +
                            '<li>' +
                                '<div class = "legendbox" style = "background: #FFFFFF"></div>' +
                                'Random (' + random + '%)' +
                            '</li>' +
                        '</ul>');

                this.geneticOptimisationValues.mutation = ui.values;
                try {
                    controller.setMutation(this.geneticOptimisationValues.mutation);
                } catch (e) {

                }
            }).bind(this)
        });

        $('#maxfront').slider({
            range: "min",
            value: this.geneticOptimisationValues.maxfront,
            min: 1,
            max: 100,
            step: 1,
            slide: (function(event, ui) {
                $('#maxfrontvalue').html('(' + ui.value + '%)');

                this.geneticOptimisationValues.maxfront = ui.value;
                try {
                    controller.setMaxfront(this.geneticOptimisationValues.maxfront);
                } catch (e) {}
            }).bind(this)
        });

        var GOControls = $('.GOcontrol');
        GOControls.each(
            function(index, element) {
                var control = $(GOControls[index]);
                control.slider('option', 'slide').call(control, null, {
                    value: control.slider('option', 'value'),
                    values: control.slider('option', 'values')
                });
            }
        );

        $('#initGO').on('click',
            (function() {
                controller.initialiseGeneticOptimisation(this.geneticOptimisationValues.population);
                this.individualPropertiesBuffer.empty();
                this.individualPropertiesBuffer.flip();
            }).bind(this)
        );

        $('#stepGO').on('click',
            (function() {
                controller.nextGeneration(this.geneticOptimisationValues.stepsize);
                $('#plotGO').trigger('click');
            }).bind(this)
        );

        $('#plotGO').on('click',
            (function() {
                var individual = view.canvasses.go.getClickedIndividual();
                var q;

                this.individualPropertiesBuffer.empty();

                if (individual === null) {
                    this.individualPropertiesBuffer.flip();
                    return;
                }

                this.individualPropertiesBuffer.append('' +
                    '<h4>Category I quantities</h4>' +
                    '<div class = "divtable">' +
                        '<div>' +
                            '<div><em>name</em></div>' +
                            '<div><em>value</em></div>' +
                            '<div><em>minimum</em></div>' +
                            '<div><em>maximum</em></div>' +
                        '</div>');

                for (q in individual.inputvector) {
                    this.individualPropertiesBuffer.append('' +
                        '<div>' +
                            '<div class = "max128w ellipsis">' + individual.inputvector[q].name + '</div>' +
                            '<div class = "max128w ellipsis">' + individual.inputvector[q].value + '</div>' +
                            '<div class = "max128w ellipsis">' + individual.inputvector[q].minimum + '</div>' +
                            '<div class = "max128w ellipsis">' + individual.inputvector[q].maximum + '</div>' +
                        '</div>');
                }

                this.individualPropertiesBuffer.append('</div>');

                this.individualPropertiesBuffer.append('' +
                    '<h4>Category II quantities</h4>' +
                    '<div class = "divtable">' +
                        '<div>' +
                            '<div><em>name</em></div>' +
                            '<div><em>value</em></div>' +
                            '<div><em>optimisation</em></div>' +
                        '</div>');

                for (q in individual.outputvector) {
                    this.individualPropertiesBuffer.append('' +
                        '<div>' +
                            '<div class = "max128w ellipsis">' + individual.outputvector[q].name + '</div>' +
                            '<div class = "max128w ellipsis">' + individual.outputvector[q].value + '</div>' +
                            '<div class = "max128w ellipsis">' + (individual.outputvector[q].maximize ? 'Maximized' : 'Minimized') + '</div>' +
                        '</div>');
                }

                this.individualPropertiesBuffer.append('</div>');

                this.individualPropertiesBuffer.flip();
            }).bind(this)
        );

        $('#smartzoomGO').on('click',
            function() {
                controller.smartZoomGO();
            }
        );

        $('#zoomtofitGO').on('click',
            function() {
                controller.zoomToFitGO();
            }
        );
    }

    return Optimization;
});
