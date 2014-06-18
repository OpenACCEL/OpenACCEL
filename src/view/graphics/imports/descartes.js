/**!
 * @licence
 *
 * Copyright Notice:
 *
 * The material in this file is protected by copyright.
 *
 * Copyright of this file is owned by C.W.A.M. van Overveld, Eindhoven, the Netherlands
 *
 * It is permitted to use, copy or modify this file under the following conditions:
 *
 * * Commercial use is forbidden without prior written permission by the copyright owner;
 * * This copyright message is to be left in the top of the file (also in case of minification);
 * * If this file is included in, or can be downloaded from a website, the website should contain
 *   a link to www.keesvanoverveld.com and a message that states the copyright of this file;
 * * The author takes no responsabilities for any consequences that should follow from using
 *   the contents of this file.
 *
 */
var DESCARTESTM = '<span class="descartesTM">Descartes</span>';
var descartes = function(arg) {
    mr = Math.round
    var DEFAULTDATASIZE = 15;
    var TEXTWIDTHOFFSET = 35;
    var TEXTHEIGHTOFFSET = 10;
    var ARROWLENGTH = 12;
    var ARROWWIDTH = 2.4;
    var contourPars
    var reliefPars
    var networkPars
    var surfacePars
    var lights
    var camera
    var mouseDownState = false

    // arg has the following members:
    // dN = the name of the div we create the canvas underneath (sorry for the English)
    // cW = the width of the canvas
    // cH = the height of the canvas
    // cF = an optional style string
    // cB = callback, called when a click event on the canvas happens. The callback gives information about the x-y coordinates,
    // both normalized to 0...1. The y-coordinate runs from bottom to top, low to high. The third argument is a boolean indicating
    // the button state..
    // cMove = callback, called when a move event on the canvas happens. The callback gives information about the x-y coordinates,
    // both normalized to 0...1. The y-coordinate runs from bottom to top, low to high.
    // No information about the button state is given.
    //
    var cB = (arg.cB) ? arg.cB : function(a) {};
    var cD = (arg.cD) ? arg.cD : function(a) {};
    var cMove = (arg.cMove) ? arg.cMove : function(a) {};
    var divName = (arg.dN) ? arg.dN : 'html';
    // the div where the canvas is to be connected to
    var cW = arg.cW;
    // the width of the canvas
    var cH = arg.cH;
    // the height of the canvas
    var cM = Math.sqrt(cH * cW);
    // geometric average of height and width
    var vpx = 100;
    var vpy = 100;
    var vpM = 100;
    // default dimensions of the viewport. That is: the coordinates (0,0) and (100,100) in the application are mapped
    // to the corners of the canvas.
    var vPTx = cW / vpx;
    var vPTy = cH / vpy;
    var vPTm = cM / vpM;
    // scale factor to go from viewport coordinates to pixel coordinates
    var mrx = function(x) {
        return mr(x * vPTx)
    }
    var mry = function(x) {
        return mr(cH - x * vPTy)
    }
    var mrr = function(x) {
        return mr(x * vPTm)
    }
    // mapping functions to do the viewport-screen coordinates mapping
    var cF = (arg.cF) ? arg.cF : '';
    // optional: a style file for the canvas
    var canvasBuild = false;
    // a boolean telling if the canvas has been built
    var dBackup = [];
    // the previous version of the data set
    var statusReport = "";
    // an optional error message
    var ctx = {};
    // the canvas context
    var props = new Array();
    // keeps track of which attributes should be defined for which plot style
    var TOOMUCH = 100000
    // if we don't know yet how many data points there will be
    var NONEVALUE = -99999
    // to indicate a non-present default value
    var defaultValues = new Array();
    // the properties all have default values, depending on the attribute.
    var grammar = new Array();
    // defines the grammar of the control expression
    var _proj = 'proj'
    var _mode = 'mode';
    var _camera = 'camera';
    var _eX = 'eX';
    var _eY = 'eY';
    var _eZ = 'eZ';
    var _kX = 'kX';
    var _kY = 'kY';
    var _kZ = 'kZ';
    var _hX = 'hX';
    var _hY = 'hY';
    var _hZ = 'hZ';
    var _vX = 'vX';
    var _vY = 'vY';
    var _vZ = 'vZ';
    var _f = 'f';
    var _lights = 'lights'
    var _l_r = 'l_r'
    var _l_g = 'l_g'
    var _l_b = 'l_b'
    var _l_x = 'l_x'
    var _l_y = 'l_y'
    var _l_z = 'l_z'
    var _x = 'x';
    var _y = 'y';
    var _z = 'z';
    var _x1 = 'x1';
    var _x2 = 'x2';
    var _x3 = 'x3';
    var _x4 = 'x4';
    var _y1 = 'y1';
    var _y2 = 'y2';
    var _y3 = 'y3';
    var _y4 = 'y4';
    var _z1 = 'z1';
    var _z2 = 'z2';
    var _z3 = 'z3';
    var _z4 = 'z4';
    var _xBase = 'xBase';
    var _yBase = 'yBase';
    var _diameter = 'diameter';
    var _width = 'width';
    var _height = 'height';
    var _col_r = 'col_r';
    var _col_g = 'col_g';
    var _col_b = 'col_b';
    var _col_a = 'col_a';
    var _fcol_r = 'fcol_r';
    var _fcol_g = 'fcol_g';
    var _fcol_b = 'fcol_b';
    var _fcol_a = 'fcol_a';
    var _tcol_r = 'tcol_r';
    var _tcol_g = 'tcol_g';
    var _tcol_b = 'tcol_b';
    var _const = 'const';
    var _intp = 'intp';
    var _data = 'data';
    var _shift = 'shift';
    var _tfihs = 'tfihs';
    var _ref = 'ref';
    var _low = 'low';
    var _high = 'high';
    var _nPoints = 'nPoints';
    var _lights = 'lights';
    var _camera = 'camera';
    var _nSpan = 'nSpan';
    var _plotType = 'plotType';
    var _bubble = 'bubble';
    var _image = 'image';
    var _contour = 'contour';
    var _iso = 'iso';
    var _network = 'network';
    var _relief = 'relief';
    var _surface = 'surface';
    var _source = 'source';
    var _mapR = 'mapR';
    var _mapG = 'mapG';
    var _mapB = 'mapB';
    var _mapA = 'mapA';
    var _scaleX = 'scaleX';
    var _scaleY = 'scaleY';
    var _box = 'box';
    var _vector = 'vector';
    var _vbar = 'vbar';
    var _hbar = 'hbar';
    var _line = 'line';
    var _ring = 'ring';
    var _radar = 'radar';
    var _tag = 'tag';
    var _tagx = 'tagx';
    var _tagy = 'tagy';
    var _pointsize = 'pointsize';
    var _r = 'r';
    var _phi = 'phi';
    var _grid = 'grid';
    var _majX = 'majX';
    var _minX = 'minX';
    var _majY = 'majY';
    var _minY = 'minY';
    var _grMajX = 'grMajX';
    var _grMinX = 'grMinX';
    var _grMajY = 'grMajY';
    var _grMinY = 'grMinY';
    var _labelsX = 'labelsX';
    var _labelsY = 'labelsY';
    var _title = 'title';
    var _labelsPhi = 'labelsPhi'
    var _majPhi = 'majPhi';
    var _minPhi = 'minPhi';
    var _grMajPhi = 'grMajPhi';
    var _grMinPhi = 'grMinPhi';
    var _majR = 'majR';
    var _minR = 'minR';
    var _grMajR = 'grMajR';
    var _grMinR = 'grMinR';
    var _labelsPhi = 'labelsPhi';
    var _labelsR = 'labelsR';
    var _value = 'value';
    var _line = 'line';
    var _tick = 'tick';
    var _none = 'none';
    var _type = 'type';
    var _segment = 'segment';
    var _infLine = 'infLine';
    var _circle = 'circle';
    var _bezier = 'bezier';
    var _triangle = 'triangle';
    var _ellips = 'ellips';
    var _parabola = 'parabola';
    var _hyperbola = 'hyperbola';
    var _parallellogram = 'parallellogram';
    var _quad = 'quad';
    var _fill = 'fill';
    var _border = 'border';
    var _interior = 'interior';
    var _both = 'both';
    var _end1 = 'end1';
    var _end2 = 'end2';
    var _arrow = 'arrow';
    var allGenRenderPars = [_col_r, _col_g, _col_b, _col_a, _tcol_r, _tcol_g, _tcol_b, _fcol_r, _fcol_g, _fcol_b, _fcol_a, _width, _tag, _tagx, _tagy, _x1, _x2, _x3, _x4, _y1, _y2, _y3, _y4, _z1, _z2, _z3, _z4, _pointsize, _x, _y, _yBase, _xBase, _height, _type, _fill, _end1, _end2, _r, _diameter]

    // the above variables make sure that every keyword only occurs as string only once,
    // so there is no chance for typo's
    //----------------------------------------------------------------------
    this.enforceRedraw = function() {
        // this detroys the memory e.g. as used in shift 
        dBackup = []
    }
    //----------------------------------------------------------------------
    this.setUpGraph = function() {
        if (!canvasBuild) {
            if (cF != '') {
                $('#' + divName).append('<canvas id="' + divName + '_canvas" width="' + cW + '"  height="' + cH + '" style="' + cF + '" />');
            } else {
                $('#' + divName).append('<canvas id="' + divName + '_canvas" width="' + cW + '"  height="' + cH + '" />');
            }
            dBackup = [];
            canvasBuild = true;
            $('#' + divName).show();
            $('#' + divName + '_canvas').show();
            var elem = document.getElementById(divName + '_canvas');
            if (elem && elem.getContext) {
                var ctx = elem.getContext('2d');
                CanvasTextFunctions.enable(ctx);
            }
            $('#' + divName + "_canvas").mousedown(function(e) {
                var x = e.pageX - $("#" + divName + "_canvas").offset().left;
                var y = e.pageY - $("#" + divName + "_canvas").offset().top;
                cB(x / cW, 1 - y / cH, true);
                mouseDownState = true
            });
            $('#' + divName + "_canvas").mouseup(function(e) {
                var x = e.pageX - $("#" + divName + "_canvas").offset().left;
                var y = e.pageY - $("#" + divName + "_canvas").offset().top;
                cB(x / cW, 1 - y / cH, false);
                mouseDownState = false
            });
            $('#' + divName + "_canvas").mousemove(function(e) {
                var x = e.pageX - $("#" + divName + "_canvas").offset().left;
                var y = e.pageY - $("#" + divName + "_canvas").offset().top;
                cMove(x / cW, 1 - y / cH, mouseDownState);
                // the following statement is mysteriously necessary
                // in chrome: otherwise it selects the canvas after any number of
                // move events. I found the hint here:
                // http://stackoverflow.com/questions/6186844/clear-a-selection-in-firefox/6187098#6187098
                window.getSelection().removeAllRanges()
            });
            canvasBuild = true;
            // props tells which properties need to be taken into account for which plottype.
            props[_image] = [_scaleX, _scaleY, _mapR, _mapG, _mapB, _mapA];
            props[_contour] = [_source, _width, _col_r, _col_g, _col_b, _col_a, _iso];
            props[_network] = [_source, _width, _col_r, _col_g, _col_b, _col_a, _x, _y, _z];
            props[_relief] = [_source, _col_r, _col_g, _col_b, _col_a]
            props[_surface] = [_source, _col_r, _col_g, _col_b, _col_a, _x, _y, _z, _lights, _camera]
            props[_line] = [_x, _y, _width, _col_r, _col_g, _col_b, _tag, _tagx, _tagy, _tcol_r, _tcol_g, _tcol_b, _pointsize];
            props[_bubble] = [_x, _y, _diameter, _col_r, _col_g, _col_b, _col_a, _tcol_r, _tcol_g, _tcol_b, _tag, _tagx, _tagy, _pointsize];
            props[_box] = [_x, _y, _width, _height, _col_r, _col_g, _col_b, _col_a, _tag, _tagx, _tagy, _tcol_r, _tcol_g, _tcol_b, _pointsize];
            props[_vbar] = [_x, _yBase, _width, _height, _col_r, _col_g, _col_b, _col_a, _tag, _tagx, _tagy, _tcol_r, _tcol_g, _tcol_b, _pointsize];
            props[_hbar] = [_xBase, _y, _width, _height, _col_r, _col_g, _col_b, _col_a, _tag, _tagx, _tagy, _tcol_r, _tcol_g, _tcol_b, _pointsize];
            props[_radar] = [_x, _y, _r, _width, _col_r, _col_g, _col_b, _col_a, _tag, _tagx, _tagy, _tcol_r, _tcol_g, _tcol_b, _pointsize];
            props[_ring] = [_x, _y, _r, _phi, _col_r, _col_g, _col_b, _col_a, _tag, _tagx, _tagy, _tcol_r, _tcol_g, _tcol_b, _pointsize];
            props[_vector] = [_x1, _x2, _x3, _x4, _y1, _y2, _y3, _y4, _z1, _z2, _z3, _z4, _type, _width, _col_r, _col_g, _col_b, _fcol_r, _fcol_g, _fcol_b, _fcol_a, _tcol_r, _tcol_g, _tcol_b, _end1, _end2, _fill, _tag, _tagx, _tagy, _pointsize];
            defaultValues[_scaleX] = {
                _low: 0,
                _value: 1,
                _high: vpx / 2
            };
            defaultValues[_scaleY] = {
                _low: 0,
                _value: 1,
                _high: vpy / 2
            };
            defaultValues[_source] = {
                _low: -1,
                _value: -1,
                _high: -1
            };
            defaultValues[_iso] = {
                _low: -1,
                _value: -1,
                _high: -1
            };
            defaultValues[_scaleY] = {
                _low: 0,
                _value: 1,
                _high: vpy / 2
            };
            defaultValues[_mapR] = {
                _low: 0,
                _value: 128,
                _high: 255
            };
            defaultValues[_mapG] = {
                _low: 0,
                _value: 128,
                _high: 255
            };
            defaultValues[_mapB] = {
                _low: 0,
                _value: 128,
                _high: 255
            };
            defaultValues[_mapA] = {
                _low: 0,
                _value: 128,
                _high: 255
            };
            defaultValues[_xBase] = {
                _value: vpx / 20,
                _low: 0,
                _high: vpx / 2
            }
            defaultValues[_yBase] = {
                _value: vpy / 20,
                _low: 0,
                _high: vpy / 2
            }
            defaultValues[_x] = {
                _value: vpx / 2,
                _low: 0,
                _high: vpx
            };
            defaultValues[_y] = {
                _value: vpy / 2,
                _low: 0,
                _high: vpy
            };
            defaultValues[_z] = {
                _value: vpM / 2,
                _low: 0,
                _high: vpM
            };
            defaultValues[_x1] = {
                _value: vpx / 2,
                _low: 0,
                _high: vpx
            };
            defaultValues[_y1] = {
                _value: vpy / 2,
                _low: 0,
                _high: vpy
            };
            defaultValues[_z1] = {
                _value: vpM / 2,
                _low: 0,
                _high: vpM
            };
            defaultValues[_x2] = {
                _value: vpx / 2,
                _low: 0,
                _high: vpx
            };
            defaultValues[_y2] = {
                _value: vpy / 2,
                _low: 0,
                _high: vpy
            };
            defaultValues[_z2] = {
                _value: vpM / 2,
                _low: 0,
                _high: vpM
            };
            defaultValues[_x3] = {
                _value: vpx / 2,
                _low: 0,
                _high: vpx
            };
            defaultValues[_y3] = {
                _value: vpy / 2,
                _low: 0,
                _high: vpy
            };
            defaultValues[_z3] = {
                _value: vpM / 2,
                _low: 0,
                _high: vpM
            };
            defaultValues[_x4] = {
                _value: vpx / 2,
                _low: 0,
                _high: vpx
            };
            defaultValues[_y4] = {
                _value: vpy / 2,
                _low: 0,
                _high: vpy
            };
            defaultValues[_z4] = {
                _value: vpM / 2,
                _low: 0,
                _high: vpM
            };
            defaultValues[_diameter] = {
                _value: vpM / 50,
                _low: 1,
                _high: vpM / 5
            };
            defaultValues[_height] = {
                _value: vpy / 10,
                _low: 1,
                _high: vpy / 2
            };
            defaultValues[_width] = {
                _value: 1.0,
                _low: 0.1,
                _high: cM / 10
            };
            defaultValues[_col_r] = {
                _value: 128,
                _low: 0,
                _high: 255
            };
            defaultValues[_col_g] = {
                _value: 128,
                _low: 0,
                _high: 255
            };
            defaultValues[_col_b] = {
                _value: 128,
                _low: 0,
                _high: 255
            };
            defaultValues[_col_a] = {
                _value: 0.8,
                _low: 0.0,
                _high: 1.0
            };
            defaultValues[_fcol_r] = {
                _value: 128,
                _low: 0,
                _high: 255
            };
            defaultValues[_fcol_g] = {
                _value: 128,
                _low: 0,
                _high: 255
            };
            defaultValues[_fcol_b] = {
                _value: 128,
                _low: 0,
                _high: 255
            };
            defaultValues[_fcol_a] = {
                _value: 0.8,
                _low: 0.0,
                _high: 1.0
            };
            defaultValues[_tcol_r] = {
                _value: 128,
                _low: 0,
                _high: 255
            };
            defaultValues[_tcol_g] = {
                _value: 128,
                _low: 0,
                _high: 255
            };
            defaultValues[_tcol_b] = {
                _value: 128,
                _low: 0,
                _high: 255
            };
            defaultValues[_r] = {
                _value: vpM / 10,
                _low: 1,
                _high: vpM / 2
            };
            defaultValues[_phi] = {
                _value: 3.1415,
                _low: 0,
                _high: 6.283
            };
            defaultValues[_tagx] = {
                _value: vpx / 50,
                _low: 0,
                _high: vpx / 20
            };
            defaultValues[_tagy] = {
                _value: vpy / 50,
                _low: 0,
                _high: vpy / 20
            };
            defaultValues[_tag] = {
                _value: '',
                _low: 0,
                _high: 0
            };
            defaultValues[_type] = {
                _value: _segment,
                _low: 0,
                _high: 0
            };
            defaultValues[_fill] = {
                _value: _border,
                _low: 0,
                _high: 0
            };
            defaultValues[_end1] = {
                _value: _none,
                _low: 0,
                _high: 0
            };
            defaultValues[_end2] = {
                _value: _none,
                _low: 0,
                _high: 0
            };
            defaultValues[_pointsize] = {
                _value: 10,
                _low: 8,
                _high: 16
            };
        }
    }
    //----------------------------------------------------------------------
    // dArg is an array, one element for each graph.
    // One graph is also an array. Its first element is a control array;
    // the subsequent arguments are lists of arguments.
    // In the case of plotType 'image', the subsequent arguments are lists of lists of arguments (that is, a 2D vector)
    // The interpretation of these arguments is dicated by the control string.
    this.draw = function(dArg) {
        var i = 0;
        if (!dArg[0] instanceof Array) {
            statusReport == 'NOTICE: as of April 2014, the format of the control \nargument in the Descartes draw-function has been changed.\nIn earlier versions of Descartes, this was a string; it has now been defined as an array.\n\nFor instance, old style:\n\n\'plotType:buble,x:{mode:data,ref:3}\'\n\nnow becomes\n\n[plotType:\'bubble\',x:[mode:\'data\',ref:3]]\n\nSee manual for details.'
            return
        } else {
            statusReport = "";
            clearScreen();
            if (dArg.length > 0) {
                for (i = 0; i < dArg.length; i++) {
                    if (!dBackup[i]) {
                        dBackup[i] = [];
                    }
                    buildStruct(dArg[i], dBackup[i]);
                    if (statusReport == '') {
                        fillInScreenContents(dArg[i], dBackup[i]);
                        if (statusReport == "") {
                            doDraw(dArg[i], dBackup[i]);
                        }
                    }
                }
                dBackup.length = dArg.length
                if (statusReport == '') {
                    return
                }
            }
        }
    }
    //------------------------------------------------------------------------
    this.whipeGraph = function(p) {
        var ctx = $('#' + p + '_canvas')[0].getContext("2d");
        ctx.clearRect(0, 0, cW, cH);
    }
    //-----------------------------------------------------------------------
    var clearScreen = function() {
        var ctx = $('#' + divName + '_canvas')[0].getContext("2d");
        ctx.clearRect(0, 0, cW, cH);
    }
    //-----------------------------------------------------------------------
    var buildStruct = function(a, b) {
        // pre: a and b are arrays. The first element of a is a control array  that 
        // determines what to do with (optional) data following this first element,
        // and then contains the information of how the various members of b are to be interpreted
        // the below objects all have the same format; they are taken from parsing a[0].
        if (a[0]) {
            b[0] = clone(a[0]);
            // meaning: x, y, x1,x2,x3,y1,y2,y3,x4,y4,width, height, diameter, col_r, col_g and col_b,col_a,fcol_r,fcol_g,fcol_b,fcol_a,type,fill,end1, end2
            // are the possible attributes of the
            // drawing icons. Which drawing icon we plot is determined by the value of plotType (can have values like bubble, box, ...)
            // Every attribute has a value that can either be
            // * constant (the default), either as a single datum or given as array 'on the spot' (like the values of the light source atytributes - since there can be arbitrary many light sources)
            // * linearly interpolated (provided that it is no string, like 'type', 'fill', or 'tag'
            // * taken from the full data array
            // * taken from the top of the data array, and shifted over time
            // * taken from the top of the data array, and tfihs-ed (inverse shifted) over time.
            // Which of the five cases applies is determined by ' mode'. mode is one of _const,_intp,_data,_shift, or _tfihs for constant,
            // interpolated, or data array, or shifted, respectively. The default is _const.
            // In case of  _const, the value is given by _value; the default depends on the property.
            // In case of _intp, the value is given by _low  and  _high. The defaults depend on the property.
            // In case of _data, and _shift, the value is given by _ref, which refers to
            // one of the data arrays that together define this set of icons. There is no default for _ref. It starts with 1,
            // because the 0-th data element of the input array is the javascript string containing the control data.
            // Notice: for any graph, b[0]=the original control string for that graph; 
            //         b[1]=an object containing the generic properties for the graph, such as nPoints, nSpan, grid, camera or lights;
            //         b[2] and further: the properties, specific for that plotType.
            // Upon completion of buildstruct, only the structure has been determined. The actaul data values themselves have not yet
            // been filled in.
            b[1] = dealWithGenericProps(b[0]);
            if (b[0].hasOwnProperty(_plotType)) {
                // we don't want to modify b[0], because then the 
                // comparison with the original a[0][0] would always fail.
                b[1][_plotType] = b[0][_plotType]
            } else {
                b[1][_plotType] = _line;
            }
            for (var key in props[b[1][_plotType]]) {
                var prop = props[b[1][_plotType]][key];
                if (b[0].hasOwnProperty(prop)) {
                    // see if this proprty already occurs in b; if so: overwrite its value
                    var occur = false
                    var j = 2
                    while (j < b.length && !occur) {
                        if (b[j].p == prop) {
                            b[j] = dealWithProp(b[0][prop], a, prop, b[j]);
                            occur = true
                        } else {
                            j++
                        }
                    }
                    if (!occur) {
                        b.push(dealWithProp(b[0][prop], a, prop));
                        // notice: there is deliberately no b-argument. In the body
                        // of dealWithProp we check if b is present.
                    }
                }
            }
            var dataSize = TOOMUCH;
            var spanSize = TOOMUCH;
            // spansize is only defined in case of image data; then it is the length of one spanline
            for (i = 2; i < b.length; i++) {
                // find the minimal datasize:
                if (b[i].n < dataSize)
                    dataSize = b[i].n;
                if (b[i].nSpan < spanSize)
                    spanSize = b[i].nSpan;
            }
            if (b[1].hasOwnProperty(_nPoints)) {
                if (b[1][_nPoints] < dataSize)
                    dataSize = b[1][_nPoints];
            }
            if (b[1].hasOwnProperty(_nSpan)) {
                if (b[1][_nSpan] < spanSize)
                    spanSize = b[1][_nSpan];
            }
            if (dataSize == TOOMUCH) {
                // this happens e.g. if none of the props is given a data array
                dataSize = DEFAULTDATASIZE;
            }
            if (spanSize == TOOMUCH) {
                // this happens e.g. if none of the props is given a data array
                spanSize = DEFAULTDATASIZE;
            }
            b[1][_nPoints] = dataSize;
            b[1][_nSpan] = spanSize;
            for (i = 2; i < b.length; i++) {
                // for the properties that do not correspond with values entered via an array of a:
                if (b[i].w == -1) {
                    if (b[1][_plotType] == _image) {
                        constructData(b[i], dataSize, spanSize);
                    } else {
                        constructData(b[i], dataSize, -1);
                    }
                }
            }
        } else {
            statusReport += "\nDescartes: control array not present.";
        }
    }
    //----------------------------------------------------------------------
    var dealWithGenericProps = function(a) {
        var i
        // check if nPoints is set
        var r = {};
        if (a.hasOwnProperty(_nPoints)) {
            r[_nPoints] = a[_nPoints];
        }
        // check for grid
        if (a.hasOwnProperty(_grid)) {
            var gridInfo = a[_grid];
            var gridOb = {};
            gridOb[_majX] = gridInfo.hasOwnProperty(_majX) ? gridInfo[_majX] : 0;
            gridOb[_majY] = gridInfo.hasOwnProperty(_majY) ? gridInfo[_majY] : 0;
            gridOb[_majPhi] = gridInfo.hasOwnProperty(_majPhi) ? gridInfo[_majPhi] : 0;
            gridOb[_majR] = gridInfo.hasOwnProperty(_majR) ? gridInfo[_majR] : 0;
            gridOb[_minX] = gridInfo.hasOwnProperty(_minX) ? gridInfo[_minX] : 0;
            gridOb[_minY] = gridInfo.hasOwnProperty(_minY) ? gridInfo[_minY] : 0;
            gridOb[_minPhi] = gridInfo.hasOwnProperty(_minPhi) ? gridInfo[_minPhi] : 0;
            gridOb[_minR] = gridInfo.hasOwnProperty(_minR) ? gridInfo[_minR] : 0;
            gridOb[_grMajX] = gridInfo.hasOwnProperty(_grMajX) ? gridInfo[_grMajX] : _none;
            gridOb[_grMajY] = gridInfo.hasOwnProperty(_grMajY) ? gridInfo[_grMajY] : _none;
            gridOb[_grMajPhi] = gridInfo.hasOwnProperty(_grMajPhi) ? gridInfo[_grMajPhi] : _none;
            gridOb[_grMajR] = gridInfo.hasOwnProperty(_grMajR) ? gridInfo[_grMajR] : _none;
            gridOb[_grMinX] = gridInfo.hasOwnProperty(_grMinX) ? gridInfo[_grMinX] : _none;
            gridOb[_grMinY] = gridInfo.hasOwnProperty(_grMinY) ? gridInfo[_grMinY] : _none;
            gridOb[_grMinPhi] = gridInfo.hasOwnProperty(_grMinPhi) ? gridInfo[_grMinPhi] : _none;
            gridOb[_grMinR] = gridInfo.hasOwnProperty(_grMinR) ? gridInfo[_grMinR] : _none;
            r[_grid] = gridOb;
        }
        // check for lights
        var lightsOb = []
        if (a.hasOwnProperty(_lights)) {
            var lightsInfo = a[_lights]
            if (lightsInfo instanceof Array) {
                for (var i = 0; i < lightsInfo.length; i++) {
                    lightsOb.push({
                        l_r: lightsInfo[i].hasOwnProperty(_l_r) ? lightsInfo[i][_l_r] : 100,
                        l_g: lightsInfo[i].hasOwnProperty(_l_g) ? lightsInfo[i][_l_g] : 100,
                        l_b: lightsInfo[i].hasOwnProperty(_l_b) ? lightsInfo[i][_l_b] : 100,
                        l_x: lightsInfo[i].hasOwnProperty(_l_x) ? lightsInfo[i][_l_x] : 1,
                        l_y: lightsInfo[i].hasOwnProperty(_l_y) ? lightsInfo[i][_l_y] : 1,
                        l_z: lightsInfo[i].hasOwnProperty(_l_z) ? lightsInfo[i][_l_z] : 1
                    })
                }
            } else {
                lightsOb.push({
                    l_r: lightsInfo.hasOwnProperty(_l_r) ? lightsInfo[i][_l_r] : 100,
                    l_g: lightsInfo.hasOwnProperty(_l_g) ? lightsInfo[i][_l_g] : 100,
                    l_b: lightsInfo.hasOwnProperty(_l_b) ? lightsInfo[i][_l_b] : 100,
                    l_x: lightsInfo.hasOwnProperty(_l_x) ? lightsInfo[i][_l_x] : 1,
                    l_y: lightsInfo.hasOwnProperty(_l_y) ? lightsInfo[i][_l_y] : 1,
                    l_z: lightsInfo.hasOwnProperty(_l_z) ? lightsInfo[i][_l_z] : 1
                })
            }
        }
        r[_lights] = lightsOb
        // check for camera
        var cameraOb = {}
        if (a.hasOwnProperty(_camera)) {
            var cameraInfo = a[_camera]
            cameraOb[_proj] = true
            cameraOb[_eX] = cameraInfo.hasOwnProperty(_eX) ? vPTx * cameraInfo[_eX] : cW / 2;
            cameraOb[_eY] = cameraInfo.hasOwnProperty(_eY) ? vPTy * cameraInfo[_eY] : cH / 2;
            cameraOb[_eZ] = cameraInfo.hasOwnProperty(_eZ) ? cameraInfo[_eZ] : -cM;
            cameraOb[_kX] = cameraInfo.hasOwnProperty(_kX) ? cameraInfo[_kX] : 0;
            cameraOb[_kY] = cameraInfo.hasOwnProperty(_kY) ? cameraInfo[_kY] : 0;
            cameraOb[_kZ] = cameraInfo.hasOwnProperty(_kZ) ? cameraInfo[_kZ] : 1;
            cameraOb[_hX] = cameraInfo.hasOwnProperty(_hX) ? cameraInfo[_hX] : 1;
            cameraOb[_hY] = cameraInfo.hasOwnProperty(_hY) ? cameraInfo[_hY] : 0;
            cameraOb[_hZ] = cameraInfo.hasOwnProperty(_hZ) ? cameraInfo[_hZ] : 0;
            cameraOb[_vX] = cameraInfo.hasOwnProperty(_vX) ? cameraInfo[_vX] : 0;
            cameraOb[_vY] = cameraInfo.hasOwnProperty(_vY) ? cameraInfo[_vY] : 1;
            cameraOb[_vZ] = cameraInfo.hasOwnProperty(_vZ) ? cameraInfo[_vZ] : 0;
            cameraOb[_f] = cameraInfo.hasOwnProperty(_f) ? cameraInfo[_f] : cM
        } else {
            cameraOb[_proj] = false
        }
        r[_camera] = cameraOb
        return r;
    }
    //----------------------------------------------------------------------
    var fillInScreenContents = function(a, b) {
        // take the data from the data arrays, either the full array, or only the first (and
        // only) element in case of a time-shifting behavior
        var i = 0;
        var j = 0;
        var jj = 0;
        for (i = 2; i < b.length; i++) {
            if (b[i].w >= 0) {
                if (b[i].mode == _data) {
                    for (j = 0; j < b[1][_nPoints]; j++) {
                        if (a[b[i].w]) {
                            if (a[b[i].w][j] instanceof Array) {
                                // image or matrix data
                                if (!(b[i].v[j] instanceof Array)) {
                                    b[i].v[j] = [];
                                }
                                if (b[1][_plotType] == 'image') {
                                    for (jj in a[b[i].w][j]) {
                                        // in the case of image, all values are integers between 0 and 255. Rounding now means that we have to
                                        // do less work in the sequel
                                        b[i].v[j][jj] = Math.round(a[b[i].w][j][jj]);
                                    }
                                } else {
                                    for (jj in a[b[i].w][j]) {
                                        // in the case of matrix, leave values floatl
                                        b[i].v[j][jj] = a[b[i].w][j][jj];
                                    }
                                }
                            } else {
                                // no image data, but 1-D data
                                b[i].v[j] = a[b[i].w][j];
                            }
                        }
                    }
                } else {
                    if (b[i].mode == _shift) {
                        if (!(a[b[i].w][0] instanceof Array)) {
                            for (j = b[1][_nPoints] - 1; j > 0; j--) {
                                b[i].v[j] = b[i].v[j - 1];
                            }
                            b[i].v[0] = a[b[i].w][0];
                        } else {
                            for (j = b[1][_nPoints] - 1; j > 0; j--) {
                                if (!(b[i].v[j - 1] instanceof Array)) {
                                    b[i].v[j - 1] = [];
                                    for (jj = 0; jj < b[1][_nSpan]; jj++) {
                                        b[i].v[j - 1][jj] = 0;
                                    }
                                    b[i].v[j] = [];
                                }
                                for (jj = 0; jj < b[1][_nSpan]; jj++) {
                                    b[i].v[j][jj] = b[i].v[j - 1][jj];
                                }
                            }
                            for (jj = 0; jj < b[1][_nSpan]; jj++) {
                                b[i].v[0][jj] = a[b[i].w][0][jj];
                            }
                        }
                    } else {
                        // this is reverse shift, or 'tfihs'
                        if (!(a[b[i].w][0] instanceof Array)) {
                            for (j = 0; j < b[1][_nPoints] - 1; j++) {
                                b[i].v[j] = b[i].v[j + 1];
                            }
                            b[i].v[b[1][_nPoints] - 1] = a[b[i].w][0];
                        } else {
                            for (j = 0; j < b[1][_nPoints] - 1; j++) {
                                if (!(b[i].v[j + 1] instanceof Array)) {
                                    b[i].v[j + 1] = [];
                                    for (jj = 0; jj < b[1][_nSpan]; jj++) {
                                        b[i].v[j + 1][jj] = 0;
                                    }
                                    b[i].v[j] = [];
                                }
                                for (jj = 0; jj < b[1][_nSpan]; jj++) {
                                    b[i].v[j][jj] = b[i].v[j + 1][jj]
                                }
                            }
                            for (jj = 0; jj < b[1][_nSpan]; jj++) {
                                b[i].v[b[1][_nPoints] - 1][jj] = a[b[i].w][0][jj];
                            }
                        }
                    }
                }
            }
        }
    }
    //----------------------------------------------------------------------
    var drawGrid = function(gO, ctx, nArms) {
        // the latter argument is only used for R-grids.
        var i = 0;
        var twoPi = 2 * Math.PI;
        var TICKHEIGHT1 = 6;
        var TICKHEIGHT2 = 5;
        ctx.strokeStyle = "rgb(0,0,0)";
        ctx.lineWidth = 1;
        if (gO[_majX] > 1) {
            ctx.beginPath();
            ctx.moveTo(0, cH - 1);
            ctx.lineTo(xP, cH - 1);
            ctx.stroke();
            for (i = 0; i < gO[_majX]; i++) {
                var xP = cW * i / (gO[_majX] - 1);
                switch (gO[_grMajX]) {
                    case _none:
                        break;
                    case _tick:
                        ctx.beginPath();
                        ctx.moveTo(xP, cH);
                        ctx.lineTo(xP, cH - TICKHEIGHT1);
                        ctx.stroke();
                        break;
                    case _line:
                        ctx.beginPath();
                        ctx.moveTo(xP, cH);
                        ctx.lineTo(xP, 0);
                        ctx.stroke();
                        break;
                }
            }
        }
        ctx.strokeStyle = "rgb(100,100,100)";
        if (gO[_minX] > 1) {
            ctx.beginPath();
            ctx.moveTo(0, cH - 1);
            ctx.lineTo(xP, cH - 1);
            ctx.stroke();
            for (i = 0; i < gO[_minX]; i++) {
                var xP = cW * i / (gO[_minX] - 1);
                switch (gO[_grMinX]) {
                    case _none:
                        break;
                    case _tick:
                        ctx.beginPath();
                        ctx.moveTo(xP, cH);
                        ctx.lineTo(xP, cH - TICKHEIGHT2);
                        ctx.stroke();
                    case _line:
                        ctx.beginPath();
                        ctx.moveTo(xP, cH);
                        ctx.lineTo(xP, 0);
                        ctx.stroke();
                        break;
                }
            }
        }
        ctx.strokeStyle = "rgb(0,0,0)";
        if (gO[_majY] > 1) {
            ctx.beginPath();
            ctx.moveTo(1, 0);
            ctx.lineTo(1, cH - 1);
            ctx.stroke();
            for (i = 0; i < gO[_majY]; i++) {
                var yP = cW * i / (gO[_majY] - 1);
                switch (gO[_grMajY]) {
                    case _none:
                        break;
                    case _tick:
                        ctx.beginPath();
                        ctx.moveTo(0, yP);
                        ctx.lineTo(TICKHEIGHT1, yP);
                        ctx.stroke();
                        break;
                    case _line:
                        ctx.beginPath();
                        ctx.moveTo(0, yP);
                        ctx.lineTo(cW, yP);
                        ctx.stroke();
                        break;
                }
            }
        }
        ctx.strokeStyle = "rgb(100,100,100)";
        if (gO[_minY] > 1) {
            ctx.beginPath();
            ctx.moveTo(1, 0);
            ctx.lineTo(1, cH - 1);
            ctx.stroke();
            for (i = 0; i < gO[_minY]; i++) {
                var yP = cW * i / (gO[_minY] - 1);
                switch (gO[_grMinY]) {
                    case _none:
                        break;
                    case _tick:
                        ctx.beginPath();
                        ctx.moveTo(0, yP);
                        ctx.lineTo(cW, yP);
                        ctx.stroke();
                    case _line:
                        ctx.beginPath();
                        ctx.moveTo(0, yP);
                        ctx.lineTo(cW, yP);
                        ctx.stroke();
                        break
                }
            }
        }
        ctx.strokeStyle = "rgb(0,0,0)";
        if (gO[_majPhi] > 1) {
            if (cM > 0) {
                ctx.beginPath();
                ctx.arc(cW / 2, cH / 2, cM / 2, 0, twoPi, false);
                ctx.stroke();
            }
            for (i = 0; i < gO[_majPhi]; i++) {
                var xP1 = cW / 2 + 0.5 * cM * Math.cos(twoPi * i / gO[_majPhi]);
                var yP1 = cH / 2 + 0.5 * cM * Math.sin(twoPi * i / gO[_majPhi]);
                switch (gO[_grMajPhi]) {
                    case _none:
                        break;
                    case _tick:
                        var xP2 = cW / 2 + (0.5 * cM - TICKHEIGHT1) * Math.cos(twoPi * i / gO[_majPhi]);
                        var yP2 = cH / 2 + (0.5 * cM - TICKHEIGHT1) * Math.sin(twoPi * i / gO[_majPhi]);
                        ctx.beginPath();
                        ctx.moveTo(xP1, yP1);
                        ctx.lineTo(xP2, yP2);
                        ctx.stroke();
                        break;
                    case _line:
                        var xP2 = cW / 2;
                        var yP2 = cH / 2
                        ctx.moveTo(xP1, yP1);
                        ctx.lineTo(xP2, yP2);
                        ctx.stroke();
                        break;
                }

            }
        }
        ctx.strokeStyle = "rgb(100,100,100)";
        if (gO[_minPhi] > 1) {
            if (cM > 0) {
                ctx.beginPath();
                ctx.arc(cW / 2, cH / 2, cM / 2, 0, twoPi, false);
                ctx.stroke();
            }
            for (i = 0; i < gO[_minPhi]; i++) {
                var xP1 = cW / 2 + 0.5 * cM * Math.cos(twoPi * i / gO[_minPhi]);
                var yP1 = cH / 2 + 0.5 * cM * Math.sin(twoPi * i / gO[_minPhi]);
                switch (gO[_grMinPhi]) {
                    case _none:
                        break;
                    case _tick:
                        var xP2 = cW / 2 + (0.5 * cM - TICKHEIGHT2) * Math.cos(twoPi * i / gO[_minPhi]);
                        var yP2 = cH / 2 + (0.5 * cM - TICKHEIGHT2) * Math.sin(twoPi * i / gO[_minPhi]);
                        ctx.beginPath();
                        ctx.moveTo(xP1, yP1);
                        ctx.lineTo(xP2, yP2);
                        ctx.stroke();
                        break;
                    case _line:
                        var xP2 = cW / 2;
                        var yP2 = cH / 2
                        ctx.moveTo(xP1, yP1);
                        ctx.lineTo(xP2, yP2);
                        ctx.stroke();
                        break;
                }

            }
        }
        ctx.strokeStyle = "rgb(0,0,0)";
        if (gO[_majR] > 1) {
            var nrA = nArms;
            if (nrA > 20)
                nrA = 20;
            for (var rho = 0; rho < nArms; rho++) {
                var rl = cM / 2;
                ctx.beginPath();
                ctx.moveTo(cW / 2, cH / 2);
                ctx.lineTo(cW / 2 + rl * Math.cos(rho * twoPi / nArms), cH / 2 + rl * Math.sin(rho * twoPi / nArms));
                ctx.stroke();
            }
            for (i = 0; i < gO[_majR]; i++) {
                switch (gO[_grMajR]) {
                    case _none:
                        break;
                    case _tick:
                        for (rho = 0; rho < nArms; rho++) {
                            var dX = TICKHEIGHT1 * Math.cos(twoPi * rho / nArms);
                            var dY = TICKHEIGHT1 * Math.sin(twoPi * rho / nArms);
                            var baseX = cW / 2 + rl * i * Math.cos(twoPi * rho / nArms) / (gO[_majR] - 1);
                            var baseY = cW / 2 + rl * i * Math.sin(twoPi * rho / nArms) / (gO[_majR] - 1);
                            ctx.beginPath();
                            ctx.moveTo(baseX - dY, baseY + dX);
                            ctx.lineTo(baseX + dY, baseY - dX);
                            ctx.stroke();
                        }
                        break;
                    case _line:
                        var rrr = rl * i / (gO[_majR] - 1);
                        if (rrr > 0) {
                            ctx.beginPath();
                            ctx.arc(cW / 2, cH / 2, rrr, 0, twoPi, false);
                            ctx.stroke();
                        }
                        break;
                }

            }
        }
        ctx.strokeStyle = "rgb(100,100,100)";
        if (gO[_minR] > 1) {
            var nrA = nArms;
            if (nrA > 20)
                nrA = 20;
            for (var rho = 0; rho < nArms; rho++) {
                var rl = cM / 2;
                ctx.beginPath();
                ctx.moveTo(cW / 2, cH / 2);
                ctx.lineTo(cW / 2 + rl * Math.cos(rho * twoPi / nArms), cH / 2 + rl * Math.sin(rho * twoPi / nArms));
                ctx.stroke();
            }
            for (i = 0; i < gO[_minR]; i++) {
                switch (gO[_grMinR]) {
                    case _none:
                        break;
                    case _tick:
                        for (rho = 0; rho < nArms; rho++) {
                            var dX = TICKHEIGHT2 * Math.cos(twoPi * rho / nArms);
                            var dY = TICKHEIGHT2 * Math.sin(twoPi * rho / nArms);
                            var baseX = cW / 2 + rl * i * Math.cos(twoPi * rho / nArms) / (gO[_minR] - 1);
                            var baseY = cW / 2 + rl * i * Math.sin(twoPi * rho / nArms) / (gO[_minR] - 1);
                            ctx.beginPath();
                            ctx.moveTo(baseX - dY, baseY + dX);
                            ctx.lineTo(baseX + dY, baseY - dX);
                            ctx.stroke();
                        }
                        break;
                    case _line:
                        var rrr = rl * i / (gO[_minR] - 1);
                        if (rrr > 0) {
                            ctx.beginPath();
                            ctx.arc(cW / 2, cH / 2, rrr, 0, twoPi, false);
                            ctx.stroke();
                        }
                        break;
                }

            }
        }
    }
    //----------------------------------------------------------------------
    var setXYPar = function(i, b, gPar) {
        for (var j = 2; j < b.length; j++) {
            var bv = b[j].v
            switch (b[j].p) {
                case _x1:
                    gPar.x1 = mrx(bv[i]);
                    break;
                case _y1:
                    gPar.y1 = mry(bv[i]);
                    break;
                case _z1:
                    gPar.z1 = mry(bv[i]);
                    break;
                case _x2:
                    gPar.x2 = mrx(bv[i]);
                    break;
                case _y2:
                    gPar.y2 = mry(bv[i]);
                    break;
                case _z2:
                    gPar.z2 = mry(bv[i]);
                    break;
                case _x3:
                    gPar.x3 = mrx(bv[i]);
                    break;
                case _y3:
                    gPar.y3 = mry(bv[i]);
                    break;
                case _z3:
                    gPar.z3 = mry(bv[i]);
                    break;
                case _x4:
                    gPar.x4 = mrx(bv[i]);
                    break;
                case _y4:
                    gPar.y4 = mry(bv[i]);
                    break;
                case _z4:
                    gPar.z4 = mry(bv[i]);
                    break;
            }
        }
    }
    //----------------------------------------------------------------------
    var setGenPar = function(i, b, gPar) {
        var j
        for (j in gPar) {
            gPar[j] = defaultValues[j]._value
        }
        for (var j = 2; j < b.length; j++) {
            if (b[j].p.indexOf('col') >= 0) {
                if (b[j].p != _col_a) {
                    gPar[b[j].p] = Math.round(b[j].v[i])
                } else {
                    gPar[b[j].p] = b[j].v[i]
                }
            } else {
                gPar[b[j].p] = b[j].v[i]
            }
        }
    }
    //----------------------------------------------------------------------
    var doDraw = function(a, b) {
        var i = 0;
        var j = 0;
        var x, y, dia, xBase, yBase, width, r, x1, x2, x3, x4, y1, y2, y3, y4, w, h, yBase, xBase
        var glbPar = []
        for (i = 0; i < allGenRenderPars.length; i++) {
            var propName = allGenRenderPars[i]
            var val = defaultValues[propName]._value
            glbPar[propName] = val
        }
        var ctx = $('#' + divName + '_canvas')[0].getContext("2d");
        CanvasTextFunctions.enable(ctx);
        switch (b[1][_plotType]) {
            case _line:
                {
                    setGenPar(0, b, glbPar);
                    x1 = mrx(glbPar[_x])
                    y1 = mry(glbPar[_y])
                    for (i = 1; i < b[1][_nPoints]; i++) {
                        setGenPar(i, b, glbPar);
                        x2 = mrx(glbPar[_x])
                        y2 = mry(glbPar[_y])
                        ctx.beginPath();
                        ctx.strokeStyle = "rgb(" + glbPar[_col_r] + "," + glbPar[_col_g] + "," + glbPar[_col_b] + ")";
                        ctx.lineWidth = glbPar[_width];
                        ctx.moveTo(x1, y1);
                        ctx.lineTo(x2, y2);
                        x1 = x2
                        y1 = y2
                        ctx.stroke();
                        if (glbPar[_tag] != '' && glbPar[_tag] != undefined) {
                            ctx.globalAlpha = 1.0;
                            ctx.strokeStyle = "rgb(" + glbPar[_tcol_r] + "," + glbPar[_tcol_g] + "," + glbPar[_tcol_b] + ")";
                            ctx.drawTextCenter('sans', glbPar[_pointsize], glbPar[_tagx] + (glbPar[_x1] + glbPar[_x2]) / 2, glbPar[_tagy] + (glbPar[_y1] + glbPar[_y2]) / 2 + TEXTHEIGHTOFFSET, glbPar[_tag]);
                        }
                    }
                }
                break;
            case _contour:
                {
                    contourPars = {
                        'vv': [],
                        'ww': 0,
                        'hh': 0,
                        'iso': [],
                        'isoVal': 0,
                        'colR': [],
                        'colG': [],
                        'colB': [],
                        'colA': [],
                        'width': [],
                        'ctx': 0
                    }
                    for (i = 2; i < b.length; i++) {
                        switch (b[i].p) {
                            case _source:
                                // I don't know why the subsequent case analysis is necessary,
                                // but it seems that sometimes the source property points to an array
                                // in a, sometimes it points to an array of indices into a, and sometimes 
                                // it opints to the 2D data set right away. We cater for all 3 possibilities.
                                if (b[i]._value > 0) {
                                    contourPars.vv = a[b[i]._value]
                                } else {
                                    if (b[i].v[0] instanceof Array) {
                                        contourPars.vv = b[i].v
                                    } else {
                                        if (b[i].v[0] > 0) {
                                            contourPars.vv = a[b[i].v[0]]
                                        } else {
                                            contourPars.vv = 0
                                            // the fail case will be caught in a minute
                                        }
                                    }
                                }
                                break;
                            case _width:
                                contourPars.width = b[i].v;
                                break;
                            case _col_r:
                                contourPars.colR = b[i].v;
                                break;
                            case _col_g:
                                contourPars.colG = b[i].v;
                                break;
                            case _col_b:
                                contourPars.colB = b[i].v;
                                break;
                            case _col_a:
                                contourPars.colA = b[i].v;
                                break;
                            case _iso:
                                contourPars.iso = b[i].v;
                                break;
                        }
                    }
                    // since we don't do setGenPar, like for other primitives, 
                    if (contourPars.vv instanceof Array) {
                        if (contourPars.vv[0] instanceof Array) {
                            contourPars.ctx = ctx;
                            drawContours(ctx)
                        } else {
                            statusReport += "\nDescartes: cannot draw contours, since source-property was not set to a 2-D array;"
                        }
                    } else {
                        statusReport += "\nDescartes: cannot draw contours, since source-property was not set to a array;"
                    }
                }
                break;
            case _relief:
                {
                    reliefPars = {
                        'vv': [],
                        'ww': 0,
                        'hh': 0,
                        'colR': defaultValues[_col_r]._value / 256,
                        'colG': defaultValues[_col_g]._value / 256,
                        'colB': defaultValues[_col_b]._value / 256,
                        'colA': defaultValues[_col_a]._value,
                        'ctx': 0,
                        'lights': []
                    }
                    for (i = 2; i < b.length; i++) {
                        switch (b[i].p) {
                            case _source:
                                reliefPars.vv = a[b[i].v[0]];
                                break;
                                // the [0] is necessary: the source-array has
                                // been expanded, as any other property, because of e.g. a color or width attribute
                                // that occurs as an array
                            case _col_r:
                                reliefPars.colR = b[i].v[0] / 256;
                                break;
                            case _col_g:
                                reliefPars.colG = b[i].v[0] / 256;
                                break;
                            case _col_b:
                                reliefPars.colB = b[i].v[0] / 256;
                                break;
                                // this is to accommodata a simple diffuse shader
                            case _col_a:
                                reliefPars.colA = b[i].v[0];
                                break;
                        }
                    }
                    if (b[1].lights) {
                        reliefPars.lights = b[1].lights
                    } else {
                        alert("Descartes: internal error. No light object for relief.")
                    }
                    if (reliefPars.vv instanceof Array) {
                        if (reliefPars.vv[0] instanceof Array) {
                            reliefPars.ctx = ctx;
                            drawRelief(ctx)
                        } else {
                            statusReport += "\nDescartes: cannot draw relief, since source-property was not set to a 2-D array;"
                        }
                    } else {
                        statusReport += "\nDescartes: cannot draw relief, since source-property was not set to a array;"
                    }
                }
                break;
            case _surface:
                {
                    alert("The plotType 'surface' is not yet implemented (planned for Spring 2014)")
                }
                break;
            case _network:
                {
                    alert("The plotType 'network' is not yet implemented (planned for Spring 2014)")
                }
                break;
            case _vector:
                {
                    for (i = 0; i < b[1][_nPoints]; i++) {
                        setGenPar(i, b, glbPar);
                        setXYPar(i, b, glbPar);
                        drawVector(ctx, glbPar, b[1]);
                        if (glbPar[_tag] != '' && glbPar[_tag] != undefined) {
                            // tgs are not subject to perspective xformation
                            ctx.globalAlpha = 1.0;
                            ctx.strokeStyle = "rgb(" + glbPar[_tcol_r] + "," + glbPar[_tcol_g] + "," + glbPar[_tcol_b] + ")";
                            ctx.drawTextCenter('sans', glbPar[_pointsize], glbPar[_tagx] + (glbPar[_x1] + glbPar[_x2]) / 2, glbPar[_tagy] + (glbPar[_y1] + glbPar[_y2]) / 2 + TEXTHEIGHTOFFSET, glbPar[_tag]);
                        }
                    }
                }
                break;
            case _bubble:
                {
                    for (i = 0; i < b[1][_nPoints]; i++) {
                        setGenPar(i, b, glbPar);
                        x = mrx(glbPar[_x])
                        y = mry(glbPar[_y])
                        dia = mrr(glbPar[_diameter])
                        if (dia > 0) {
                            ctx.beginPath();
                            ctx.arc(x, y, dia / 2, 0, 2 * Math.PI, false);
                            ctx.fillStyle = "rgba(" + glbPar[_col_r] + "," + glbPar[_col_g] + "," + glbPar[_col_b] + "," + glbPar[_col_a] + ")";
                            ctx.fill();
                            if (glbPar[_tag] != '' && glbPar[_tag] != undefined) {
                                ctx.globalAlpha = 1.0;
                                ctx.strokeStyle = "rgb(" + glbPar[_tcol_r] + "," + glbPar[_tcol_g] + "," + glbPar[_tcol_b] + ")";
                                ctx.drawTextCenter('sans', glbPar[_pointsize], glbPar[_tagx] + x, glbPar[_tagy] + y + dia / 2 + TEXTHEIGHTOFFSET, glbPar[_tag]);
                            }
                        }
                    }
                }
                break;
            case _box:
                {
                    for (i = 0; i < b[1][_nPoints]; i++) {
                        setGenPar(i, b, glbPar);
                        x = mrx(glbPar[_x])
                        y = mry(glbPar[_y])
                        w = mrx(glbPar[_width])
                        h = mry(glbPar[_height])
                        ctx.beginPath();
                        ctx.fillStyle = "rgba(" + glbPar[_col_r] + "," + glbPar[_col_g] + "," + glbPar[_col_b] + "," + glbPar[_col_a] + ")";
                        ctx.fillRect(x - w / 2, y - h / 2, w, h);
                        if (glbPar[_tag] != '' && glbPar[_tag] != undefined) {
                            ctx.globalAlpha = 1.0;
                            ctx.strokeStyle = "rgb(" + glbPar[_tcol_r] + "," + glbPar[_tcol_g] + "," + glbPar[_tcol_b] + ")";
                            ctx.drawTextCenter('sans', glbPar[_pointsize], glbPar[_tagx] + x, glbPar[_tagy] + y + TEXTHEIGHTOFFSET + h / 2, glbPar[_tag]);
                        }
                    }
                }
                break;
            case _vbar:
                {
                    for (i = 0; i < b[1][_nPoints]; i++) {
                        setGenPar(i, b, glbPar);
                        x = mrx(glbPar[_x])
                        yBase = mry(glbPar[_yBase])
                        w = mrx(glbPar[_width])
                        h = mry(glbPar[_height])
                        ctx.beginPath();
                        ctx.fillStyle = "rgba(" + glbPar[_col_r] + "," + glbPar[_col_g] + "," + glbPar[_col_b] + "," + glbPar[_col_a] + ")";
                        ctx.fillRect(x - w / 2, yBase - h, w, h);
                        if (glbPar[_tag] != '' && glbPar[_tag] != undefined) {
                            ctx.globalAlpha = 1.0;
                            ctx.strokeStyle = "rgb(" + glbPar[_tcol_r] + "," + glbPar[_tcol_g] + "," + glbPar[_tcol_b] + ")";
                            ctx.drawTextCenter('sans', glbPar[_pointsize], glbPar[_tagx] + x, glbPar[_tagy] + yBase + TEXTHEIGHTOFFSET, glbPar[_tag]);
                        }
                    }
                }
                break;
            case _hbar:
                {
                    for (i = 0; i < b[1][_nPoints]; i++) {
                        setGenPar(i, b, glbPar);
                        y = mr(cH - glbPar[_y] * vPTy)
                        xBase = mrx(glbPar[_xBase])
                        w = mry(glbPar[_width])
                        h = mry(glbPar[_height])
                        ctx.beginPath();
                        ctx.fillStyle = "rgba(" + glbPar[_col_r] + "," + glbPar[_col_g] + "," + glbPar[_col_b] + "," + glbPar[_col_a] + ")";
                        ctx.fillRect(xBase, y - h / 2, w, h);
                        if (glbPar[_tag] != '' && glbPar[_tag] != undefined) {
                            ctx.globalAlpha = 1.0;
                            ctx.strokeStyle = "rgb(" + glbPar[_tcol_r] + "," + glbPar[_tcol_g] + "," + glbPar[_tcol_b] + ")";
                            ctx.drawTextCenter('sans', glbPar[_pointsize], glbPar[_tagx] + xBase - TEXTWIDTHOFFSET, glbPar[_tagy] + y, glbPar[_tag]);
                        }
                    }
                }
                break;
            case _ring:
                {
                    // first map the angles to the interval between 0 and 2pi
                    var totAng = 0;
                    for (i = 0; i < b[1][_nPoints]; i++) {
                        for (var j = 2; j < b.length; j++) {
                            if (b[j].p == _phi) {
                                totAng += Math.abs(b[j].v[i]);
                            }
                        }
                    }
                    if (totAng > 0) {
                        for (i = 0; i < b[1][_nPoints]; i++) {
                            for (j = 2; j < b.length; j++) {
                                if (b[j].p == _phi) {
                                    b[j].v[i] = Math.abs(b[j].v[i]) * 6.28 / totAng;
                                }
                            }
                        }
                    }
                    var phiCurr = 0;
                    for (i = 0; i < b[1][_nPoints]; i++) {
                        setGenPar(i, b, glbPar);
                        for (var j = 2; j < b.length; j++) {
                            if (b[j].p == _phi) {
                                var phi1 = phiCurr;
                                var phi2 = phiCurr + b[j].v[i];
                                phiCurr = phi2;
                                break;
                            }
                        }
                        x = mrx(glbPar[_x])
                        y = mry(glbPar[_y])
                        r = mrr(glbPar[_r])
                        if (r > 0) {
                            ctx.beginPath();
                            ctx.moveTo(x, y);
                            ctx.arc(x, y, r, phi1, phi2, false);
                            ctx.closePath();
                            ctx.fillStyle = "rgba(" + glbPar[_col_r] + "," + glbPar[_col_g] + "," + glbPar[_col_b] + "," + glbPar[_col_a] + ")";
                            ctx.fill();
                            if (glbPar[_tag] != '' && glbPar[_tag] != undefined) {
                                var avPhi = (phi1 + phi2) / 2;
                                var corrR = r * 1.1;
                                ctx.globalAlpha = 1.0;
                                ctx.strokeStyle = "rgb(" + glbPar[_tcol_r] + "," + glbPar[_tcol_g] + "," + glbPar[_tcol_b] + ")";
                                if (avPhi > 0.5 * 3.1415 && avPhi < 1.5 * 3.1415) {
                                    ctx.drawTextCenter('sans', glbPar[_pointsize], glbPar[_tagx] + x + corrR * Math.cos((phi1 + phi2) / 2) - TEXTWIDTHOFFSET, glbPar[_tagy] + y + corrR * Math.sin((phi1 + phi2) / 2), glbPar[_tag]);
                                } else {
                                    ctx.drawTextCenter('sans', glbPar[_pointsize], glbPar[_tagx] + x + corrR * Math.cos((phi1 + phi2) / 2) + TEXTWIDTHOFFSET, glbPar[_tagy] + y + corrR * Math.sin((phi1 + phi2) / 2), glbPar[_tag]);
                                }
                            }
                        }
                    }
                }
                break;
            case _radar:
                {
                    var nSided = b[1][_nPoints];
                    for (i = 0; i < nSided; i++) {
                        setGenPar(i, b, glbPar);
                        for (var j = 2; j < b.length; j++) {
                            if (b[j].p == _r) {
                                var r1 = mrr(b[j].v[i]);
                                var r2 = b[j].v[(i + 1) % nSided] * vPTm;
                            }
                        }
                        x = mrx(glbPar[_x])
                        y = mry(glbPar[_y])
                        r = mrr(glbPar[_r])
                        w = mrr(glbPar[_width])
                        var xx1 = x + r1 * Math.cos(i * 6.28 / nSided);
                        var yy1 = y + r1 * Math.sin(i * 6.28 / nSided);
                        var xx2 = x + r2 * Math.cos((1 + i) * 6.28 / nSided);
                        var yy2 = y + r2 * Math.sin((1 + i) * 6.28 / nSided);
                        ctx.beginPath();
                        ctx.strokeStyle = "rgb(" + glbPar[_col_r] + "," + glbPar[_col_g] + "," + glbPar[_col_b] + ")";
                        ctx.lineWidth = w;
                        ctx.moveTo(xx1, yy1);
                        ctx.lineTo(xx2, yy2);
                        ctx.stroke();
                        if (glbPar[_tag] != '' && glbPar[_tag] != undefined) {
                            ctx.globalAlpha = 1.0;
                            ctx.strokeStyle = "rgb(" + glbPar[_tcol_r] + "," + glbPar[_tcol_g] + "," + glbPar[_tcol_b] + ")";
                            if (xx1 < glbPar[_x]) {
                                ctx.drawTextCenter('sans', glbPar[_pointsize], glbPar[_tagx] + xx1 - TEXTWIDTHOFFSET, glbPar[_tagy] + yy1, glbPar[_tag]);
                            } else {
                                ctx.drawTextCenter('sans', glbPar[_pointsize], glbPar[_tagx] + xx1 + TEXTWIDTHOFFSET, glbPar[_tagy] + yy1, glbPar[_tag]);
                            }
                        }
                    }
                }
                break;
            case _image:
                // no support for tags
                var scalX = 1;
                var scalY = 1;
                var mapR = {
                    'ref': -1,
                    'height': 0,
                    'width': 0,
                    'cv': 128
                };
                var mapG = {
                    'ref': -1,
                    'height': 0,
                    'width': 0,
                    'cv': 128
                };
                var mapB = {
                    'ref': -1,
                    'height': 0,
                    'width': 0,
                    'cv': 128
                };
                var mapA = {
                    'ref': -1,
                    'height': 0,
                    'width': 0,
                    'cv': 128
                };
                var finalWidth = TOOMUCH;
                var finalHeight = TOOMUCH;
                for (var j = 2; j < b.length; j++) {
                    switch (b[j].p) {
                        case _scaleX:
                            scalX = cW * b[j]['_value'] / vpx;
                            //this scaling ensures that the caller only has to reckon with the logical device coordinates, with dimensions
                            // vpx and vpy.
                            break;
                        case _scaleY:
                            scalY = cH * b[j]['_value'] / vpy;
                            break;
                        case _mapR:
                            if (b[j].v instanceof Array) {
                                mapR.height = b[j].v.length;
                                if (b[j].v[0] instanceof Array) {
                                    mapR.ref = j;
                                    mapR.width = b[j].v[0].length;
                                    finalHeight = Math.min(finalHeight, mapR.height);
                                    finalWidth = Math.min(finalWidth, mapR.width);
                                } else {
                                    mapR.cv = b[j].v[0];
                                }
                            } else {
                                mapR.cv = b[j].v;
                            }
                            break;
                        case _mapG:
                            if (b[j].v instanceof Array) {
                                mapG.height = b[j].v.length;
                                if (b[j].v[0] instanceof Array) {
                                    mapG.ref = j;
                                    mapG.width = b[j].v[0].length;
                                    finalHeight = Math.min(finalHeight, mapG.height);
                                    finalWidth = Math.min(finalWidth, mapG.width);
                                } else {
                                    mapG.cv = b[j].v[0];
                                }
                            } else {
                                mapG.cv = b[j].v;
                            }
                            break;
                        case _mapB:
                            if (b[j].v instanceof Array) {
                                mapB.height = b[j].v.length;
                                if (b[j].v[0] instanceof Array) {
                                    mapB.ref = j;
                                    mapB.width = b[j].v[0].length;
                                    finalHeight = Math.min(finalHeight, mapB.height);
                                    finalWidth = Math.min(finalWidth, mapB.width);
                                } else {
                                    mapB.cv = b[j].v[0];
                                }
                            } else {
                                mapB.cv = b[j].v;
                            }
                            break;
                        case _mapA:
                            if (b[j].v instanceof Array) {
                                mapA.height = b[j].v.length;
                                if (b[j].v[0] instanceof Array) {
                                    mapA.ref = j;
                                    mapA.width = b[j].v[0].length;
                                    finalHeight = Math.min(finalHeight, mapA.height);
                                    finalWidth = Math.min(finalWidth, mapA.width);
                                } else {
                                    mapA.cv = b[j].v[0];
                                }
                            } else {
                                mapA.cv = b[j].v;
                            }
                            break;
                    }
                }
                if (finalWidth < TOOMUCH && finalHeight < TOOMUCH) {
                    var imgData = ctx.createImageData(scalX * finalWidth, scalY * finalHeight);
                    var d = imgData.data;
                    //ctx.scale(1/scalX,1/scalY);
                    var run = 0;
                    var iRun = 0;
                    var mapSizesOK = true;
                    // perhaps the sizes of one of the maps has recently changed
                    mapSizesOK = mapSizesOK && mapSizeOK(b, finalHeight, finalWidth, mapR.ref);
                    mapSizesOK = mapSizesOK && mapSizeOK(b, finalHeight, finalWidth, mapG.ref);
                    mapSizesOK = mapSizesOK && mapSizeOK(b, finalHeight, finalWidth, mapB.ref);
                    mapSizesOK = mapSizesOK && mapSizeOK(b, finalHeight, finalWidth, mapA.ref);
                    if (mapSizesOK) {
                        for (var yy = 0; yy < finalHeight; yy++) {
                            var fromHere = run;
                            for (var xx = 0; xx < finalWidth; xx++) {
                                for (xxx = 0; xxx < scalX; xxx++) {
                                    if (mapR.ref >= 0) {
                                        d[run++] = b[mapR.ref].v[yy][xx];
                                    } else
                                        d[run++] = mapR.cv;
                                    if (mapG.ref >= 0) {
                                        d[run++] = b[mapG.ref].v[yy][xx];
                                    } else
                                        d[run++] = mapG.cv;
                                    if (mapB.ref >= 0) {
                                        d[run++] = b[mapB.ref].v[yy][xx];
                                    } else
                                        d[run++] = mapB.cv;
                                    if (mapA.ref >= 0) {
                                        d[run++] = b[mapA.ref].v[yy][xx];
                                    } else
                                        d[run++] = mapA.cv;
                                }
                            }
                            var toHere = run;
                            for (yyy = 0; yyy < scalY - 1; yyy++) {
                                for (var iRun = fromHere; iRun < toHere; iRun++) {
                                    d[run++] = d[iRun];
                                }
                            }
                        }
                        ctx.putImageData(imgData, (cW - scalX * finalWidth) / 2, (cH - scalY * finalHeight) / 2);
                    }
                }
                break;
            default:
                statusReport += "\nDescartes: unknown plotType, scanning " + b[1][_plotType];
        }
        if (b[1].hasOwnProperty(_grid)) {
            if (b[1][_grid]) {
                drawGrid(b[1][_grid], ctx, b[1][_nPoints]);
            }
        }
    }
    //-----------------------------------------------------------------------
    var perspProj = function(cam, x, y, z, w) {
        var r = {
            'x': 0,
            'y': 0,
            'w': 0
        }
        var txDot = (x - cam.eX) * cam.hX + (y - cam.eY) * cam.hY + (z - cam.eZ) * cam.hZ
        var tyDot = (x - cam.eX) * cam.vX + (y - cam.eY) * cam.vY + (z - cam.eZ) * cam.vZ
        var tzDot = (x - cam.eX) * cam.kX + (y - cam.eY) * cam.kY + (z - cam.eZ) * cam.kZ
        r.x = cW / 2 + cam.f * txDot / tzDot
        r.y = cH / 2 + cam.f * tyDot / tzDot
        r.w = Math.max(0.1, Math.abs(w * cam.f / tzDot))
        return r
    }
    //-----------------------------------------------------------------------
    var drawVector = function(ctx, glbPar, b) {
        if (b.camera[_proj]) {
            var xy1 = perspProj(b.camera, glbPar[_x1], glbPar[_y1], glbPar[_z1], glbPar[_width])
            var xy2 = perspProj(b.camera, glbPar[_x2], glbPar[_y2], glbPar[_z2], glbPar[_width])
            var xy3 = perspProj(b.camera, glbPar[_x3], glbPar[_y3], glbPar[_z3], glbPar[_width])
            var xy4 = perspProj(b.camera, glbPar[_x4], glbPar[_y4], glbPar[_z4], glbPar[_width])
            var x1 = xy1.x
            var x2 = xy2.x
            var x3 = xy3.x
            var x4 = xy4.x
            var y1 = xy1.y
            var y2 = xy2.y
            var y3 = xy3.y
            var y4 = xy4.y
            var width = xy1.w
        } else {
            var x1 = glbPar[_x1]
            var x2 = glbPar[_x2]
            var x3 = glbPar[_x3]
            var x4 = glbPar[_x4]
            var y1 = glbPar[_y1]
            var y2 = glbPar[_y2]
            var y3 = glbPar[_y3]
            var y4 = glbPar[_y4]
            var width = glbPar[_width]
        }
        switch (glbPar[_type]) {
            case _segment:
                ctx.beginPath();
                ctx.lineWidth = width;
                ctx.strokeStyle = "rgb(" + glbPar[_col_r] + ", " + glbPar[_col_g] + ", " + glbPar[_col_b] + ")";
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
                if (glbPar[_end1] == _arrow) {
                    ctx.fillStyle = "rgb(" + glbPar[_col_r] + ", " + glbPar[_col_g] + ", " + glbPar[_col_b] + ")";
                    drawArrow(ctx, x1, y1, x2, y2, ARROWLENGTH * width, ARROWWIDTH * width);
                }
                if (glbPar[_end2] == _arrow) {
                    ctx.fillStyle = "rgb(" + glbPar[_col_r] + ", " + glbPar[_col_g] + ", " + glbPar[_col_b] + ")";
                    drawArrow(ctx, x2, y2, x1, y1, ARROWLENGTH * width, ARROWWIDTH * width);
                }
                break;
            case _circle:
                var r = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
                ctx.beginPath();
                ctx.lineWidth = width;
                ctx.strokeStyle = "rgb(" + glbPar[_col_r] + ", " + glbPar[_col_g] + ", " + glbPar[_col_b] + ")";
                ctx.arc(x1, y1, r, 0, 2 * Math.PI, false);
                if (glbPar[_fill] == _interior || glbPar[_fill] == _both) {
                    ctx.fillStyle = "rgba(" + glbPar[_fcol_r] + "," + glbPar[_fcol_g] + "," + glbPar[_fcol_b] + "," + glbPar[_fcol_a] + ")";
                    ctx.fill();
                }
                if (glbPar[_fill] == _border || glbPar[_fill] == _both) {
                    ctx.stroke();
                }
                break;
            case _infLine:
                break;
            case _ellips:
                break;
            case _parabola:
                break;
            case _hyperbola:
                break;
            case _triangle:
                ctx.beginPath();
                ctx.lineWidth = width;
                ctx.strokeStyle = "rgb(" + glbPar[_col_r] + ", " + glbPar[_col_g] + ", " + glbPar[_col_b] + ")";
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.lineTo(x3, y3);
                ctx.lineTo(x1, y1);
                if (glbPar[_fill] == _interior || glbPar[_fill] == _both) {
                    ctx.fillStyle = "rgba(" + glbPar[_fcol_r] + "," + glbPar[_fcol_g] + "," + glbPar[_fcol_b] + "," + glbPar[_fcol_a] + ")";
                    ctx.fill();
                }
                if (glbPar[_fill] == _border || glbPar[_fill] == _both) {
                    ctx.stroke();
                }
                break;
            case _parallellogram:
                ctx.beginPath();
                ctx.lineWidth = width;
                ctx.strokeStyle = "rgb(" + glbPar[_col_r] + ", " + glbPar[_col_g] + ", " + glbPar[_col_b] + ")";
                ctx.moveTo(x1, y1);
                ctx.lineTo(x1, y1);
                ctx.lineTo(x1 + x3 - x1, y1 + y3 - y1);
                ctx.lineTo(x3, y3);
                ctx.lineTo(x1, y1);
                if (glbPar[_fill] == _interior || glbPar[_fill] == _both) {
                    ctx.fillStyle = "rgba(" + glbPar[_fcol_r] + "," + glbPar[_fcol_g] + "," + glbPar[_fcol_b] + "," + glbPar[_fcol_a] + ")";
                    ctx.fill();
                }
                if (glbPar[_fill] == _border || glbPar[_fill] == _both) {
                    ctx.stroke();
                }
                break;
            case _quad:
                ctx.beginPath();
                ctx.lineWidth = width;
                ctx.strokeStyle = "rgb(" + glbPar[_col_r] + ", " + glbPar[_col_g] + ", " + glbPar[_col_b] + ")";
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.lineTo(x3, y3);
                ctx.lineTo(x4, y4);
                ctx.lineTo(x1, y1);
                if (glbPar[_fill] == _interior || glbPar[_fill] == _both) {
                    ctx.fillStyle = "rgba(" + glbPar[_fcol_r] + "," + glbPar[_fcol_g] + "," + glbPar[_fcol_b] + "," + glbPar[_fcol_a] + ")";
                    ctx.fill();
                }
                if (glbPar[_fill] == _border || glbPar[_fill] == _both) {
                    ctx.stroke();
                }
                break;
            case _bezier:
                ctx.beginPath();
                ctx.lineWidth = width;
                ctx.strokeStyle = "rgb(" + glbPar[_col_r] + ", " + glbPar[_col_g] + ", " + glbPar[_col_b] + ")";
                ctx.moveTo(x1, y1);
                ctx.bezierCurveTo(x2, y2, x3, y3, x4, y4);
                if (glbPar[_fill] == _interior || glbPar[_fill] == _both) {
                    ctx.fillStyle = "rgba(" + glbPar[_fcol_r] + "," + glbPar[_fcol_g] + "," + glbPar[_fcol_b] + "," + glbPar[_fcol_a] + ")";
                    ctx.fill();
                }
                if (glbPar[_fill] == _border || glbPar[_fill] == _both) {
                    ctx.stroke();
                }
                break;
        }
    }
    //----------------------------------------------------------------------
    var mapSizeOK = function(b, finalHeight, finalWidth, bArg) {
        if (b[bArg]) {
            if (b[bArg].v) {
                if (b[bArg].v.length != finalHeight) {
                    return false;
                } else {
                    if (b[bArg].v[0].length != finalWidth) {
                        return false;
                    } else {
                        if (!(b[bArg].v[finalHeight - 1] instanceof Array)) {
                            return false;
                        } else {
                            if (b[bArg].v[finalHeight - 1].length != finalWidth) {
                                return false;
                            }
                        }
                    }
                }
            } else
                return false;
        }
        return true;
    }
    //----------------------------------------------------------------------
    var constructData = function(b, dataSize, spanSize) {
        var i = 0;
        var j = 0;
        if (spanSize < 0) {
            if (b[_mode] == _const) {
                for (i = 0; i < dataSize; i++) {
                    b.v[i] = b._value;
                }
            } else {
                if (b[_mode] == _intp) {
                    for (i = 0; i < dataSize; i++) {
                        // we may have to interpolate non-numeric data, namely
                        // for plotType==vector and for tags. We recognize such cases because
                        // we assume b._low is then zero. Instead of calculate
                        // interpolation, simply replicate
                        if (b._low != undefined) {
                            b.v[i] = ((dataSize - i - 1) * b._low + i * b._high) / (dataSize - 1)
                        } else {
                            b.v[i] = b._value;
                        }
                    }
                }
            }
        } else {
            if (b[_mode] == _const) {
                for (i = 0; i < dataSize; i++) {
                    b.v[i] = [];
                    for (var j = 0; j < spanSize; j++) {
                        b.v[i][j] = b._value;
                    };
                }
            } else {
                if (b[_mode] == _intp) {
                    // no need for  'interpolating' non-numeric data
                    for (i = 0; i < dataSize; i++) {
                        b.v[i] = [];
                        var tVal = ((dataSize - i - 1) * b._low + i * b._high) / (dataSize - 1);
                        for (var j = 0; j < spanSize; j++) {
                            b.v[i][j] = tVal;
                        }
                    }
                }
            }

        }
    }
    //----------------------------------------------------------------------
    var drawArrow = function(ctx, x1, y1, x2, y2, l, w) {
        var x3 = x2 - x1;
        var y3 = y2 - y1;
        var x4 = y3;
        var y4 = -x3;
        var unL = Math.sqrt(x3 * x3 + y3 * y3);
        if (unL > 0) {
            x3 = x1 + x3 * l / unL;
            y3 = y1 + y3 * l / unL;
            x4 = x4 * w / unL;
            y4 = y4 * w / unL;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x3 + x4, y3 + y4);
            ctx.lineTo(x3 - x4, y3 - y4);
            ctx.lineTo(x1, y1);
            ctx.fill();
        }
    }
    //----------------------------------------------------------------------
    var dealWithProp = function(p, a, pName, b) {
        var rW = -1;
        var rN = TOOMUCH;
        var rSpan = TOOMUCH;
        var rV = [];
        var rmode = _const;
        var rP = pName;
        var rValue = defaultValues[pName]._value
        // notice: low and high serve as purpose to indicate the borders for the _intp-mode
        var rLow = defaultValues[pName]._low
        var rHigh = defaultValues[pName]._high
        if (b) {
            var rV = b.v;
            var rSpan = b.nSpan;
            var rN = b.n;
        }
        var defaultReturnObject = {
            'w': -1,
            'n': 0,
            'nSpan': 0,
            'p': rP,
            _low: rLow,
            _high: rHigh,
            'v': rV,
            'value': rValue,
            _mode: rmode
        }
        if (!isNaN(parseFloat(p)) || typeof p == 'string') {
            // this allows to abbreviate a construction like x:{mode:'const', value:12} by simply x:12
            rmode = 'const'
            rValue = p
        } else {
            if (p.hasOwnProperty(_mode)) {
                rmode = p[_mode];
                switch (p[_mode]) {
                    case _const:
                        if (p.hasOwnProperty(_value)) {
                            rValue = p[_value];
                        } else {
                            rValue = defaultValues[pName]._value;
                        }
                        if (p.hasOwnProperty(_shift)) {
                            statusReport += " \ nDescartes : incorrect properties. For mode = " + _const + ", value of " + _shift + " must not be set.";
                            return defaultReturnObject;
                        }
                        if (p.hasOwnProperty(_ref)) {
                            statusReport += " \ nDescartes : incorrect properties. For mode = " + _const + ", value of " + _ref + " must not be set.";
                            return defaultReturnObject;
                        }
                        break;
                    case _intp:
                        if (p.hasOwnProperty(_value)) {
                            statusReport += " \ nDescartes : incorrect properties. For mode = " + _intp + ", value of " + _value + " must not be set.";
                            return defaultReturnObject;
                        }
                        if (p.hasOwnProperty(_low)) {
                            rLow = p[_low];
                        } else {
                            rLow = defaultValues[pName]._low;
                        }
                        if (p.hasOwnProperty(_high)) {
                            rHigh = p[_high]
                        } else {
                            rHigh = defaultValues[pName]._high;
                        }
                        if (p.hasOwnProperty(_shift)) {
                            statusReport += " \ nDescartes : incorrect properties. For mode = " + _intp + ", value of " + _shift + " must not be set.";
                            return defaultReturnObject;
                        }
                        if (p.hasOwnProperty(_ref)) {
                            statusReport += " \ nDescartes : incorrect properties. For mode = " + _intp + ", value of " + _ref + " must not be set.";
                            return defaultReturnObject;
                        }
                        break;
                    case _data:
                    case _shift:
                    case _tfihs:
                        if (p.hasOwnProperty(_value)) {
                            statusReport += " \ nDescartes : incorrect properties. For mode = " + _data + " or " + _shift + ", value of " + _value + " must not be set.";
                            return defaultReturnObject;
                        }
                        if (!p.hasOwnProperty(_ref)) {
                            statusReport += " \ nDescartes : incorrect properties. For mode = " + _data + " or " + _shift + " a value for " + _ref + " must be given.No defaultvalue can be provided.";
                            return defaultReturnObject;
                        } else {
                            rW = p[_ref];
                        }
                        if (p.hasOwnProperty(_low)) {
                            rLow = p[_low];
                        } else {
                            rLow = defaultValues[pName]._low;
                        }
                        if (p.hasOwnProperty(_high)) {
                            rHigh = p[_high]
                        } else {
                            rHigh = defaultValues[pName]._high;
                        }
                        break;
                    default:
                        statusReport += " \ nDescartes:	illegal value for property " + _mode + ",	scanning " + p[_mode] + "; values must be " + _const + ",	" + _intp + "," + _data + " or " + _shift;
                        return defaultReturnObject;
                        break;
                }
            } else {
                // in case ' mode' is not set, mode is assumed to be 'const'.
                if (p.hasOwnProperty(_value)) {
                    rValue = p[_value];
                } else {
                    rValue = defaultValues[pName]._value;
                }
                if (p.hasOwnProperty(_shift)) {
                    statusReport += " \ nDescartes : incorrect properties. For mode = " + _const + "( = default, since no mode was set), value of " + _shift + " must not be set.";
                    return defaultReturnObject;;
                }
                if (p.hasOwnProperty(_ref)) {
                    statusReport += " \ nDescartes: incorrect properties. For mode = " + _const + "( = default, since no mode was set), value of " + _ref + " must not be set.";
                    return defaultReturnObject;;
                }
            }
            if (p.hasOwnProperty(_ref)) {
                if (p[_ref] < a.length) {
                    rW = p[_ref];
                    if (a[p[_ref]].length > 1) {
                        // the typical case where the length of a data array==1 is
                        // when we use the shift option.
                        rN = a[p[_ref]].length;
                        rV.length = rN
                        if (a[p[_ref]][0] instanceof Array) {
                            rSpan = a[p[_ref]][0].length;
                            for (var i = 0; i < rV.length; i++) {
                                if (rV[i]) {
                                    if (rV[i] instanceof Array) {
                                        rV[i].length = rSpan
                                    }
                                }
                            }
                        }
                    }
                } else {
                    statusReport += (" \ nDescartes: attribute " + _ref + " in property < " + pName + " > was set to < " + p[_ref] + " > , but the max.available array in the input had ref " + (a.length - 1).toString());
                }
            }
        }
        return {
            'w': rW,
            'n': rN,
            'nSpan': rSpan,
            'p': rP,
            _low: rLow,
            _high: rHigh,
            'v': rV,
            _value: rValue,
            'mode': rmode
        };
    }
    //-----------------------------------------------------------------------
    var drawContours = function(ctx) {
        var iso = contourPars.iso
        var vv = contourPars.vv
        // next find intersection patterns in each square
        var mask = 0
        contourPars.ctx = ctx
        contourPars.ww = cW / (vv.length - 1)
        contourPars.hh = cH / (vv[0].length - 1)
        // round all color values to avoid troubles with floats
        var parLength = contourPars.colR.length
        parLength = contourPars.colG.length > parLength ? contourPars.colG.length : parLength
        parLength = contourPars.colB.length > parLength ? contourPars.colB.length : parLength
        parLength = contourPars.width.length > parLength ? contourPars.width.length : parLength
        for (i = 0; i < contourPars.colR.length; i++) {
            if (contourPars.colR[i]) {
                contourPars.colR[i] = Math.round(contourPars.colR[i])
            } else {
                contourPars.colR[i] = defaultValues[_col_r]._value
            }
            if (contourPars.colG[i]) {
                contourPars.colG[i] = Math.round(contourPars.colG[i])
            } else {
                contourPars.colG[i] = defaultValues[_col_g]._value
            }
            if (contourPars.colB[i]) {
                contourPars.colB[i] = Math.round(contourPars.colB[i])
            } else {
                contourPars.colB[i] = defaultValues[_col_b]._value
            }
            if (contourPars.width[i]) {
                contourPars.width[i] = Math.round(contourPars.width[i])
            } else {
                contourPars.width[i] = defaultValues[_width]._value
            }
        }
        // the above is necessary since we can't do setGenPar for contours.
        for (i = 0; i < vv.length - 1; i++) {
            for (j = 0; j < vv[0].length - 1; j++) {
                for (k = 0; k < iso.length; k++) {
                    mask = 0
                    contourPars.isoVal = iso[k]
                    contourPars.ctx.strokeStyle = "rgb(" + contourPars.colR[k] + "," + contourPars.colG[k] + "," + contourPars.colB[k] + ")";
                    contourPars.ctx.lineWidth = contourPars.width[k];
                    if (vv[i][j] > iso[k]) mask += 1
                    if (vv[i + 1][j] > iso[k]) mask += 2
                    if (vv[i + 1][j + 1] > iso[k]) mask += 4
                    if (vv[i][j + 1] > iso[k]) mask += 8
                    switch (mask) {
                        case 0:
                        case 15:
                            break
                        case 1:
                        case 14:
                            mCLine(i, j, i + 1, j, i, j, i, j + 1)
                            break
                        case 2:
                        case 13:
                            mCLine(i + 1, j, i, j, i + 1, j, i + 1, j + 1)
                            break
                        case 3:
                        case 12:
                            mCLine(i, j, i, j + 1, i + 1, j, i + 1, j + 1)
                            break
                        case 4:
                        case 11:
                            mCLine(i + 1, j + 1, i + 1, j, i + 1, j + 1, i, j + 1)
                            break
                        case 5:
                        case 10:
                            mCLine(i, j, i + 1, j, i, j, i, j + 1)
                            mCLine(i + 1, j + 1, i + 1, j, i + 1, j + 1, i, j + 1)
                            break
                        case 6:
                        case 9:
                            mCLine(i, j, i + 1, j, i, j + 1, i + 1, j + 1)
                            break
                        case 7:
                        case 8:
                            mCLine(i, j + 1, i, j, i, j + 1, i + 1, j + 1)
                            break;
                    }
                }
            }
        }
    }
    //---------------------------------------------------------------------
    var mCLine = function(i1, j1, i2, j2, i3, j3, i4, j4) {
        var x1 = i1 * contourPars.ww
        var x2 = i2 * contourPars.ww
        var y1 = cH - j1 * contourPars.hh
        var y2 = cH - j2 * contourPars.hh
        var x3 = i3 * contourPars.ww
        var x4 = i4 * contourPars.ww
        var y3 = cH - j3 * contourPars.hh
        var y4 = cH - j4 * contourPars.hh
        var delta12 = contourPars.vv[i2][j2] - contourPars.vv[i1][j1]
        var delta34 = contourPars.vv[i4][j4] - contourPars.vv[i3][j3]
        var x12 = x1 + (x2 - x1) * (contourPars.isoVal - contourPars.vv[i1][j1]) / delta12
        var y12 = y1 + (y2 - y1) * (contourPars.isoVal - contourPars.vv[i1][j1]) / delta12
        var x34 = x3 + (x4 - x3) * (contourPars.isoVal - contourPars.vv[i3][j3]) / delta34
        var y34 = y3 + (y4 - y3) * (contourPars.isoVal - contourPars.vv[i3][j3]) / delta34
        contourPars.ctx.beginPath();
        contourPars.ctx.moveTo(x12, y12);
        contourPars.ctx.lineTo(x34, y34);
        contourPars.ctx.stroke();
    }
    //-----------------------------------------------------------------------
    var drawRelief = function(ctx) {
        var vv = reliefPars.vv
        var lights = reliefPars.lights
        var nLights = lights.length
        reliefPars.ctx = ctx
        reliefPars.ww = cW / (vv.length - 1)
        reliefPars.hh = cH / (vv[0].length - 1)
        for (var l = 0; l < nLights; l++) {
            var lNorm = Math.sqrt(lights[l][_l_x] * lights[l][_l_x] + lights[l][_l_y] * lights[l][_l_y] + lights[l][_l_z] * lights[l][_l_z])
            lights[l][_l_x] /= lNorm
            lights[l][_l_y] /= lNorm
            lights[l][_l_z] /= lNorm
        }
        for (i = 0; i < vv.length - 1; i++) {
            for (j = 0; j < vv[0].length - 1; j++) {
                // estimate normal vector by taking cross product of two 
                // diagonals
                var dy1 = 1
                var dx1 = 1
                var dz1 = vv[i + 1][j] - vv[i][j + 1]
                var dx2 = -1
                var dy2 = 1
                var dz2 = vv[i][j] - vv[i + 1][j + 1]
                var nx = dy1 * dz2 - dz1 * dy2
                var ny = dz1 * dx2 - dx1 * dz2
                var nz = dx1 * dy2 - dy1 * dx2
                var norm = Math.sqrt(nx * nx + ny * ny + nz * nz)
                nx /= norm
                ny /= norm
                nz /= norm
                var fcr = 0
                var fcg = 0
                var fcb = 0
                var fca = reliefPars.colA
                for (l = 0; l < nLights; l++) {
                    var dot = nx * lights[l][_l_x] + ny * lights[l][_l_y] + nz * lights[l][_l_z]
                    if (dot > 0) {
                        fcr = dot * lights[l][_l_r] * reliefPars.colR + fcr
                        fcg = dot * lights[l][_l_g] * reliefPars.colG + fcg
                        fcb = dot * lights[l][_l_b] * reliefPars.colB + fcb
                    }
                }
                var x1 = i * reliefPars.ww
                var x2 = (i + 1) * reliefPars.ww
                var y1 = cH - j * reliefPars.hh
                var y2 = cH - (j + 1) * reliefPars.hh
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y1);
                ctx.lineTo(x2, y2);
                ctx.lineTo(x1, y2);
                ctx.lineTo(x1, y1);
                ctx.fillStyle = "rgba(" + Math.round(Math.min(255, fcr)) + "," + Math.round(Math.min(255, fcg)) + "," + Math.round(Math.min(255, fcb)) + "," + fca + ")";
                ctx.fill();
            }
        }
    }
    //----------------------------------------------------------------------
    this.eraseGraph = function() {
        $('#' + divName + '_canvas').remove();
        canvasBuild = false;
        dBackup = [];
        $('#' + divName).hide();
    }
    //-------------------------------------------------------------------------
    this.getStatusReport = function() {
        return statusReport;
    }
    //-------------------------------------------------------------------------
    this.makeHelpSystem = function(f) {
        f.push({
            fName: "plotType",
            cat: "Descartes",
            help: "Numerical data can be visualised by means of a number of different visual elements or <em> plot types </em>. These are 'line', 'bubble', 'box', 'vbar', 'hbar', 'ring', 'radar', 'image', 'contour', 'surface', 'network', and 'relief'. The chosen plot type is set by the expression 'plotType':&lt value&gt in the control array, where the value is one of {'line','bubble','box','hbar','vbar','ring','radar','vector','image','contour','surface','network','relief'}. Each of these has its own set of properties. If no plotType property is specified, 'line' is chosen as default. All properties have default values that can be overruled by setting explicit values.",
            autoMapping: " ",
            example: "plot([[plotType:'bubble',x:[mode:'shift',ref:1],y:20,diameter:[mode:'data',ref:2]],vector1, vector2]) as a function definition in ACCEL produces a bubble graph where bubbles' x-coordinates are shifted versions of the value of the first element of vector1, y-coordinates are constant, and diameters are taken from the elements in vector2.",
            details: "The properties for each of the types are:<ul><li>line: x, y, width, col_r, col_g, col_b, col_a, tag, tagx, tagy, pointsize</li><li>bubble: x, y, diameter, col_r, col_g, col_b, col_a, tag, tagx, tagy, pointsize</li><li>box: x, y, width, height, col_r, col_g, col_b, col_a, tag, tagx, tagy, pointsize</li><li>vbar: x, yBase, width, height, col_r, col_g, col_b, col_a, tag, tagx, tagy, pointsize</li><li>hbar: xBase, y, width, height, col_r, col_g, col_b, col_a, tag, tagx, tagy, pointsize</li><li>radar: x, y, r, width, col_r, col_g, col_b, col_a, tag, tagx, tagy, pointsize</li><li>ring: x, y, r, phi, col_r, col_g, col_b, col_a, tag, tagx, tagy, pointsize</li><li>vector: x1, y1, x2, y2, x3, y3, x4, y4, type, fill, col_r, col_g, col_b, fcol_r, fcol_g, fcol_b, fcol_a, tcol_r, tcol_g, tcol_b, end1, end2, pointsize</li><li>image: scaleX, scaleY, nSpan, mapR, mapG, mapB, mapA</li><li>contour: source, iso, col_r, col_g, col_b, width</li><li>network: source, col_r, col_g, col_b, width, camera</li><li>relief: source, col_r, col_g, col_b, col_a, lights</li><li>surface: source, col_r, col_g, col_b, col_a, lights, camera</li></ul><br>Here x, y, x1..x4, y1..y4, width, height, diameter, r, phi, xBase and yBase are geometric properties; col_r, col_g and col_b as well as fcol_r, fcol_g, fcol_b, tcol_r, tcol_g, tcol_b are RGB colour components and col_a and fcol_a are transparency. <br><br>For plotTypes 'relief' and 'surface', where a solid (Gouraud) shaded surface is drawn, an array of light sources can be specified. The value for the property <em>lights</em> is an array; every element of the array is one light source. One light source is an object with optional properties l_x, l_y, l_z, l_r, l_g, l_b, defining the direction x,y,z components and the r,g,b, components. For omitted properties, plausible defaults are substituted. The first 3 are components of a 3-vector that doesn't need to be normalized; the second 3 are color values 0 ... 255. <br><br>For plotTypes 'network' and 'surface', where a 3-D viewing projection applies, a camera can be specified. A camera is an object with properties e_x, e_y, e_z (the coordinates of the eye point); h_x, h_y, h_z (the direction of the horizontal camera-base vector); v_x, v_y, v_z (the direction of the vertical camera-base vector); k_x, k_y, k_z (the direction of the camera-base vector in the gaze direction), and f (the focal length). Notice: the application is responsible for the camera base being orthonormal. <br><br>For 3-D viewing, by default a standard view location is assumed; the x-axis is horizontal, the y-axis is vertical pointing up, and the z-axis points away from the viewer.<br><br> For the plotTypes 'contour', 'network', 'relief' and 'surface', the data to be plotted comes in a 2-dimensional array. This array is referred to by the property <em>source</em>. This property works similar as the <em>ref</em> propoerty, that is: its value is an index, referring to one of the arrays following the array with the plotType information. Also for contours, we have to define the range of iso-values; these are given in an additional data argument array, pointed to by the value of the property <em>iso</em>. An example of an argument vector for a contour plot is the following: <br><br> [[plotType:'contour',iso:[mode:'data',ref:2],source:1,col_r:[mode:'data',ref:3],width:2],data,0.1*sqrt(vSeq(0,25)),10*vSeq(0,25)]<br><br>This should be interpreted as follows: the array <em>data</em>  is a 2-D array containing the data to be plotted in the contour plot; the iso values are given by the expression 0.1*sqrt(vSeq(0,25)), that is, a sequence of 25 values ranging from 0.0 to almost 0.5 in a square-root fashion; the colors of the 25 subsequent contours have a red component increasing from 0 to 250. <br><br>For the plotType 'vector', the property <em>type</em> can have a value being one of 'segment', (=straight line segment), 'infLine' (=line segment that ranges over the entire plotwindow), 'circle', 'ellips', 'parabola', 'hyperbola', 'triangle', 'bezier'(=cubic bezier, using 4 control points). For plotType 'vector', the border color properties are col_r, ... col_b; the fill color properties are fcol_r, ... fcol_a. The color components tcol_r, tcol_g, tcol_b serve to set the text color in tags. To apply filling (applies to circle, triangle, quad, and bezier), set property <em>fill</em> to 'border', 'interior', 'both' or 'none' as follows: fill:{value:'interior'}, et cetera. Since <em>value</em> is the property belonging to the default value of property <em>mode</em> (being 'constant'), it may be omitted: instead of fill:{value:'interior'} we may also write fill:'interior'. This applies to all occurrences of the property <em>value</em>. Values for properties <em>end1</em> and <em>end2</em> can be either 'arrow' or 'none'. The geometric properties <em>x1 ... x4, y1 ... y4</em> serve various purposes, depending on the value of property <em>type</em>. For a segment and circle, x3 up to y4 are ignored. The segment has (x1,y1) and (x2,y2) as endpoints; the circle has (x1,y1) as midpoint and passes through (x2,y2). Other types use three coordinate pairs ('triangle', 'ellips', 'parabola', 'hyperbola') or four ('quad', 'bezier'). <br><br>Plot elements can be labeled with tags (text); text tags can be optionally displaced with the properties <em>tagx</em> and <em>tagy</em> and have a size given by the value of property <em>pointsize</em>. <br><br>Each of the properties can receive a value in a number of different modes. See the explanation for 'properties' and 'modes' for further details. <br><br>For images, the properties <em>mapR, mapG, mapB, mapA</em> each stand for one color/alpha channel of the entire image. The corresponding data is therefore not a vectors of scalars, but a vector of vectors. Typically, the width of the image is taken from the (shortest) of these latter vectors. If 2D sets of data are not provided, the width can be set using the property <em>nSpan</em> (similar to property <em>nPoints</em> in case no 1D data sets are given).<br><br>Notice: there is a special precaution regarding the 'shift' and 'tfihs' modes. These make use of earlier versions of the data. Such earlier versions of the data, however, are only available as long as the control string stays unchanged. Indeed, if the control string changes, the entire internal data structure is re-calculated and built from scratch; thereby overwriting the history of the data. So care should be taken: when changing the control string, the 'shift' or 'tfihs' modes should not be used. <br><br>Thusfar, the plot types infLine, ellips, hyperbola and parabola have not yet been implemented.",
            seeAlso: "visual elements,properties,ring,line,bubble,box,box,vbar,hbar,ring,radar,vector,image,mode,contour,reflief,surface,network",
            external: "",
            abbreviation: ""
        });
        f.push({
            fName: "control vector",
            cat: "Descartes",
            help: "The control vector is the first element of the argument vector for each of the graphs in the argument-vector of the function plot(). This control vector determines how the data in optional second and further elements (=data vectors) are to be interpreted.",
            autoMapping: "",
            example: "In plot([[c1,v1,v2,v3],[c2,v4]]) we have two graphs or images. The control vectors defining the two graphs or images are c1 and c2, respectively. Control vector c1 gives the specification of up to three vectors with data, being v1, v2, v3, whereas c2 gives the speficition of how to interpret up to one vector of data, v4. It is allowed to have the same data vector being referenced more than once. For instance, one vector of values could determine both the width and the red component of bubbles in a bubble plot.",
            details: "The control vector is a comma-separated list of key-value pairs. Values, when these are strings, are enclosed in quutes. Keys, according to the ACCEL syntax of keys in key-value pairs, come without quotes. A key is one of the set {plotType, nPoints, nSpan, grid, x, y, x1, x2, x3, y1, y2, y3, x4, y4, diameter, type, fill, tag, tagx, tagy, pointsize, end1, end2, width, height, xBase, yBase, r, phi, col_r, col_g, col_b, col_a, mapR, mapG, mapB, mapA, lights, camera}. The possible values for a key are determined by that key. Values can be single strings or single numbers (e.g., for property <em>plotType</em> (a string) or for propoerty <em>nPoints</em> (a number). For other properties (hene: other keys), such as property <em>camera</em> the value is an object, that is: one or more key-value pairs enclosed in braces. An example for the preperty (key) <em>x</em>, for instance occurring as the location of one of the bubbles in a bubble plot, the value could be is {mode:'shift', ref:1}, having the properties (keys) <em>mode</em> and <em>ref</em> with values 'shift' and 1 (no quotes for numbers), respectively.",
            seeAlso: "plotType,visual element,properties,grid,graph,image",
            external: "",
            abbreviation: ""
        });
        f.push({
            fName: "properties",
            cat: "Descartes",
            help: "Properties of the visual elements (lines, bubbles, boxes, ...) of a graph or image are properties such as <em>x, y, width, diameter</em>, et cetera. All these properties can be coupled to data in a number of different ways.",
            autoMapping: "",
            example: "",
            details: "The coupling between a property and a single value or a data vector takes place by specifying the <em>mode</em>. There are 5 mode-values:<ul><li>'const': the argument of const is a constant number or string. This means that the property doesn' t need any further data. For instance y: [mode: 'const', value: 50] means that the y - coordinate of all visual elements is 50. Mode 'const' is the default, so the same would be achieved by y: [value: 50]. This can be abbreviated even further as y:50. </li><li>'data': the value for this property for the series of visual elements is taken from the elements of a vector. For instance: col_r: [mode: 'data', ref: 2] means that the red component of the visual elements is taken from the second data vector (hence ref:2). If this vector would be [128, 128, 128, 256], this would instruct 4 visual elements to be rendered, first three with half intensity red colour component, and the last one with full intensity. </li><li>'intp': the values for this property for the series of visual elements are obtained by linear interpolation between a low and a high value. For instance: x:[mode:'intp', low:0, high:100] means that the x - coordinates of the visual elements are linearly interpolated between 0 and 100 - as would typically be the case for a standard line graph representating y as a function of x in cartesian coordinates. The defaults for <emph>low</em> and <em>high</em> depend on the property. For instance, color components (col_r, col_g, col_b) are by default linearly interpolated between 0 and 256, col_a (the transparency) between 0 and 1, and the x - and y - coordinates are interpolated over the entire width and height of the screen.</li><li>'shift': to obtain the value for this property for the series of visual elements, only one element from a data vector is used. Every next redraw of the graph, values are passed onto the next visual element, imitating the effect of drawing a line on a running stretch of paper, like in an seismograph or EEG apparatus. For instance: y: [mode:'shift', ref:3] copies the y - coordinate of all visual elements from their left neightbour, and assigns the first element of the third data vector(hence ref:3) to the y - coordinate of the left most visual element. </li><li>'tfihs'(= the reverse of 'shift'):same as 'shift', except that copying goes from left to right instead of right to left. <br><br>Notice: shifting (or tfihsing) also works for images; the shift(tfihs) operation does not work on the elements of the provided data vectors. In images, these are vectors, each representing one horizontal span of pixels. Therefore, shifting or tfihsing in images always takes place vertically: rows of pixels are moved up or down, but the pixels within a row are left unaffected. </li></ul>All properties have reasonable defaults that get substituted when properties are omitted. For all properties, the property (key) <em>ref</em> determines to which of the data vectors this property is coupled in case of mode:'data', mode:'shift' or mode:'tfihs'.",
            seeAlso: "control string, plotType ",
            external: " ",
            abbreviation: " "
        });
        f.push({
            fName: "grid",
            cat: "Descartes",
            help: " In " + DESCARTESTM + ", graphs and even images can be enhanced with a grid to facilitate quantitative reading. Rectangular and polar grids are supported, both with major and minor ticks and major and minr grid lines.",
            autoMapping: " ",
            example: "grid:[majX:5, minX:17, grMajX:line, grMinX:tick, majY:5, minY:17, grMajY:line, grMinY:tick] specifies a cartesian grid with 5 - 1 = 4 major partitions in X direction, marked by long lines (spanning the entire graph area), and(17 - 5) / 4 = 3 minor partitions per major partition, marked by ticks (= short line segments), and similar for the Y - direction.",
            details: " A grid is specified with the property (key) <em>grid</em>. The value is an object, consisting of key - value pairs. Keys can be: majX, majY, minX, minY, majPhi, minPhi, majR, minR, grMajX, grMajY, grMinX, grMinY, grMajPhi, grMinPhi, grMajR, grMinR. <br><br>Keys starting with 'maj' or 'min' take a numeric value; these determine the number of major or minor paritions in one of the coordinates X, Y, (cartesian), Phi(polar) or R(radial). <br><br>Cartesian grids typically apply to plot types 'line', 'bubble', 'box', 'vbar', and 'hbar'. Polar and radial typically apply to plotTypes 'ring' and 'radar'. Properties (keys) starting with 'gr' determine what sort of visual appearence should mark this partition. Values are 'none'(= default), 'tick'(= short mark) or 'line'(= line or circle spanning the entire plot area). Notice that the numbers, to be given for the maj - and min - properties (keys), are the number of lines or ticks. The number of major partitions is the maj - property minus one. The value to be set for the min - key is equal to the number of desired minor partitions per major partition multiplied by the number of major partitions plus the number of major ticks (or lines). <br><br>Although cartesian grids typically go with line or bubble plot types, and polar - or radial grids typically go with ring or radar plot types, this coupling is not enforced by " + DESCARTESTM + ". It is up to the user to combine whatever grid she pleases with any plotType.",
            seeAlso: " control string, plotType ",
            external: " ",
            abbreviation: " "
        });
        f.push({
            fName: "data points",
            cat: "Descartes",
            help: " The plotType - value, such as 'line', 'bubble', 'box', ... determines the type of graph to be generated by " + DESCARTESTM + ". Every plot type produces one or more visual elements. The number of visual elements shown can be determined implicitly (that is, by the number of elements in the data vectors) or explicitly (that is, by setting a key - value pair in the control vector).",
            autoMapping: " ",
            example: " ",
            details: " Consider the following call to " + DESCARTESTM + ": plot([ctrl, v1, v2, v3]). By default, the number of visual elements to be plotted is determined by the minimal length of vectors v1, v2, v3 - provided that their contents is accessed via the mode 'data' (indeed, for the modes, 'const' and 'intp', no data vector needs to be provided, and for modes 'shift' or 'tfihs', only a single element from the data array is used per call to to plot function). If, say, v1 and v2 would contain 50 elements and v3 contains 55 elements, the latter 5 elements of v3 are tacitly ignored. <br><br>In case none of these vectors is accessed via the mode 'data', the number of visual elements to be plotted is determined by default. This default can be overruled by setting 'nPoints:&lt number &gt' in the control vector. If a value for property nPoints is provided, the number of plotted visual elements will never be larger that this value.",
            seeAlso: " properties, control string ",
            external: " ",
            abbreviation: " "
        });
        f.push({
            fName: "image",
            cat: "Descartes",
            help: "The plotType-value 'image' allows data to be visualised that is 2D instead of (multiple series of) 1D.",
            autoMapping: "",
            example: "",
            details: "Consider the following call to " + DESCARTESTM + ": a=plot([[[plotType:'image', scaleX:{value:5}, scaleY:{value:5}, mapG:[mode:'tfihs',ref:1], mapR:[mode:'data',ref:1], mapA:[value:255]],b]]). Here, b is a vector of vectors, for instance constructed with two quantified expressions, or a function such as iMake, iConvolve or iSpike. Suppose that the dimensions of the vectors is 40 x 40, The red values of the 1600 pixels is taken directly from the data in b; b is interpreted row-wise. That is, every element of b is one row of data, specifying one row of pixels. The green values of the pixels are obtained by a 'tfihs' operation, that is: they are constantly shifted in from below. The blue values are unspecified - these take a default value. The alpha values are set to the constant value 255 (maximal). Notice: the range of alpha-values for mapA is between 0 and 255; the values in the color property col_a ranges between 0 and 1.<br><br>Performance considerations prohibit to have data sets larger than, say 100 x 100 in real-time applications. In order still to have reasonably sized images, pixels can be rendered as coloured rectangles; the size of the rectangles is given by the properties scaleX and scaleY. ",
            seeAlso: "properties,control string,iMake,iSpike,iConvolve,iGaussian,graph,relief,surface,contour,network",
            external: "",
            abbreviation: ""
        });
    }
}
