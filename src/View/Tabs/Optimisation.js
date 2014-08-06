var geneticOptimisationValues = {
    population: 25,
    stepsize: 1,
    crossover: 90,
    mutation: [70, 85],
    maxfront: 50
};

var individualPropertiesBuffer = new HTMLbuffer('#propertiesGO');

$(document).ready(
    function() {
        $('#populationsize').slider({
            range: "min",
            value: geneticOptimisationValues.population,
            min: 1,
            max: 500,
            step: 1,
            slide: function(event, ui) {
                $('#populationsizevalue').html('(' + ui.value + ')');

                geneticOptimisationValues.population = ui.value;
                //No controller call until the associated button is pressed
            }
        });

        $('#stepsize').slider({
            range: "min",
            value: geneticOptimisationValues.stepsize,
            min: 1,
            max: 100,
            step: 1,
            slide: function(event, ui) {
                $('#stepsizevalue').html('(' + ui.value + ')');

                geneticOptimisationValues.stepsize = ui.value;
                //No controller call until the associated button is pressed
            }
        });

        $('#crossover').slider({
            range: 'min',
            value: geneticOptimisationValues.crossover,
            min: 1,
            max: 100,
            step: 1,
            slide: function(event, ui) {
                $('#crossovervalue').html('(' + ui.value + '%)');

                geneticOptimisationValues.crossover = ui.value;
                try {
                    controller.setCrossover(geneticOptimisationValues.crossover);
                } catch (e) {}
            }
        });

        var mutationcontrol = $('#mutation');
        //Add second range div
        mutationcontrol.prepend('<div class="ui-slider-range ui-widget-header ui-corner-all"></div>');
        //jQuery sliderify
        mutationcontrol.slider({
            range: true,
            values: geneticOptimisationValues.mutation,
            min: 0,
            max: 100,
            step: 1,
            slide: function(event, ui) {
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

                geneticOptimisationValues.mutation = ui.values;
                try {
                    controller.setMutation(geneticOptimisationValues.mutation);
                } catch (e) {}
            }
        });

        $('#maxfront').slider({
            range: "min",
            value: geneticOptimisationValues.maxfront,
            min: 1,
            max: 100,
            step: 1,
            slide: function(event, ui) {
                $('#maxfrontvalue').html('(' + ui.value + '%)');

                geneticOptimisationValues.maxfront = ui.value;
                try {
                    controller.setMaxfront(geneticOptimisationValues.maxfront);
                } catch (e) {}
            }
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
            function() {
                controller.initialiseGeneticOptimisation(geneticOptimisationValues.population);
                individualPropertiesBuffer.empty();
                individualPropertiesBuffer.flip();
            }
        );

        $('#stepGO').on('click',
            function() {
                controller.nextGeneration(geneticOptimisationValues.stepsize);
                $('#plotGO').trigger('click');
            }
        );

        $('#plotGO').on('click',
            function() {
                var individual = view.optimisationCanvas.getClickedIndividual();
                var q;

                individualPropertiesBuffer.empty();

                if (individual === null) {
                    individualPropertiesBuffer.flip();
                    return;
                }

                individualPropertiesBuffer.append('' +
                    '<h4>Category I quantities</h4>' +
                    '<div class = "divtable">' +
                        '<div>' +
                            '<div><em>name</em></div>' +
                            '<div><em>value</em></div>' +
                            '<div><em>minimum</em></div>' +
                            '<div><em>maximum</em></div>' +
                        '</div>');

                for (q in individual.inputvector) {
                    individualPropertiesBuffer.append('' +
                        '<div>' +
                            '<div class = "max128w ellipsis">' + individual.inputvector[q].name + '</div>' +
                            '<div class = "max128w ellipsis">' + individual.inputvector[q].value + '</div>' +
                            '<div class = "max128w ellipsis">' + individual.inputvector[q].minimum + '</div>' +
                            '<div class = "max128w ellipsis">' + individual.inputvector[q].maximum + '</div>' +
                        '</div>');
                }

                individualPropertiesBuffer.append('</div>');

                individualPropertiesBuffer.append('' +
                    '<h4>Category II quantities</h4>' +
                    '<div class = "divtable">' +
                        '<div>' +
                            '<div><em>name</em></div>' +
                            '<div><em>value</em></div>' +
                            '<div><em>optimisation</em></div>' +
                        '</div>');

                for (q in individual.outputvector) {
                    individualPropertiesBuffer.append('' +
                        '<div>' +
                            '<div class = "max128w ellipsis">' + individual.outputvector[q].name + '</div>' +
                            '<div class = "max128w ellipsis">' + individual.outputvector[q].value + '</div>' +
                            '<div class = "max128w ellipsis">' + (individual.outputvector[q].maximize ? 'Maximized' : 'Minimized') + '</div>' +
                        '</div>');
                }

                individualPropertiesBuffer.append('</div>');

                individualPropertiesBuffer.flip();
            }
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
);
