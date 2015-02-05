"use strict";
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
 * * a link to www.keesvanoverveld.com and a message that states the copyright of this file;
 * * The author takes no responsabilities for any consequences that should follow from using
 *   the contents of this file.
 *
 */
var DESCARTESTM = '<span class="descartesTM">Descartes</span>';
var twoPi = 2 * Math.PI
var onePi = Math.PI
var halfPi = Math.PI / 2.0
var descartes = function (arg) {
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
  // strict = true or false: when false, descartes skips over non-fatal exceptions, typically by
  // tacitly suppressing a problematic plot action.
  //
  var pRandom = []
  var nrRandom = 200
  var pRandomIndex=0
    // used if the arguments for colours or thicknesses of
    // contour curves are not explicitly specified; pseudo random values are
    // then used that stay the same in subsequent renderings.
  var TEXTWIDTHOFFSET = 6;
  var TEXTHEIGHTOFFSET = 3;
  var ARROWLENGTH = 12;
  var ARROWWIDTH = 2.4;
  var skipCheck=false
    // control if unrecognized propreties should be flagged
  var lights = []
    // every graph can have its own set of lights
  var camera = {}
    // every graph can have its own camera
  var mainLights = []
    // in case of missing lights per item, there is a set of default lights for the entire image
  var mainCamera = {}
    // in case of missing camera there is a camera for the entire image
  var grid = {}
    // the grid
  var mouseDownState = false
  var mouseLocX = 0
  var mouseLocY = 0
  var identity=[[1.0,0.0,0.0],[0.0,1.0,0.0],[0.0,0.0,1.0]]
  var virtualTrackBall=clone(identity)
  var autoCamBase=[[0,0,0],[1,0,0],[0,1,0],[0,0,1]]
  // the camera, when under auto-control,
  // is incrementally rotated. Therefore we have to preserve the camera state.
  // This is done in the form of a set of vectors; the first one is the eye point in 3-space;
  // the other 3 are the hor, vert and gaze unit vectors.
  var locations = []
  var edges = []
  var faces = []
    // the three properties of a geometry object
  var contours = []
    // the collection of iso-curve data sets.
  var map = []
    // map should not be a property of all of the elements of contours
    // to avoid vast data multiplication
  var lTemplate
  var eTemplate
  var fTemplate
    // the three templates to deal with defaults and templates for locations,
    // edges and faces.
  var cTemplate
    // the template to deal with contours (iso curves)
  var dLSort = []
  var dLPostSort = []
  var dLPreSort = []
    // the three display lists, one for graphics primitives that need to be z-sorted, the
    // other two for graphics primitives that don't need to be sorted.
    // Elements in the preSort array are rendered first (in the order in which they were put in);
    // next the elements in the dLSort array,
    // and finally those in the PostSort array
  var cB = (arg.cB) ? arg.cB : function (a) {};
  // call back for a click event on the canvas
  var cMove = (arg.cMove) ? arg.cMove : function (a) {};
  // call back for a move event on the canvas
  var divName = (arg.dN) ? arg.dN : 'html';
  // the div where the canvas is to be connected to
  var cW = arg.cW;
  // the width of the canvas
  var cH = arg.cH;
  // the height of the canvas
  var cM = Math.sqrt(cH * cW);
  // geometric average of height and width
  var strictCheck = (arg.strict) ? arg.strict : false
  var cameraAutoPitch = 0
  var cameraAutoYaw = 0
    // these variables serve to translate mouse events to
    // camera angles in case camera.auto is set to true
  var gaugeCircleDark=true
    // the gauge circle is the circle that is visible
    // when the mouse button is held down; it indicates the area,
    // for automatic camera orientation, outside which mouse movements
    // are interpreted as rotations around the gaze axis.
    // This circle is rendered in a flashing mode,
    // and therefore we have to keep track of the rendering count:
    // even or odd
  var vpX = 100;
  var vpY = 100;
  var vpM = 100;
  var vpX2 = vpX / 2
  var vpY2 = vpY / 2
  var vpM2 = vpM / 2
    // default dimensions of the viewport. That is: the coordinates (0,0) and (100,100) in the application are mapped
    // to the corners of the canvas.
  var vPTx = cW / vpX;
  var vPTy = cH / vpY;
  var vPTm = cM / vpM;
  // scale factor to go from viewport coordinates to pixel coordinates
  var FUDGEZ = Math.round(0.01 * cM)
    // this is a dirty hack to remedy the unsolvable
    // mixing of hidden line and hidden surface
  var fillStyle, strokeStyle, textStyle, lineThicknessStyle, fillTopology
    // these are defined as global so as to save passing parameters
  var mrx = function (x) {
    return x * vPTx
  }
  var mry = function (x) {
    return cH - x * vPTy
  }
  var mryRel = function (x) {
    // used to map relative distance, e.i. vectors, no locations, from
    // logic coordinates to screen coordinates.
    return (-x * vPTy)
  }
  var mrr = function (x) {
      return x * vPTm
    }
    // mapping functions to do the viewport-screen coordinates mapping
  var cF = (arg.cF) ? arg.cF : '';
  // optional: a style file for the canvas
  var canvasBuild = false;
  // a boolean telling if the canvas has been built
  var archive = [];
  // storese previous versions of data sets. This is needed for the rendering options 'shift'.
  var statusReport = ""
  // an optional error message
  var setStatus = function (x, fatal) {
    if (fatal || strictCheck) {
      if (statusReport == '') {
        statusReport = x
      }
    }
  }
  var ctx
    // the canvas context
  var _allProps = "all properties"
    // used in help page generation
    // coding for all Descartes concepts
  var LOC = 0
  var EDG = 1
  var FCE = 2
  var IMG = 3
  var CTR = 4
  var GEO = 5
  var GEN = 6
  var CAM = 7
  var LGT = 8
  var GRD = 9
  var BCK = 10
  var NRDESCARTESPROPS = 11
    // to store all templates containing default values and help info for all Descartes concepts
  var tpl = []
  var validProperties = []
  for (var i = 0; i < NRDESCARTESPROPS; i++) {
    tpl[i] = []
    validProperties[i] = ''
  }
  var tplNames=["locations","edges","faces","image","contour","geometry","generic","camera","lights","grid","background"]
  // used to report spurious property
  var _background = 'background'
    // to set background color or background image
  var _nrLocations = 'nrLocations'
    // in case of elongation, used in interpolation or shifting for locations
    // then it determines how many locations we need
  var _nrContours = 'nrContours'
    // in case of elongation, used in interpolation for contours
    // then it determines how many contours we need
  var _perspective = 'perspective'
    // set to true if perspective transfrmation should take place
  var _camera = 'camera'
    // the camera property
  var _lights = 'lights'
    // the lights property
  var _grid = 'grid'
    // the grid property
  var _gridPresent = 'gridPresent'
    // set to true if the grid is present and should be drawn
  var _look = 'look'
    // for a perspective camera, determines of the camera rotations are viewer centred (ptolmy, pivot) or
    // lookat-point centered (copernicus, orbit)
  var _auto = 'auto'
    // property of camera. When set to true,mouse movements control the orientation (yaw, pitch) of the camera
  var _eX = 'eX'
  var _eY = 'eY'
  var _eZ = 'eZ'
    // the coordinates of the eye-point or projective centre
  var _gX = 'gX'
  var _gY = 'gY'
  var _gZ = 'gZ'
    // the look-at point (or gaze point) in orbit mode
  var _kX = 'kX'
  var _kY = 'kY'
  var _kZ = 'kZ'
    // the k-(or gaze) direction
  var _hX = 'hX'
  var _hY = 'hY'
  var _hZ = 'hZ'
    // the horizontal direction
  var _vX = 'vX'
  var _vY = 'vY'
  var _vZ = 'vZ'
    // the vertical direction
  var _f = 'f'
    // the focal length
  var _r = 'r'
    // the distance from the camera to the look-at point
    // in orbit-mode
  var _roll = 'roll'
    // camera orientation: nodding like someone from India
  var _pitch = 'pitch'
    // camera orientation: nodding 'yes'
  var _yaw = 'yaw'
    // camera orientation: nodding 'no'
  var _l_r = 'l_r'
  var _l_g = 'l_g'
  var _l_b = 'l_b'
    // color of directional light source
  var _l_x = 'l_x'
  var _l_y = 'l_y'
  var _l_z = 'l_z'
    // location of directional light source
  var _l_px = 'l_px'
  var _l_py = 'l_py'
  var _l_pz = 'l_pz'
    // location of point light source
  var _l_open = 'l_open'
  var _l_dropOff = 'l_dropOff'
    // opening angle (in radians) and drop of for spot light source
  var _x = 'x'
  var _y = 'y'
  var _z = 'z'
    // location properties: x,y,z coordinates as taken from input
    // and after perspective transformation
  var _x3 = 'x3'
  var _y3 = 'y3'
  var _z3 = 'z3'
    // location properties: x,y,z coordinates prior to perspective transformation
  var _b = 'b'
  var _e = 'e'
    // edge properties: begin and end indices. These are indices into the locations array
  var _bB = 'bB'
  var _eB = 'eB'
    // edge propoerties: for bezier, these are nodes nrs. 2 and 3; indices in the locations array
  var _thickness = 'thickness'
    // when property of edges: the thickness of the line or the bezier.
    // when property of locations: the thickness of the border of an icon
  var _rad = 'rad'
    // locations: the radius of a bubble and sector icon
  var _width = 'width'
  var _height = 'height'
    // location properties: determine the dimensions of an icon and the dimensions of an arrow head
  var _grad = 'grad'
    // gradient property
  var _col_r = 'col_r'
  var _col_g = 'col_g'
  var _col_b = 'col_b'
    // location propoerties: the border volors of an icon
    // edge properties: ther drawing color of the line or bezier
  var _fcol_r = 'fcol_r'
  var _fcol_g = 'fcol_g'
  var _fcol_b = 'fcol_b'
  var _fcol_a = 'fcol_a'
    // location properties: the fill color of an icon
    // face properties: the diffuse fill color of a surface
  var _scol_r = 'scol_r'
  var _scol_g = 'scol_g'
  var _scol_b = 'scol_b'
  var _beta = 'beta'
    // specular reflection and shininess
  var _tcol_r = 'tcol_r'
  var _tcol_g = 'tcol_g'
  var _tcol_b = 'tcol_b'
  var _tcol_a = 'tcol_a'
    // edge property: the text color for a text tag
    // location property: the text color for a text tag
  var _data = 'data'
    // location, edge and face property: the data array containing the
    // properties for individual locations, edges of faces
  var _mode = 'mode'
    // location property: to specify interpolation, or shift modes
  var _shift = 'shift'
  var _value = 'value'
  var _intp = 'intp'
  var _random = 'random'
    // the various values of the mode-property
  var _low = 'low'
  var _high = 'high'
    // can ccompany the intp-value to specift lower and higher values for interpolation
  var _icon = 'icon'
    // location property : determines the kind of visual shape for the location
  var _none = 'none'
  var _box = 'box'
  var _hBar = 'hBar'
  var _vBar = 'vBar'
  var _sector = 'sector'
  var _radar = 'radar'
  var _frac = "frac"
  var _triUp = 'triUp'
  var _triDown = 'triDown'
  var _diamond = 'diamond'
  var _cross = 'cross'
  var _diagonalCross = 'diagonalCross'
  var _bubble = 'bubble'
    // the values for the icon-property
    // If none is present, 'bubble' is assumed
  var _image = 'image'
  var _sprite='sprite'
    // a sprite is a (typically small) image that can be put anywhere:
    // it is one of the icon-values
  var _spriteData='spriteData'
    // the pixel rgba-values forming a sprite in a 3D array: spriteData[x][y][0] is the red value of
    // the upper left pixel, etc.
  var _contour = 'contour'
  var _geometry = 'geometry'
    // only one of 'image', 'contour' or 'geometry' properties can be probided
    // for a graph. If none is present, 'geometry' is assumed.
  var _iso = 'iso'
    // property for 'contour' graph
  var _mapR = 'mapR'
  var _mapG = 'mapG'
  var _mapB = 'mapB'
  var _mapA = 'mapA'
  var _scaleX = 'scaleX'
  var _scaleY = 'scaleY'
    // properties for 'image'-graph
  var _tag = 'tag'
  var _tagx = 'tagx'
  var _tagy = 'tagy'
  var _pointSize = 'pointSize'
    // location or edge propoerties: determine text tag
  var _phi1 = 'phi1'
  var _phi2 = 'phi2'
  var _majX = 'majX'
  var _minX = 'minX'
  var _majY = 'majY'
  var _minY = 'minY'
  var _grMajX = 'grMajX'
  var _grMinX = 'grMinX'
  var _grMajY = 'grMajY'
  var _grMinY = 'grMinY'
  var _majPhi = 'majPhi'
  var _minPhi = 'minPhi'
  var _grMajPhi = 'grMajPhi'
  var _grMinPhi = 'grMinPhi'
  var _majR = 'majR'
  var _minR = 'minR'
  var _grMajR = 'grMajR'
  var _grMinR = 'grMinR'
  var _line = 'line'
  var _tick = 'tick'
  var _none = 'none'
    // grid properties.
  var _shape = 'shape'
    // edge property: determine whether a line or a bezier should be rendered
  var _bezier = 'bezier'
  var _line = 'line'
    // values of _shape-property
  var _loop = 'loop'
    // for a face: the property that takes as a value an array of indices into the
    // locations array, determining the locations that specify this face
  var _fill = 'fill';
  // location property: to specify whether an icon or arrow head should be filled
  var _border = 'border';
  var _interior = 'interior';
  var _both = 'both';
  // the three values for the fill property, determining the rendering of
  // icons and arrow heads
  var _arrows = 'arrows'
    // property of edge: determines which artrows should be drawn
  var _begin = 'begin';
  var _end = 'end';
  // values (together with _both and _none) for the _arrows property
  var _locations = 'locations'
  var _edges = 'edges'
  var _faces = 'faces'
    // properties of the geometry concept
  var _radAux = '_radAux'
    // location property, not to be set by the user, used for internal
    // bookkeeping when doing radar plot
  var _map = 'map'
    // used to provide 2D data sets. For contours these are the function values; for image these are the rgb-triples in
    // each pixel.
  var _ww = 'ww'
  var _hh = 'hh'
    // internal properties, used in contours
  var _skipCheck='skipCheck'
    // to omit checking for non-recognized properties.
    //
    //
    // the above variables make sure that every keyword only occurs as string only once,
    // so there is no chance for typo's
  var transformProperties = [_rad, _tagx, _tagy, _pointSize, _width, _height, _thickness]
    // these are rthe properties that are subject to perspective transformation
    //-----------------------------------------------------------------------
    // defaults and manuals for background properties
    //---------------------------------------------------------------------
  tpl[BCK][_image]={
    'e':'Background image',
    'd':'Not yet implemented'
  }
  tpl[BCK][_fcol_r]={
    'e':'Red component of background color',
    'd':'Scaled between 0 and 255'
  }
  tpl[BCK][_fcol_g]={
    'e':'Green component of background color',
    'd':'Scaled between 0 and 255'
  }
  tpl[BCK][_fcol_b]={
    'e':'Blue component of background color',
    'd':'Scaled between 0 and 255'
  }
  tpl[BCK][_fcol_a]={
    'e':'Opacity of background color',
    'd':'Scaled between 0 and 1'
  }
    //-------------------------------------------------------------------
    // defaults and manuals for location properties
    //---------------------------------------------------------------------
  tpl[LOC][_x] = {
    'v': 0,
    'e': 'x-coordinate of a location',
    'a': [_y, _z, _perspective, "coordinates"]
  }
  tpl[LOC][_y] = {
    'v': 0,
    'e': 'y-coordinate of a location',
    'a': [_z, _x, _perspective, "coordinates"]
  }
  tpl[LOC][_z] = {
    'v': 0,
    'e': 'z-coordinate of a location',
    'a': [_x, _y, _perspective, "coordinates", "3D"]
  }
  tpl[LOC][_thickness] = {
    'v': 0.5,
    'e': 'thickness of the border of an icon',
    'd': 'Applies if property "fill" has been set to "border" or "both". Is subject to perspective transformation',
    'a': [_border, _both, _icon]
  }
  tpl[LOC][_rad] = {
    'v': 1,
    'e': 'radius for values "radar", "sector" and "bubble" of property "icon"',
    'd': 'Value is subject to perspective transformation when applied in 3D',
    'a': [_radar, _sector, _bubble, _icon]
  }
  tpl[LOC][_grad] = {
    'v': [0,0,10,0,0,20,[[0,255,0,0,1.0],[1,0,255,0,1.0]]],
    'e': 'circular color gradient for bubble icon',
    'd': 'produce a circular gradient of colors. The argument is an array. The first 6 elements define the geometry; the 7th element is an array defining the stops with color information over the gradient. The geometry consists of the properties x0,y0,r0,x1,y1,r1. Here, x0 and y0 define the center of the inner point of the cricular gradient, relative with respect to the center of the icon. r0 is the inner radius. The outer point is defined by x1,y1, again relative w.r.t. the center of the icon; r1 is the outer radius of the gradient. The array that is the 7th argument contains at least two elements, being the first and last stop. A stop is an array with 5 elements: the normalised radius value of the stop (0 ... 1), and next the rgba values (rgb between 0 ... 255, a between 0 ... 1)<br><br>Notice: the gradient feature passes a compound argument at descartes level directly to html-level without checking for structural correctness. This means that all sorts of non-caught runtime exceptions may occur e.g. if the argument vector for _grad is not well-formed, perhaps leading to stopping the calling application (such as ACCEL). At some later point we should provide error checking here! Also, it has not been checked what happens if the gradient feature is passed at global level (i.e., not as a propoerty of each individual icon, but as a collection of icons. Will it be copied correctly to each individual icon? I doubr it. So be prepared for unexpected visuals or uncaught runtime exception with liberal use of _grad.',
    'a': [_bubble,_icon]
  }
  tpl[LOC][_phi1] = {
    'v': 0,
    'e': 'start angle for icon "sector". Sector ranges from phi1 to phi2',
    'a': [_frac, _sector, "pie chart"]
  }
  tpl[LOC][_phi2] = {
    'v': 0,
    'e': 'stop angle for icon "sector". Sector ranges from phi1 to phi2',
    'a': [_frac, _sector, "pie chart"]
  }
  tpl[LOC][_frac] = {
    'v': 0,
    'e': 'values to be plotted as sectors in a pie chart, that is normalized to sum up to 2 pi',
    'd': 'To specify a sector plot as an icon, sector borders can be given explicitly as angles phi1 and phi2. Sometimes it is more convenient, however, to provide values that should be normalized automatically.',
    'x': 'When giving the three values 2,2,4, the angles of the three sectors should be PI/2, PI/2, PI, respectively. If the property "frac" is given in stead of the properties "phi1" and "phi2", (in this example with the values 2,2,4, respectively), Descartes automatically calculates the corresponding phi1 and phi2-values and adjusts the sectors so that a pie chart (actually a 2pi chart :-) results.',
    'a': [_phi1, _phi2, _sector, "pie chart"]
  }
  tpl[LOC][_col_r] = {
    'v': 128,
    'e': 'red color component of border color, scaled between 0 and 255',
    'd': 'Notice: no alpha channel for border colors',
    'a': [_col_g, _col_b, _fcol_r, _tcol_r, _icon, _border]
  }
  tpl[LOC][_col_g] = {
    'v': 128,
    'e': 'green color component of border color, scaled between 0 and 255',
    'd': 'Notice: no alpha channel for border colors',
    'a': [_col_b, _col_r, _fcol_g, _tcol_g, _icon, _border]
  }
  tpl[LOC][_col_b] = {
    'v': 128,
    'e': 'blue color component of border color, scaled between 0 and 255',
    'd': 'Notice: no alpha channel for border colors',
    'a': [_col_r, _col_g, _fcol_b, _tcol_b, _icon, _border]
  }
  tpl[LOC][_icon] = {
    'v': _bubble,
    'e': 'Specify the type of icon to be rendered at this location',
    'd': '<ul><li>"none": no visual icon</li><li>"bubble": icon with circular shape</li><li>"box": icon with rectangular shape, centered at x,y location</li><li>"hBar": icon with rectangular shape, (x,y) define midpoint of left side</li><li>"vBar": icon with rectangular shape, (x,y) define midpoint of lower side</li><li>"sector": icon with wedge-shape, part of a pie chart</li><li>"radar": icon in the shape of one point in a radar plot</li><li>"triUp": icon in the shape of an isosceles triangle pointing up</li><li>"triDown": icon in the form of an isosceles triangle pointing down</li><li>"diamond": icon in the form of a symmetrical lozenge</li><li>"cross": icon in the form of a latin cross</li><li>"diagonalCross": icon in the form of a diagonal cross.</li><li>"sprite": (small) pixel map with arbitrary placement.</li></ul><br><br>All icons except cross, diagonalCross and sprite can be filled (fill:interior or fill:both).<br><br>All icons can have their borders drawn (fill:border or fill:both). Fill colors and border colors can be set independently; border thickness can be set. <br><br>Geometry of icons is governed by properties "width" and "height" (box,hBar,vBar,triUp,triDown,diamond,cross,diagonalCross); by property "rad" (bubble,sector, radar); and by by properties "phi1", "phi2", "frac" (sector). In 3D rendering, icons are rendered with their dimensions in accordance with perspective transformation; they are always depicted to be parallel to the viewing plane, however, so no foreshortening.<br><br>The default value icon is "bubble", but in case the "edges" property is set in a geometry, the default is "none".',
    'a': [_bubble, _box, _hBar, _vBar, _sector, _radar, _triUp, _triDown, _diamond, _cross, _diagonalCross, _sprite, _width, _height, _rad, _phi1, _phi2, _frac, _fill, _border, _interior, _thickness]
  }
  tpl[LOC][_spriteData]={
    'v':[[[255,0,0,255],[0,255,0,255]],[[0,255,0,255],[255,0,0,255]]],
    'e': 'specifies the sprite pixel map for icon type sprite',
    'd': 'Every pixel in the sprite is represented by 4 values: r,g,b,a; all four 0 ... 255. Pixels are arranged in a rectangular array, so spriteData[x][y][2] is the blue component of the pixels at location x,y. Notice: the renderer uses HTML operation putImagedata for this-operations. PutImageData does not do compositing. So The alpha-channel data is formally not correctly taken into account. Still it seems to work OK with ACCEL -// provided that there is only a background. For other applications, it is recommended to do the compositing in the calling application. if you need genuine alpha blending.',
    'a':[_sprite]
  }
  tpl[LOC][_width] = {
    'v': 10,
    'e': 'specifies x-dimension of icons box, hBar,vBar,diamond,triUp,triDown,cross, and diagonalCross',
    'd': 'Is subject to perspective transformation',
    'a': [_box, _hBar, _vBar, _diamond, _triUp, _triDown, _cross, _diagonalCross, _height, _icon]
  }
  tpl[LOC][_height] = {
    'v': 10,
    'e': 'specifies y-dimension of icons box, hBar,vBar,diamond,triUp,triDown,cross, and diagonalCross',
    'd': 'Is subject to perspective transformation',
    'a': [_box, _hBar, _vBar, _diamond, _triUp, _triDown, _cross, _diagonalCross, _height, _icon]
  }
  tpl[LOC][_fill] = {
    'v': _border,
    'e': 'specifies if interior and or border of icon should be rendered',
    'd': 'Values for "fill"-property are "interior","border", or "both"',
    'a': [_border, _interior, _both, _icon]
  }
  tpl[LOC][_fcol_r] = {
    'v': 128,
    'e': 'red color component of interior color ("fill color"), scaled between 0 and 255',
    'd': 'Notice: alpha channel applies for fill colors',
    'a': [_fcol_g, _fcol_b, _col_r, _tcol_r, _interior]
  }
  tpl[LOC][_fcol_g] = {
    'v': 128,
    'e': 'green color component of interior color ("fill color"), scaled between 0 and 255',
    'd': 'Notice: alpha channel applies for fill colors',
    'a': [_fcol_b, _fcol_r, _col_g, _tcol_g, _interior]
  }
  tpl[LOC][_fcol_b] = {
    'v': 128,
    'e': 'blue color component of interior color ("fill color"), scaled between 0 and 255',
    'd': 'Notice: alpha channel applies for fill colors',
    'a': [_fcol_r, _fcol_g, _col_b, _tcol_b, _interior]
  }
  tpl[LOC][_fcol_a] = {
    'v': 0.8,
    'e': 'alpha component of interior color ("fill color"), scaled between 0 and 1',
    'd': 'Fully transparent is 0; fully opaque is 1',
    'a': [_fcol_r, _fcol_g, _fcol_b, _tcol_a, _interior, "opaque", "transparent"]
  }
  tpl[LOC][_tcol_r] = {
    'v': 10,
    'e': 'red color component of text color, scaled between 0 and 255',
    'd': 'Notice: alpha channel applies for text colors',
    'a': [_tcol_g, _tcol_b, _col_r, _fcol_r, "text", _tag]
  }
  tpl[LOC][_tcol_g] = {
    'v': 10,
    'e': 'green color component of text color, scaled between 0 and 255',
    'd': 'Notice: alpha channel applies for text colors',
    'a': [_tcol_b, _tcol_r, _col_g, _fcol_g, "text", _tag]
  }
  tpl[LOC][_tcol_b] = {
    'v': 10,
    'e': 'blue color component of text color, scaled between 0 and 255',
    'd': 'Notice: alpha channel applies for text colors',
    'a': [_tcol_r, _tcol_g, _col_b, _fcol_b, "text", _tag]
  }
  tpl[LOC][_tcol_a] = {
    'v': 1.0,
    'e': 'alpha component of text color, scaled between 0 and 1',
    'd': 'Fully transparent is 0; fully opaque is 1',
    'a': [_tcol_r, _tcol_g, _tcol_b, _fcol_a, "text", _tag, "opaque", "transparent"]
  }
  tpl[LOC][_tagx] = {
    'v': 0,
    'e': 'horizontal offset of text tag',
    'd': 'Subject to perspective transformation',
    'a': [_tagy, _tag, _pointSize, "text"]
  }
  tpl[LOC][_tagy] = {
    'v': 0,
    'e': 'vertical offset of text tag',
    'd': 'Subject to perspective transformation',
    'a': [_tagx, _tag, _pointSize, "text"]
  }
  tpl[LOC][_tag] = {
    'v': '',
    'e': 'text string to be placed near the icon',
    'a': [_tagx, _tagy, _pointSize, "text"]
  }
  tpl[LOC][_pointSize] = {
    'v': 8,
    'e': 'point size of text to be placed near icons',
    'd': 'Subject to perspective transformation',
    'a': [_tag, _tagx, _tagy, "text"]
  }
  tpl[LOC][_nrLocations] = {
    'v': 30,
    'e': 'number of locations to be provided',
    'd': 'If all locations are provided explicitly, the length of the "data"-array determines the number of locations. Locations can be provided implicitly, however: we can have values for location properties to be interpolated, they can result from shifting previous value(s), and they can be given a (pseudo) random value. This means that we can have more locations that follow from the length of the "data"-array. In these cases, the value of "nrLocations" specifies how many locations there are. The actual number of locations is the maximum of the length of the "data"- array and the value of "nrLocations", if provided. <br><br>In order to specify a value for any location attribute that should be constant for all locations, the form "property:value" applies. For instance, "y:25" specifies that the y-coordinate of all locations is 25. <br><br>For any of the other forms (interpolate, shift, or random), the form "property:[mode:value,(optional other property-value pairs)]" applies. ',
    'x': '"fcol_r:[mode:"shift"]" specifies that the value of trhe red component of the interior color of icons in subsequent locations is shifted from the values provided in the "data"-array.<br><br> "thickness:[mode:"intp",low:0.1,high:0.5]" specifies that the (border) thickness of an icon increases from 0.1 to 0.5 over all provided locations - either a sequence of locations with length "nrLocations", or a sequence of locations as given by the "data"-array. ',
    'a': [_data, _mode]
  }
  tpl[LOC][_data] = {
    'v': [],
    'e': 'the data-array provides the sequence of locations',
    'd': 'Every location is given as an array of property-value pairs. Element of "data" could have different properties. Properties that are not given in the elements of the "data" array are either obtained from values, set to properties outside the "data" array, or, in case such values have not been provided, they take default values',
    'x': 'Some examples:<ul><li>locations:[y:50,data:[[x:10],[x:30]]]<br>defines two locations, namely [x:10,y:50] and [x:30,y:50]{/li><li>locations:[x:50,data:[y:0],[y:100]]]<br>defines two points, both with the same x-coordinate and two different y-coordinates</li><li>pl=descartes([[locations:[fcol_b:[mode:"intp",low:0,high:255],rad:[mode:"random",low:0,high:10],y:[mode:"shift"],x:[mode:"random",low:0,high:100],nrLocations:200,data:[[y:100*random()]]]]])<br>produces a shower of bubbles with random radii, gradually turning blue</li></ul>.',
    'a': [_nrLocations, _mode]
  }
  tpl[LOC][_skipCheck]={
    'v':false,
    'e':'When set to true, suppresses checking for non-recognised properties',
    'd':'There can be reasons why a location property should have other propertties than thos used by Descartes. Normallly, these give error messages and terminate Descartes. By setting <'+_skipCheck+'> to true, such properties are tolerated, at the risk of name clashes.'
  }
  //-------------------------------------------------------------------
  // defaults and manuals for edge properties
  //---------------------------------------------------------------------
  tpl[EDG][_b] = {
    'v': 0,
    'e': 'index in the locations-array of the starting point ("begin point") of this edge',
    'x': '"locations:[data:[x:3,y:5],[x:2,y:7]], edges:[data:[[b:0,e:1]]" specifies a line from (3,5) to (2,7).',
    'a': [_e, _bB, _eB, _line, _locations, "edge", "bezier"]
  }
  tpl[EDG][_e] = {
    'v': 0,
    'e': 'index in the locations-array of the terminating point ("end point") of this edge',
    'x': '"locations:[data:[x:3,y:5],[x:2,y:7]], edges:[data:[[b:0,e:1]]" specifies a line from (3,5) to (2,7).',
    'a': [_b, _bB, _eB, _line, _locations, "edge", "bezier"]
  }
  tpl[EDG][_bB] = {
    'v': 0,
    'e': 'index in the locations-array of the point following the starting point ("begin bezier point") of a cubic bezier curve',
    'd': 'A cubic bezier curve is defined by four points; the properties referring to these four points are b,bB,eB,e. They are all indices in the locations-array',
    'x': '"locations:[data:[x:3,y:5],[x:2,y:7],[x:10,y:6],[x:6,y:0]], edges:[shape:"bezier",data:[[b:0,bB:1,eB:2,e:3]]" specifies a bezier curve from (3,5) to (6,0), tangent to the edge (3,5)-(2,7) in the point (3,5) and tangent to the edge (6,0)-(10,6) in the point (6,0).',
    'a': [_b, _e, _eB, _bezier, _locations]
  }
  tpl[EDG][_eB] = {
    'v': 0,
    'e': 'index in the locations-array of the point prior to the end point ("end bezier point") of a cubic bezier curve',
    'd': 'A cubic bezier curve is defined by four points; the properties referring to these four points are b,bB,eB,e. They are all indices in the locations-array',
    'x': '"locations:[data:[x:3,y:5],[x:2,y:7],[x:10,y:6],[x:6,y:0]], edges:[shape:"bezier",data:[[b:0,bB:1,eB:2,e:3]]" specifies a bezier curve from (3,5) to (6,0), tangent to the edge (3,5)-(2,7) in the point (3,5) and tangent to the edge (6,0)-(10,6) in the point (6,0).',
    'a': [_b, _e, _eB, _bezier, _locations]
  }
  //to ensure perspective transformation of arrow head dimensions, the
  // height and width properties of the
  // corresponding locations are used to determine
  // the size of the arrow heads.
  tpl[EDG][_arrows] = {
    'v': _none,
    'e': 'to specify if lines and bezier curves have arrows at their end points',
    'd': 'The property "arrows" can have values "none", "begin", "end", or "both", determining at which end(s) (if any) arrows should be drawn. The dimensions of the arrow heads are taken from the "height" and "width" properties of the respective locations. For this reason, "width" and "height" do not occur as properties of edges. In this respects, arrow heads behave like icons. <br><br>The rendering style (interior,border,none or both) and the coloring ((border)-colors and fill colors), however, are controlled via properties of the edge. Since the height and width properties are subject to perspective transformation of the locations, so are the arrow heads. Also, similar as with icons, arrowheads are not subject to foreshortening; they appear always to be parallel to the viewing plane, but they orient themselves in accordance with the direction of the line, or the tangents in the extreme of the bezier they belong to, respectively.',
    'a': [_width, _height, _locations, _col_r, _col_g, _col_b, _fcol_r, _fcol_g, _fcol_b, _fill, _border, _interior, _both, "arrow"]
  }
  tpl[EDG][_fill] = {
    'v': _border,
    'e': 'specifies if interior and or border of optional arrow head should be rendered',
    'd': 'Values for "fill"-property are "interior","border" (=default), "both" or "none"',
    'a': [_border, _interior, _both, _none]
  }
  tpl[EDG][_shape] = {
    'v': _line,
    'e': 'define whether an edge is a (straight) line or a (cubic) bezier curve or no shape at all',
    'd': 'For a line, the properties "b" and "e" need to be given, signifying the (indices of the) begin and end points (in the locations_array; for a bezier curve two further indices need to be provided, to be called "bB" and "eB". With value "none", nothing is drawn.',
    'a': [_b, _e, _bB, _eB, _line, _bezier, _locations]
  }
  tpl[EDG][_thickness] = {
    'v': 0.5,
    'e': 'the line thickness of the line or bezier',
    'd': 'The thickness is constant throughout the line or bezier curve. That means that perspective transformation, unlike the case of the border thickness of icons for locations, is not supported for the thickness property in edges. Indeed, suppose that a line spans a considerable depth range: the line should be thicker near the viewer - but this is effect not  supported in Descartes.',
    'a': []
  }
  tpl[EDG][_col_r] = {
    'v': 128,
    'e': 'red color component of edge color and optional arrow head border, scaled between 0 and 255',
    'd': 'Notice: no alpha channel for border colors',
    'a': [_col_g, _col_b, _fcol_r, _tcol_r, _border]
  }
  tpl[EDG][_col_g] = {
    'v': 128,
    'e': 'green color component of edge color and optional arrow head border, scaled between 0 and 255',
    'd': 'Notice: no alpha channel for border colors',
    'a': [_col_b, _col_r, _fcol_g, _tcol_g, _border]
  }
  tpl[EDG][_col_b] = {
    'v': 128,
    'e': 'blue color component of edge color and optional arrow head border, scaled between 0 and 255',
    'd': 'Notice: no alpha channel for border colors',
    'a': [_col_r, _col_g, _fcol_b, _tcol_b, _border]
  }
  tpl[EDG][_fcol_r] = {
    'v': 128,
    'e': 'red color component of interior color ("fill color")',
    'd': 'Used when optional arrow head needs to be filled; scaled between 0 and 255. Notice: alpha channel applies for fill colors',
    'a': [_fcol_g, _fcol_b, _col_r, _tcol_r, _interior]
  }
  tpl[EDG][_fcol_g] = {
    'v': 128,
    'e': 'green color component of interior color ("fill color")',
    'd': 'Used when optional arrow head needs to be filled; scaled between 0 and 255. Notice: alpha channel applies for fill colors',
    'a': [_fcol_b, _fcol_r, _col_g, _tcol_g, _interior]
  }
  tpl[EDG][_fcol_b] = {
    'v': 128,
    'e': 'blue color component of interior color ("fill color")',
    'd': 'Used when optional arrow head needs to be filled; scaled between 0 and 255. Notice: alpha channel applies for fill colors',
    'a': [_fcol_r, _fcol_g, _col_b, _tcol_b, _interior]
  }
  tpl[EDG][_fcol_a] = {
    'v': 0.8,
    'e': 'alpha component of interior color ("fill color")',
    'd': 'Used when optional arrow head has to be filled. Fully transparent is 0; scaled between 0 and 1; fully opaque is 1',
    'a': [_fcol_r, _fcol_g, _fcol_b, _tcol_a, _interior, "opaque", "transparent"]
  }
  tpl[EDG][_tcol_r] = {
    'v': 0,
    'e': 'red color component of text color, scaled between 0 and 255',
    'd': 'Notice: alpha channel applies for text colors',
    'a': [_tcol_g, _tcol_b, _col_r, _fcol_r, "text"]
  }
  tpl[EDG][_tcol_g] = {
    'v': 0,
    'e': 'green color component of text color, scaled between 0 and 255',
    'd': 'Notice: alpha channel applies for text colors',
    'a': [_tcol_b, _tcol_r, _col_g, _fcol_g, "text"]
  }
  tpl[EDG][_tcol_b] = {
    'v': 0,
    'e': 'blue color component of text color, scaled between 0 and 255',
    'd': 'Notice: alpha channel applies for text colors',
    'a': [_tcol_r, _tcol_g, _col_b, _fcol_b, "text"]
  }
  tpl[EDG][_tcol_a] = {
    'v': 1.0,
    'e': 'alpha component of text color, scaled between 0 and 1',
    'd': 'Fully transparent is 0; fully opaque is 1',
    'a': [_tcol_r, _tcol_g, _tcol_b, _fcol_a, "text", "opaque", "transparent"]
  }
  tpl[EDG][_tagx] = {
    'v': 0,
    'e': 'horizontal offset of text tag',
    'd': 'Not subject to perspective transformation',
    'a': [_tagy, _tag, _pointSize, "text"]
  }
  tpl[EDG][_tagy] = {
    'v': 0,
    'e': 'vertical offset of text tag',
    'd': 'Not subject to perspective transformation',
    'a': [_tagx, _tag, _pointSize]
  }
  tpl[EDG][_tag] = {
    'v': '',
    'e': 'text string to be placed near the edge',
    'a': [_tagx, _tagy, _pointSize, "text"]
  }
  tpl[EDG][_pointSize] = {
    'v': 8,
    'e': 'point size of text to be placed near icons',
    'd': 'Not subject to perspective transformation',
    'a': [_tag, _tagx, _tagy, "text"]
  }
  tpl[EDG][_data] = {
    'v': [],
    'e': 'the data-array provides the sequence of edges',
    'd': 'Every edge is given as an array of property-value pairs. Element of "data" could have different properties. Properties that are not given in the elements of the "data" array are either obtained from values, set to properties outside the "data" array, or, in case such values have not been provided, they take default values. In case the "data"-property is absent, it is assumed that all pairs of subsequent locations need to be connected by an edge',
    'x': 'Some examples:<ul><li>edges:[b:0,data:[[e:1],[e:2]]]<br>defines two edges, one from location 0 to location 1, and one from location 0 to location 2</li><li>edges:[col_r:[mode:"intp",low:0,high:255],thickness:[mode:"random",low:0,high:5]]<br>defines a number of edges, enough to connect all subsequent pairs of locations, where the red component of the color of the edges increas from 0 to 255 and the thicknesses are random</li></ul>.',
    'a': [_nrLocations, _mode]
  }
  tpl[EDG][_skipCheck]={
    'v':false,
    'e':'When set to true, suppresses checking for non-recognised properties',
    'd':'There can be reasons why a location property should have other propertties than thos used by Descartes. Normallly, these give error messages and terminate Descartes. By setting <'+_skipCheck+'> to true, such properties are tolerated, at the risk of name clashes.'
  }
  //-------------------------------------------------------------------
  // defaults and manuals for face properties
  //---------------------------------------------------------------------
  tpl[FCE][_thickness] = {
    'v': 0.5,
    'e': 'the line thickness of optional lines, bordering the faces',
    'd': 'The thickness is constant throughout the line or bezier curve. That means that perspective transformation, unlike the case of the border thickness of icons for locations, is not supported for the thickness property in face borders. Indeed, suppose that a face spans a considerable depth range: the border should be thicker near the viewer - but this is effect not  supported in Descartes.',
    'a': []
  }
  tpl[FCE][_col_r] = {
    'v': 128,
    'e': 'red color component of face border color, scaled between 0 and 255',
    'd': 'Notice: no alpha channel for border colors',
    'a': [_col_g, _col_b, _fcol_r, _scol_r, _border]
  }
  tpl[FCE][_col_g] = {
    'v': 128,
    'e': 'green color component of face border color, scaled between 0 and 255',
    'd': 'Notice: no alpha channel for border colors',
    'a': [_col_b, _col_r, _fcol_g, _scol_g, _border]
  }
  tpl[FCE][_col_b] = {
    'v': 128,
    'e': 'blue color component of face border color, scaled between 0 and 255',
    'd': 'Notice: no alpha channel for border colors',
    'a': [_col_r, _col_g, _fcol_b, _scol_b, _border]
  }
  tpl[FCE][_fcol_r] = {
    'v': 128,
    'e': 'red color component of interior face color ("fill color")',
    'd': 'determines the apparent color due to diffuse reflection, taking the color(s) of the light sources(s) into account',
    'a': [_fcol_g, _fcol_b, _scol_r, _interior]
  }
  tpl[FCE][_fcol_g] = {
    'v': 128,
    'e': 'green color component of interior color ("fill color")',
    'd': 'determines the apparent color due to diffuse reflection, taking the color(s) of the light sources(s) into account',
    'a': [_fcol_b, _fcol_r, _scol_g, _interior]
  }
  tpl[FCE][_fcol_b] = {
    'v': 128,
    'e': 'blue color component of interior color ("fill color")',
    'd': 'determines the apparent color due to diffuse reflection, taking the color(s) of the light sources(s) into account',
    'a': [_fcol_r, _fcol_g, _scol_b, _interior]
  }
  tpl[FCE][_fcol_a] = {
    'v': 0.8,
    'e': 'alpha component of interior color ("fill color")',
    'd': 'used to simulate transparent surfaces. Notice that no refraction, scattering or caustics are simulated',
    'a': [_fcol_r, _fcol_g, _fcol_b, _interior, "opaque", "transparent"]
  }
  tpl[FCE][_scol_r] = {
    'v': 128,
    'e': 'red color component of specularly reflected interior face color ("specular color")',
    'd': 'determines the apparent color due to specular reflection, taking the color(s) of the light sources(s) into account',
    'a': [_scol_g, _scol_b, _col_r, _fcol_r, _beta, "specularity", _interior]
  }
  tpl[FCE][_scol_g] = {
    'v': 128,
    'e': 'green color component of specularly reflected interior face color ("specular color")',
    'd': 'determines the apparent color due to specular reflection, taking the color(s) of the light sources(s) into account',
    'a': [_scol_b, _scol_r, _col_g, _fcol_g, _beta, "specularity", _interior]
  }
  tpl[FCE][_scol_b] = {
    'v': 128,
    'e': 'blue color component of specularly reflected interior face color ("specular color")',
    'd': 'determines the apparent color due to specular reflection, taking the color(s) of the light sources(s) into account',
    'a': [_scol_r, _scol_g, _col_b, _fcol_b, _beta, "specularity", _interior]
  }
  tpl[FCE][_beta] = {
    'v': 0,
    'e': 'determines the specularity of the surface',
    'd': 'large values of beta give reflection distributions reminiscent of flossy surfaces, whereas low values approximate the illumination of dull or matte surfaces. The ratio between the diffuse face color components (fcol_r,gcol_r,bcol_r) and the specular face color components (scol_r,scol_g,scol_b) also determines this visual distinction',
    'a': [_fcol_r, _fcol_g, _fcol_b, _scol_r, _scol_g, _scol_b, "specularity"]
  }
  tpl[FCE][_fill] = {
    'v': _interior,
    'e': 'specify if the face should be solidly (opaque or transparent) filled or rendered as a borderline or both',
    'd': 'values are "interior" (=default), "border", "both" or "none"',
    'a': [_border, _interior, _both, _none]
  }
  tpl[FCE][_loop] = {
    'v': [0, 0, 0],
    'e': 'an array with indices in "locations", forming the corners of this face',
    'd': 'A face loop should contain at least three location-indices'
  }
  tpl[FCE][_data] = {
    'v': [],
    'e': 'the data-array provides the sequence of faces',
    'd': 'Every face is given as an array of property-value pairs. Element of "data" could have different properties. Properties that are not given in the elements of the "data" array are obtained from values, set to properties outside the "data" array, or, in case such values have not been provided, they take default values',
    'x': '"faces:[data:[[loop:[0,1,2]],[loop:[1,2,3]]]]" defines two triangular faces, one with locations 0,1,2 as corners, and one with locations 1,2,3 as corners.',
    'a': [_nrLocations, _mode]
  }
  tpl[LOC][_skipCheck]={
    'v':false,
    'e':'When set to true, suppresses checking for non-recognised properties',
    'd':'There can be reasons why a location property should have other propertties than thos used by Descartes. Normallly, these give error messages and terminate Descartes. By setting <'+_skipCheck+'> to true, such properties are tolerated, at the risk of name clashes.'
  }
  //-------------------------------------------------------------------
  // defaults and manuals for contour properties
  //---------------------------------------------------------------------
  tpl[CTR][_col_r] = {
    'v': 128,
    'e': 'red component of the color of contour lines',
    'a': [_contour, _col_g, _col_b]
  }
  tpl[CTR][_col_g] = {
    'v': 128,
    'e': 'geen component of the color of contour lines',
    'a': [_contour, _col_b, _col_r]
  }
  tpl[CTR][_col_b] = {
    'v': 128,
    'e': 'blue component of the color of contour lines',
    'a': [_contour, _col_r, _col_g]
  }
  tpl[CTR][_thickness] = {
    'v': 2,
    'e': 'thickness of contour lines'
  }
  tpl[CTR][_iso] = {
    'v': 0,
    'e': 'iso-value for a contour line'
  }
  tpl[CTR][_map] = {
    'e': 'a 2-D array (=array of arrays) where the values are to be represented as contour lines',
    'x': '"pl=descartes([[contour:[thickness:1,map:#(i,vSeq(0,20),#(j,vSeq(0,20),random(),vAppend),vAppend),data:#(i,vSeq(0,10),[iso:0.1*i],vAppend)]]])" <br><br>draws a contour plot of a map of random values'
  }
  tpl[CTR][_data] = {
    'e': 'every element from the "data"-array defines a single contour curve',
    'd': 'A contour plot can be confusing to interpet if contour curves are densely packed together. There it may be adviseable to give contour curves with subsequent iso-values a range of colors or a range of thickness values. This can be done using the standard "mode"-construction. Also, values for properties can be individually set so that each contour curve can be indiviually formatted',
    'x': 'pl=descartes([[contour:[map:#(i,vSeq(0,20),#(j,vSeq(0,20),random(),vAppend),vAppend),data:[[iso:0.25,col_r:255],[iso:0.75,col_r:0]]]]])'
  }
  tpl[CTR][_nrContours]={
    'e':'Set the number of iso-values for which a contour should be drawn',
  'd':'In case the iso values are given by means of a data-array, thenumber of contours to calculate follows from the number of entries in the data-array. In simple cases, such as a single iso value, or iso-values tat can be obtained by linear interpolation, it is not necessary to provide a data-array, similarly as in the case of locations, edges or faces. In that case we can still control the number of contours by assigning a value to this property.',
  'v':5
  }
  //-------------------------------------------------------------------
  // defaults and manuals for image properties
  //---------------------------------------------------------------------
  tpl[IMG][_scaleX] = {
    'v': 1,
    'e': 'the horizontal scale factor, applied when mapping images onto the canvas',
    'd': 'every element of the map-arrays corresponds to a cluster of scaleX x scaleY visual pixels.',
    'a': [_mapR, _mapG, _mapB, "pixels"]
  }
  tpl[IMG][_scaleY] = {
    'v': 1,
    'e': 'the vertical scale factor, applied when mapping images onto the canvas',
    'd': 'every element of the map-arrays corresponds to a cluster of scaleX x scaleY visual pixels.',
    'a': [_mapR, _mapG, _mapB, "pixels"]
  }
  tpl[IMG][_mapR] = {
    'v': 128,
    'e': 'values for the red components of the pixel colors in the image',
    'd': 'Typically, the value of the property will be a 2D array containing numbers scaled between 0 and 255.',
    'x': 'r=slider(128,0,255) <br>g=slider(128,0,255) <br>b=slider(128,0,255) <br>pl=descartes([[image:[scaleX:50,scaleY:50,mapR:r,mapG:g,mapB:b]]])<br><br>implements a simple color picker. Notice that we do not provide actual pixel data, since r, g and b are not 2D arrays. In that case, Descartes will take the (atomic) values of the properties "mapR", "mapG", "mapB" as substitutes.',
    'a': ["pixels"]
  }
  tpl[IMG][_mapG] = {
    'v': 128,
    'e': 'values for the green components of the pixel colors in the image',
    'd': 'Typically, the value of the property will be a 2D array containing numbers scaled between 0 and 255.',
    'x': 'r=slider(128,0,255) <br>g=slider(128,0,255) <br>b=slider(128,0,255) <br>pl=descartes([[image:[scaleX:50,scaleY:50,mapR:r,mapG:g,mapB:b]]])<br><br>implements a simple color picker. Notice that we do not provide actual pixel data, since r, g and b are not 2D arrays. In that case, Descartes will take the (atomic) values of the properties "mapR", "mapG", "mapB" as substitutes.',
    'a': ["pixels"]
  }
  tpl[IMG][_mapB] = {
    'v': 128,
    'e': 'values for the blue components of the pixel colors in the image',
    'd': 'Typically, the value of the property will be a 2D array containing numbers scaled between 0 and 255.',
    'x': 'r=slider(128,0,255) <br>g=slider(128,0,255) <br>b=slider(128,0,255) <br>pl=descartes([[image:[scaleX:50,scaleY:50,mapR:r,mapG:g,mapB:b]]])<br><br>implements a simple color picker. Notice that we do not provide actual pixel data, since r, g and b are not 2D arrays. In that case, Descartes will take the (atomic) values of the properties "mapR", "mapG", "mapB" as substitutes.',
    'a': ["pixels"]
  }
  tpl[IMG][_mapA] = {
    'v': 128,
    'e': 'values for the opaqueness components of the pixel colors in the image',
    'd': 'Typically, the value of the property will be a 2D array containing numbers scaled between 0 and 255. Notice that this is unlike the transparency values provided by properties "fcol_a" or "tcol_a".',
    'a': ["pixels", _fcol_a, _tcol_a, "opaque", "transparent"]
  }
  //-------------------------------------------------------------------
  // defaults and manuals for generic properties
  //---------------------------------------------------------------------
  tpl[GEN][_geometry] = {
    'e': 'the default graph type, consisting of locations, edges and/or faces',
    'd': 'The name of the property, "geometry" is typically left out. The two following forms therefore have the same effect:<br><br>pl=descartes([[locations:locValues,edges:edgeValues,faces:faceValues]])<br>and<br>pl=descartes([[geometry:[locations:locValues,edges:edgeValues,faces:faceValues]]]).<br><br>The property "locations" is the only property that provides coordinate data; "locations" therefore has to be present. Both "edges" and "faces" are optional. In case there is only location information, the resulting image can consist of icons. Indeed, an icon such as a box, a cross or the sector of a pie chart is a visual representation of a location.<br><br>If the "icon" property is set to the value "none", no visual renditions of the locations proper are given. In such cases, locations are still necessary, since they serve as end points of edges (lines or bezier curves), or corner points of faces. To this end, edges contain properties "b" and "e", with values that are numbers. These numbers are indices in the array containing the location-information. The first location has number 0, the second one has number 1, and so on. Similarly, a face should have a "loop" property which is an array of arbitrary many of such indices (at least 3 for a closed face).<br><br>Geometries can be both 2 dimensional and 3 dimensional. The difference is made by the presence of a z-coordinate, that is a value for the "z"-property in a location. In order to see the true 3-dimensionality of a geometry, however, we need perspective viewing. In the examples below, the same geometry is depicted in the absense of a perspective camera, and with a (perspective) camera. <br><br>If a perspective camera adopts an other viewing location and/or another viewing direction, these will certainly have geometric effects (perspective distortions change). It may also have an effect on the perceived colors, in the case there is lighting. We can one or more light sources to a geometry to simulate this effect as well. The simples case of simulated illumination is also demonstrated in the examples below.',
    'x': 'First a simple geometry, consisting of two locations, three edges and one face. The locations are provided with icons in the form of filled circles ("bubbles" - which is the default, and therefore omitted).<br><br>locValues=[rad:10,fcol_r:200,data:[[x:10,y:10],[x:70,y:10],[x:40,y:80]]]<br>edgeValues=[thickness:5,col_g:200,data:[[b:0,e:1],[b:1,e:2],[b:2,e:0]]]<br>faceValues=[fcol_b:255,data:[loop:[0,1,2]]]<br>pl=descartes([[locations:locValues,edges:edgeValues,faces:faceValues]])<br><br>Next the same geometry, but now equipped with a camera. We choose a simple automatic camera, that is a camera that can be manipulated by moving with the mouse in the canvas. Notice that we provided no values for the "z"-properties; these are given by default values. Also notice that the color does not change when the camera moves: there are no light sources yet.<br><br>locValues=[rad:10,fcol_r:200,data:[[x:10,y:10],[x:70,y:10],[x:40,y:80]]]<br>edgeValues=[thickness:5,col_g:200,data:[[b:0,e:1],[b:1,e:2],[b:2,e:0]]]<br>faceValues=[fcol_b:255,data:[loop:[0,1,2]]]<br>cameraValues=[auto:true]<br>pl=descartes([[camera:cameraValues,locations:locValues,edges:edgeValues,faces:faceValues]])<br><br>In the third example we add the simples of all light configurations: a single light source, where no properties at all are given (indeed, [[]] means: an array containing one element which has no properties). All light properties are therefore provided for as defaults. By moving around the camera, however, we can see that indeed the brightness of the surface is affected. Also notce that edges and icons (representing locations) are not subject to illumination conditions: they are thought of not to exist in the physical space governed by light.<br><br>locValues=[rad:10,fcol_r:200,data:[[x:10,y:10],[x:70,y:10],[x:40,y:80]]]<br>edgeValues=[thickness:5,col_g:200,data:[[b:0,e:1],[b:1,e:2],[b:2,e:0]]]<br>faceValues=[fcol_b:255,beta:20,data:[loop:[0,1,2]]]<br>cameraValues=[auto:true]<br>lightValues=[[]]<br>pl=descartes([[camera:cameraValues,lights:lightValues,locations:locValues,edges:edgeValues,faces:faceValues]])<br><br>Next we extend the geometry with a further property, e.i. a grid. Descartes supports many properties of grids; a simple grid is just a set of horizontal and vertical lines, forming a tartan subdivision of the drawing plane.<br><br>locValues=[rad:10,fcol_r:200,data:[[x:10,y:10],[x:70,y:10],[x:40,y:80]]]<br>edgeValues=[thickness:5,col_g:200,data:[[b:0,e:1],[b:1,e:2],[b:2,e:0]]]<br>faceValues=[fcol_b:255,beta:20,data:[loop:[0,1,2]]]<br>cameraValues=[auto:true]<br>lightValues=[[]]<br>gridValues=[grMajX:"line",grMinX:"tick",grMajY:"line",grMinY:"tick"]<br>pl=descartes([[grid:gridValues,camera:cameraValues,lights:lightValues,locations:locValues,edges:edgeValues,faces:faceValues]]).<br><br>One final property that we may want to add is the property "background", e.g. as in  <br><br>locValues=[rad:10,fcol_r:200,data:[[x:10,y:10],[x:70,y:10],[x:40,y:80]]]<br>edgeValues=[thickness:5,col_g:200,data:[[b:0,e:1],[b:1,e:2],[b:2,e:0]]]<br>faceValues=[fcol_b:255,beta:20,data:[loop:[0,1,2]]]<br>cameraValues=[auto:true]<br>lightValues=[[]]<br>gridValues=[grMajX:"line",grMinX:"tick",grMajY:"line",grMinY:"tick"]<br>backgroundValues=[fcol_r:255]<br>pl=descartes([[background:backgroundValues,grid:gridValues,camera:cameraValues,lights:lightValues,locations:locValues,edges:edgeValues,faces:faceValues]]).<br><br>',
    'a': [_locations, _edges, _faces, _camera, _lights, _grid, _background]
  }
  tpl[GEN][_image] = {
    'e': 'a graph consisting of a rectangular array of pixels',
    'd': 'We distinguish logical pixels and screen pixels. The logical pixels are provided in the form of 2D arrays as values for the properties "mapR", "mapG", "mapB", and "mapA". In case one or more maps are omitted, defauls are provided; also, if numbers instead of 2D arrays are provided, the entire map is assumed to be filled with that number. The mapping from logical pixesl to screen pixels is given by the values of the properties "scaleX" and "scaleY".',
    'x': 'In the following script, the four maps "mapR", "mapG", "MapB", and "mapA" each consist of 2 x 2 logical pixels. These pixels are mapped to 20 X 20 screen pixels in virtue of the values of properties "scaleX" and "scaleY"<br><br>v0=slider(100,0,255)<br>v1=slider(100,0,255)<br>v2=slider(100,0,255)<br>v3=slider(100,0,255)<br>pl=descartes([[image:[scaleX:20,scaleY:20,mapR:[[v0,v1],[v2,v3]],mapG:[[v1,v2],[v3,v0]],mapB:[[v2,v3],[v0,v1]],mapA:[[v3,v0],[v1,v2]]]]])',
    'a': [_mapR, _mapG, _mapB, _mapA, _scaleX, _scaleY]
  }
  tpl[GEN][_contour] = {
    'e': 'draw (a set of) contour curve(s) for a given 2D distribution of values',
    'd': 'The 2D distribution of values is given in a 2D array, the value of the property "map". In order to specify the properties of each of the contour curves, we can provide a value for the property "data". The value of "data" is an array; every element represents one contour curve with properties "thickness", "iso"(=the iso-value of the data in the map that this contour curve should connect), and the colors "col_r",  "col_g", and "col_b". In stead of defining every contour as an element from "data", some of these properties may also be left unspecified, or provided by means of the common schemes for interpolation or random value assignment (see the explanation of the "mode"-mechanism).',
    'x': 'pl=descartes([[contour:[map:#(i,vSeq(0,60),#(j,vSeq(0,60),random(),vAppend),vAppend),data:[[iso:0.25,col_r:255],[iso:0.75,col_r:0]]]]])<br><br> gives the contour plot of a random distribution of values, where one set of contour curves is plotted in red at an iso-value of 0.25, and a second set of contour curves is plotted in green at an iso value of 0.75.',
    'a': [_map, _data, _iso, _mode]
  }
  tpl[GEN][_mode] = {
    'e': 'mechanism to provide values for numerical properties',
    'd': 'All properties of elements of a concept of the property "geometry" (i.e., locations, edges and faces), and all properties of elements of the concept "contour" (i.e., contour curves) can be given by means of "data"-arrays. Howver, there are many cases where some or all of these properties have a simple behavior, and where it would be redundant to individually specify the value for a particular property for each and every element. For example, for a set of locations on a straight line, the x- and y-coordinates follow from linear interpolation. And if these points were on a straight horizontal line, the y-values would even be constant. In such cases, we can simply omit such properties from the elements in the "data"-array, by defining them separately. Below we give an example. This is simple for values that should stay constant (the y-coordinate of locations on a horizontal line). For four other cases, we provide a simple mechanism. These are the cases "intp"(=interpolation between two given values), "shift"(=replication from the previous rendition, where the values of properties are propagated to one next element), and "random".<br><br>The operator "shift" can be used to simply achieve the effect of plotting a graph on an oscilloscope screen or on a moving strip of paper like in an earthquake detector.',
    'x': 'The following three expressions both define the same sets of points:<br><br>[data:[[x:10,y:15,z:47],[x:20,y:15,z:29],[x:30,y:15,z:11]]]<br>[y:15,data:[[x:10,z:47],[x:20,z:29],[x:30,z:11]]<br>[y:15,x:[mode:"intp",low:10,high:30],data:[[z:47],[z:29],[z:11]]]<br><br>Notice that in the latter case we must not write [y:15,x:[mode:"intp",low:10,high:30],data:[47,29,11]],<br>since [z:47] is a concept with a single property with name "z" and value 47, whereas 47 is just an atomic value.<br><br>Below we give an illustration of the "shift" device:<br><br>pl=descartes([[locations:[x:[mode:"intp"],y:[mode:"shift"],data:[[y:100*random()]]]]]) <br><br>where a collection of locations at ranomd heights is constructed that seems to move from left to right.',
    'a': [_intp, _shift, _random]
  }
  tpl[GEN][_intp] = {
    'e': 'One of the values for the "mode" property',
    'd': 'This instructs a value to be interpolated between a low and a high value, both of which are optional',
    'x': 'To interpolate a property, say the x-coordinate of a series of locations, over the width of the canvas, it suffices to write<br><br>x:[mode:"intp"],<br><br>as the default values for "low" and "high" correspond to the left and right borders of the canvas. For a color property, however, one would have to write <br><br>col_r:[mode:"�ntp",low:0,high:255]<br><br>and for the opacity property e.g. in coloring the interior of an icon, <br><br>fcol_a:[mode:"intp",low:0,high:1]',
    'a': [_mode, _data, _shift, _random]
  }
  tpl[GEN][_shift] = {
    'e': 'One of the values for the "mode" property',
    'd': 'As the shift operator causes values to be copied from one element to the next in every next rendering, values need not to be numeric',
    'x': 'A simple application is the following (it works best with strings consisting of one or few characters only):<br><br>txt=input("iets")<br>pl=descartes([[locations:[nrLocations:10,x:[mode:"intp"],y:50,tag:[mode:"shift"],data:[[tag:txt]]]]])',
    'a': [_mode, _data, _intp, _random]
  }
  tpl[GEN][_value] = {
    'e': 'Set a value for a property',
    'd': 'Typically used in conjunction with the shift operator. This is the value to be set for location nr. 0',
    'x':'Consider the use of "value" in the following two examples:<br><br>pl=descartes([[locations:[nrLocations:100,x:[mode:"shift",value:cx],y:[mode:"shift",value:cy]]]])<br><br>Here, the use of "value" makes the use of a data-array unnecessary, as in the following version: <br><br>pl=descartes([[locations:[nrLocations:100,x:[mode:"shift"],y:[mode:"shift"],data:[[x:cx,y:cy]]]]])',
    'a': [_mode, _shift]
  }
  tpl[GEN][_random] = {
    'e': 'One of the values for the "mode" property',
    'd': 'For some applications, it is not crucial which values visual properties have, as long as they are different. For these cases, the random-mode has been provided. It uses a set of pseudo-random values that are re-generated every time descartes is re-initialised, but two subsequent randitions will use the same set of values to avoid too erratic visuals.<br><br>The lower and higher values of the random interval are, by default, set to 0 and 100; similar as with "intp", they can be overriden by providing values for the properties "low" and/or "high".',
    'x': 'En example is where we want contour curves, that otherwise may be difficult to distinguish if they run closely together, all can be given different colors. The following script is an example:<br><br>pl=descartes([[contour:[thickness:2,map:#(i,vSeq(0,40),#(j,vSeq(0,40),random(),vAppend),vAppend),col_r:[mode:"random",low:0,high:255],data:#(i,vSeq(0,10),[iso:i/10],vAppend)]]])',
    'a': [_mode, _data, _shift, _intp, _random]
  }
  tpl[GEN][_data] = {
    'e': 'For any graphic, "data" is the array containing the elements, expressed as vectors of properties with values',
    'd': 'Each of the concepts "locations", "edges", "faces" of the graphic concept "geometry", as well as the individual contours in a contour plot are aggregated in an array, called "data", which occurs as a property of. respectively, "locations", "edges", "faces" and "contour". Elements in the data array can be completely specified, i.e., all properties with their values occur in every element of the array. It is also allowed to provide for some or all of the properties values beforehand, either using the form "property:value" or by using the form "property:[mode:MODE, (...other properties...)]", where MODE is either "intp", "shift", or "random" for "locations", or "intp" or "random" for "contours". The mode-construction is not supported for "edges" and "faces".',
    'x':'In some cases, the data property can be omitted. The following two give identical behavior:<br><br>The simplest form is<br><br>pl=descartes([[locations:[nrLocations:100,x:[mode:"shift",value:cx],y:[mode:"shift",value:cy]]]])<br><br>The alternative form would bepl=descartes([[locations:[nrLocations:100,x:[mode:"shift"],y:[mode:"shift"],data:[[x:cx,y:cy]]]]])',
    'a': [_mode, _shift, _intp, _random]
  }
  tpl[GEN][_low] = {
    'e': 'lower bound for a value that is specified by linear interpolation',
    'd': 'For any numeric property, its value can be obtained by interpolation. Values of "low" and "high" are the optional limits of the linear interpolation.',
    'a': [_mode, _intp, _high]
  }
  tpl[GEN][_high] = {
    'e': 'upper bound for a value that is specified by linear interpolation',
    'd': 'For any numeric property, its value can be obtained by interpolation. Values of "low" and "high" are the optional limits of the linear interpolation.',

    'a': [_mode, _intp, _low]
  }
  tpl[GEN][_skipCheck]={
    'e':'when true, skip checking for non-recognized properties',
    'd':'To facilitate debugging a Descartes script, the Descartes parser normally warns for non-recognized properties in locations, edges of faces. There can be good resons, though, to have other properties in locations, edges or faces than only those needed by Descartes. To suppress checking for valid properties, set skipChekc to true.',
    'v':false
  }
  //-------------------------------------------------------------------
  // defaults and manuals for camera properties
  //---------------------------------------------------------------------
  tpl[CAM][_perspective] = {
    'v': true
  }
  tpl[CAM][_eX] = {
    'v': vpX2,
    'e': 'x-coordinate of camera viewpoint',
    'd': 'Overwritten if roll, pitch and/or yaw are set, or "auto" is true, when "look" property is set to "orbit" (=default). Indeed, in orbit-mode, with camera control given by camera angles, the eye point is required to adapt to the gaze point and the looking direction.',
    'a': [_eZ, _eY, _look, _auto, _roll, _pitch, _yaw]
  }
  tpl[CAM][_eY] = {
    'v': vpY2,
    'e': 'y-coordinate of camera viewpoint',
    'd': 'Overwritten if roll, pitch and/or yaw are set, or "auto" is true, when "look" property is set to "orbit" (=default). Indeed, in orbit-mode, with camera control given by camera angles, the eye point is required to adapt to the gaze point and the looking direction.',
    'a': [_eY, _eX, _look, _auto, _roll, _pitch, _yaw]
  }
  tpl[CAM][_eZ] = {
    'v': -vpM,
    'e': 'z-coordinate of camera viewpoint',
    'd': 'z-axis points inwards to the screen. To have a wider overview, the eye point should move in negative z-direction. Eye location is overwritten if roll, pitch and/or yaw are set, or "auto" is true, when "look" property is set to "orbit" (=default). Indeed, in orbit-mode, with camera control given by camera angles, the eye point is required to adapt to the gaze point and the looking direction.',
    'a': [_eX, _eY, _look, _auto, _roll, _pitch, _yaw]
  }
  tpl[CAM][_hX] = {
    'v': 1,
    'e': 'x-coordinate of horizontal direction',
    'd': 'Overwritten if roll, pitch and/or yaw are set, or "auto" is true. Indeed, when camera control given by camera angles, the camera orientation follows from these angles.<br><br>Under normal circumstances, the three verctors [hX,hY,hZ], [vX,vY,vZ], and [kX,kY,kZ] should form an orthonormal base. This is not enforced by Descartes, however.',
    'a': [_hY, _hZ, _look, _auto, _roll, _pitch, _yaw]
  }
  tpl[CAM][_hY] = {
    'v': 0,
    'e': 'y-coordinate of horizontal direction',
    'd': 'Overwritten if roll, pitch and/or yaw are set, or "auto" is true. Indeed, when camera control given by camera angles, the camera orientation follows from these angles.<br><br>Under normal circumstances, the three verctors [hX,hY,hZ], [vX,vY,vZ], and [kX,kY,kZ] should form an orthonormal base. This is not enforced by Descartes, however.',
    'a': [_hZ, _hX, _look, _auto, _roll, _pitch, _yaw]
  }
  tpl[CAM][_hZ] = {
    'v': 0,
    'e': 'z-coordinate of horizontal direction',
    'd': 'Overwritten if roll, pitch and/or yaw are set, or "auto" is true. Indeed, when camera control given by camera angles, the camera orientation follows from these angles.<br><br>Under normal circumstances, the three verctors [hX,hY,hZ], [vX,vY,vZ], and [kX,kY,kZ] should form an orthonormal base. This is not enforced by Descartes, however.',
    'a': [_hX, _hY, _look, _auto, _roll, _pitch, _yaw]
  }
  tpl[CAM][_vX] = {
    'v': 0,
    'e': 'x-coordinate of vertical direction',
    'd': 'Overwritten if roll, pitch and/or yaw are set, or "auto" is true. Indeed, when camera control given by camera angles, the camera orientation follows from these angles.<br><br>Under normal circumstances, the three verctors [hX,hY,hZ], [vX,vY,vZ], and [kX,kY,kZ] should form an orthonormal base. This is not enforced by Descartes, however.',
    'a': [_vY, _vZ, _look, _auto, _roll, _pitch, _yaw]
  }
  tpl[CAM][_vY] = {
    'v': 1,
    'e': 'y-coordinate of vertical direction',
    'd': 'Overwritten if roll, pitch and/or yaw are set, or "auto" is true. Indeed, when camera control given by camera angles, the camera orientation follows from these angles.<br><br>Under normal circumstances, the three verctors [hX,hY,hZ], [vX,vY,vZ], and [kX,kY,kZ] should form an orthonormal base. This is not enforced by Descartes, however.',
    'a': [_vZ, _vX, _look, _auto, _roll, _pitch, _yaw]
  }
  tpl[CAM][_vZ] = {
    'v': 0,
    'e': 'z-coordinate of vertical direction',
    'd': 'Overwritten if roll, pitch and/or yaw are set, or "auto" is true. Indeed, when camera control given by camera angles, the camera orientation follows from these angles.<br><br>Under normal circumstances, the three verctors [hX,hY,hZ], [vX,vY,vZ], and [kX,kY,kZ] should form an orthonormal base. This is not enforced by Descartes, however.',
    'a': [_vX, _vY, _look, _auto, _roll, _pitch, _yaw]
  }
  tpl[CAM][_kX] = {
    'v': 0,
    'e': 'x-coordinate of looking direction',
    'd': 'Overwritten if roll, pitch and/or yaw are set, or "auto" is true. Indeed, when camera control given by camera angles, the camera orientation follows from these angles. In standard orientation, the k-direction points inwards to the screen.<br><br>Under normal circumstances, the three verctors [hX,hY,hZ], [vX,vY,vZ], and [kX,kY,kZ] should form an orthonormal base. This is not enforced by Descartes, however.',
    'a': [_kY, _kZ, _look, _auto, _roll, _pitch, _yaw]
  }
  tpl[CAM][_kY] = {
    'v': 0,
    'e': 'y-coordinate of looking direction',
    'd': 'Overwritten if roll, pitch and/or yaw are set, or "auto" is true. Indeed, when camera control given by camera angles, the camera orientation follows from these angles. In standard orientation, the k-direction points inwards to the screen.<br><br>Under normal circumstances, the three verctors [hX,hY,hZ], [vX,vY,vZ], and [kX,kY,kZ] should form an orthonormal base. This is not enforced by Descartes, however.',
    'a': [_kZ, _kX, _look, _auto, _roll, _pitch, _yaw]
  }
  tpl[CAM][_kZ] = {
    'v': 1,
    'e': 'z-coordinate of looking direction',
    'd': 'Overwritten if roll, pitch and/or yaw are set, or "auto" is true. Indeed, when camera control given by camera angles, the camera orientation follows from these angles. In standard orientation, the k-direction points inwards to the screen.<br><br>Under normal circumstances, the three verctors [hX,hY,hZ], [vX,vY,vZ], and [kX,kY,kZ] should form an orthonormal base. This is not enforced by Descartes, however.',
    'a': [_kX, _kY, _look, _auto, _roll, _pitch, _yaw]
  }
  tpl[CAM][_gX] = {
    'v': 0,
    'e': 'x-coordinate of gaze point',
    'd': 'The gaze point has a meaning when the "look" property is set to "orbit" (=default). In that case, the eye-location is calculated from the gaze point and the yaw, pitch and roll angles such that the gaze point is in the centre of the view field. When "look" is set to "pivot", the gaze point is ignored. Also when the camera configuration is set by specifying the carthesian coordinates of the h, k, v axes, we ignore the gaze point. Also, if "auto" is set to true, the gaze point is ignored; rotation of the camera is then always with respect to a point at distance "r" right in the direction of the h-vector in front of the eye point.',
    'a': [_gY, _gZ, _look, _roll, _pitch, _yaw]
  }
  tpl[CAM][_gY] = {
    'v': 0,
    'e': 'y-coordinate of gaze point',
    'd': 'The gaze point has a meaning when the "look" property is set to "orbit" (=default). In that case, the eye-location is calculated from the gaze point and the yaw, pitch and roll angles such that the gaze point is in the centre of the view field. When "look" is set to "pivot", the gaze point is ignored. Also when the camera configuration is set by specifying the carthesian coordinates of the h, k, v axes, we ignore the gaze point. Also, if "auto" is set to true, the gaze point is ignored; rotation of the camera is then always with respect to a point at distance "r" right in the direction of the h-vector in front of the eye point.',
    'a': [_gZ, _gX, _look, _roll, _pitch, _yaw]
  }
  tpl[CAM][_gZ] = {
    'v': 0,
    'e': 'z-coordinate of gaze point',
    'd': 'The gaze point has a meaning when the "look" property is set to "orbit" (=default). In that case, the eye-location is calculated from the gaze point and the yaw, pitch and roll angles such that the gaze point is in the centre of the view field. When "look" is set to "pivot", the gaze point is ignored. Also when the camera configuration is set by specifying the carthesian coordinates of the h, k, v axes, we ignore the gaze point. Also, if "auto" is set to true, the gaze point is ignored; rotation of the camera is then always with respect to a point at distance "r" right in the direction of the h-vector in front of the eye point.',
    'a': [_gX, _gY, _look, _roll, _pitch, _yaw]
  }
  tpl[CAM][_f] = {
    'v': vpM2,
    'e': 'The focal length of the camera',
    'd': 'The ratio between the focal length and the dimensions of the view plane determine the opening angle, and therefore the (solid angle) fragment of the scene that is seen by  the camera. For an image with constant size, the focal length therefore is a scale factor. The metric dimensions of all features in the projected image are proportional to the focal length. Changing the focal length therefore does not affect any ratios between distances in the image; ite merely scales the entire image up or down',
    'a': [_r, "focal length", _perspective, "projection"]
  }
  tpl[CAM][_r] = {
    'v': vpM,
    'e': 'The distance between the projection centre of the camera and the gaze point',
    'd': 'When camera control is in oribt-mode (that is, "look" is set to "orbit"(=default), and orientation is controlled via one or more of the camera angles pitch,yaw and roll, or by means of automatic control (when "auto" is set to true), the location of the projection centre, that is: the position of the camera eye point [eX,eY,eZ]  has to be calculated from the view point and the camera orientation. To do so, we need to specify the distance between the gaze point (gX,gY,gZ] and the projection centre [eX,eY,eZ]. When rotating the camera in "orbit" mode with constant distance, the projection centre stays on the surface of a sphere centred around the gaze point with radius "r".<br><br>Unlike the focal length, varying the value of the property "r" does affect ratios of metric dimensions in the image. It can even affect which parts of the scene are visible and which are hidden (occluded) behind other parts.',
    'a': [_f, "focal length", _perspective, "camera orientation", "projection"]
  }
  tpl[CAM][_pitch] = {
    'v': 0,
    'e': 'The camera angle corresponding to nodding "yes"',
    'd': 'When set, it overwrites the carthesian coordinates of the camera orientation, that is the coordinates of the h, k and/or v-vectors in either "orbit" or "pivot" mode. When "auto" is set to true, the camera is rotated according to the "virtual trackball"- principle, ignoring the pitch, yaw and roll settings.',
    'a': [_yaw, _roll, _look, "orbit", "pivot", "camera orientation"]
  }
  tpl[CAM][_roll] = {
    'v': 0,
    'e': 'The camera angle corresponding to clockwise or counterclockwise rotations',
    'd': 'When set, it overwrites the carthesian coordinates of the camera orientation, that is the coordinates of the h, k and/or v-vectors in either "orbit" or "pivot" mode. When "auto" is set to true, the camera is rotated according to the "virtual trackball"- principle, ignoring the pitch, yaw and roll settings.',
    'a': [_pitch, _yaw, _look, "orbit", "pivot", "camera orientation"]
  }
  tpl[CAM][_yaw] = {
    'v': 0,
    'e': 'The camera angle corresponding to nodding "no"',
    'd': 'When set, it overwrites the carthesian coordinates of the camera orientation, that is the coordinates of the h, k and/or v-vectors in either "orbit" or "pivot" mode. When "auto" is set to true, the camera is rotated according to the "virtual trackball"- principle, ignoring the pitch, yaw and roll settings.',
    'a': [_pitch, _roll, _look, "orbit", "pivot", "camera orientation"]
  }
  tpl[CAM][_auto] = {
    'v': true,
    'e': 'Specify if the camera orientation should be controlled by dragging the mouse in the canvas',
    'd': 'When set to true, the camera orientation is real-time determined from dragging the mouse, where the "virtual trackball"-principle is used. The trackball principle means: dragging the mouse is interpreted as if it takes place on the surface of a virtual trackball. The theory is explained in  http://www.diku.dk/hjemmesider/ansatte/kash/papers/DSAGM2002_henriksen.pdf. <br><br>Since the distinction between "roll"-motions and "pitch" or "yaw" motions in a full-fledged trackball implementation are subtle and sometimes confusing, we use a simpler method. If the camera property "auto" is set to true, and if the mouse button is clicked, a circle appears in the canvas. Mouse dragging inside the circle causes yaw and pitch only; dragging outside the circle causes roll only. <br><br>Using the virtual trackball, the user-set values for properties "yaw", "pitch", and "roll" are ignored. Also, when "auto" is true, the carthesian coordinates of h,k and v are overwritten. The property "look" is assumed to take the value "orbit" (the entire trackball principle assumes that there is a fixed rotation origin which is not the centre of the perspective transformation. So the value of "look" is also overwritten, as are the eye-point coordinates, [eX,eY,eZ]. The gaze point, finally, is also ignored: the centre of rotation is taken to be a point at distance "r" in the direction of the current h-direction in front of the camera.',
     'a': [_look, "orbit", "pivot", "camera orientation"]
  }
  tpl[CAM][_look] = {
    'v': 'orbit',
    'e': 'In case of camera orientation specification, determine which of two modes applies',
    'd': 'A useful metaphor to reason about camera orientation specification is the Ptolmy - versus Copernicus view on the relative motions of Sun and Earth. <br><br>The Ptolmy-view is achieved by setting "look" to the value "pivot" (or "ptolmy":-). This is the camera-centered orientation specification; specifying the pitch, yaw or roll-values aims the camera at another part of the scene. <br><br>The Copernicus-view is achieved by setting "look" to the value "orbit"(=default or "copernicus":-). This is the gaze-point oriented specification; specifying the pitch, yaw or roll-values moves, and at the same time: re-orients, the camera such that the same part of the scene (namely: the gaze-point, [gX,gY,gZ]) is seen from a different angle.',
    'a': [_roll, _yaw, _pitch, "camera orientation", "orbit", "pivot", "perspective"]
  }
  //-------------------------------------------------------------------
  // defaults and manuals for grid properties
  //---------------------------------------------------------------------
  tpl[GRD][_majX] = {
    'v': 5,
    'e': 'number of major divisions in x-direction',
    'a': [_minX, _majY],
  }
  tpl[GRD][_majY] = {
    'v': 5,
    'e': 'number of major divisions in y-direction',
    'a': [_minX, _majY],
  }
  tpl[GRD][_majPhi] = {
    'v': 6,
    'e': 'number of major divisions in rotational direction',
    'a': [_minX, _majY],
  }
  tpl[GRD][_majR] = {
    'v': 5,
    'e': 'number of major divisions in radial direction',
    'a': [_minX, _majY],
  }
  tpl[GRD][_minX] = {
    'v': 20,
    'e': 'number of minor divisions in x-direction',
    'a': [_minX, _majY],
  }
  tpl[GRD][_minY] = {
    'v': 20,
    'e': 'number of minor divisions in y-direction',
    'a': [_minX, _majY],
  }
  tpl[GRD][_minPhi] = {
    'v': 24,
    'e': 'number of minor divisions in rotational direction',
    'a': [_minX, _majY],
  }
  tpl[GRD][_minR] = {
    'v': 20,
    'e': 'number of minor divisions in radial direction',
    'a': [_minX, _majY],
  }
  tpl[GRD][_grMajX] = {
    'v': _none,
    'e': 'determines major division in x-direction is present',
    'd': 'values are "none", "line" or "tick"',
    'a': [_majY, _grMinX],
  }
  tpl[GRD][_grMajY] = {
    'v': _none,
    'e': 'determines major division in y-direction is present',
    'd': 'values are "none", "line" or "tick"',
    'a': [_majX, _grMinY],
  }
  tpl[GRD][_grMajPhi] = {
    'v': _none,
    'e': 'determines major division in rotational direction is present',
    'd': 'values are "none", "line" or "tick"',
    'a': [_majPhi, _grMinPhi],
  }
  tpl[GRD][_grMajR] = {
    'v': _none,
    'e': 'determines major division in radial direction is present',
    'd': 'values are "none", "line" or "tick"',
    'a': [_majR, _grMinR],
  }
  tpl[GRD][_grMinX] = {
    'v': _none,
    'e': 'determines minor division in x-direction is present',
    'd': 'values are "none", "line" or "tick"',
    'a': [_minX, _grMajX],
  }
  tpl[GRD][_grMinY] = {
    'v': _none,
    'e': 'determines minor division in y-direction is present',
    'd': 'values are "none", "line" or "tick"',
    'a': [_minY, _grMajX],
  }
  tpl[GRD][_grMinPhi] = {
    'v': _none,
    'e': 'determines minor division in rotational direction is present',
    'd': 'values are "none", "line" or "tick"',
    'a': [_minPhi, _grMajX],
  }
  tpl[GRD][_grMinR] = {
    'v': _none,
    'e': 'determines minor division in radial direction is present',
    'd': 'values are "none", "line" or "tick"',
    'a': [_minR, _grMajR],
  }
  //-------------------------------------------------------------------
  // defaults and manuals for light properties
  //---------------------------------------------------------------------
  tpl[LGT][_l_x] = {
    'v': 0,
    'e': 'x-coordinate of the light direction of a lightsource',
    'd': 'The direction-properties apply to all types of light sources (directional source, point source and spot source).',
    'a': [_l_y, _l_z, "directional source", "point source", "spot source"]
  }
  tpl[LGT][_l_y] = {
    'v': -1,
    'e': 'y-coordinate of the light direction of a lightsource',
    'd': 'The direction-properties apply to all types of light sources (directional source, point source and spot source).',
    'a': [_l_x, _l_z, "directional source", "point source", "spot source"]
  }
  tpl[LGT][_l_z] = {
    'v': 0,
    'e': 'z-coordinate of the light direction of a lightsource',
    'd': 'The direction-properties apply to all types of light sources (directional source, point source and spot source).',
    'a': [_l_x, _l_y, "directional source", "point source", "spot source"]
  }
  tpl[LGT][_l_r] = {
    'v': 255,
    'e': 'red component of the color of a light source',
    'd': 'In lighting calculations, intensities are normalized between 0 and 255. Since many attenuating factors apply, however, it may be necessary to have the red, green and blue components of the initial light to be considerably larger than 255.',
    'a': [_l_g, _l_b]
  }
  tpl[LGT][_l_g] = {
    'v': 255,
    'e': 'green component of the color of a light source',
    'd': 'In lighting calculations, intensities are normalized between 0 and 255. Since many attenuating factors apply, however, it may be necessary to have the red, green and blue components of the initial light to be considerably larger than 255.',
    'a': [_l_b, _l_r]
  }
  tpl[LGT][_l_b] = {
    'v': 255,
    'e': 'blue component of the color of a light source',
    'd': 'In lighting calculations, intensities are normalized between 0 and 255. Since many attenuating factors apply, however, it may be necessary to have the red, green and blue components of the initial light to be considerably larger than 255.',
    'a': [_l_r, _l_g]
  }
  tpl[LGT][_l_px] = {
    'v': 0,
    'e': 'x component of the location of a light source',
    'd': 'Directional light sources can be assumed to be at inifinite distance (hence: parallel illumination direction, and no distance attenuation). Therefore "l_px", "l_py", "l_pz" properties are not defined for directional light sources. Conversely, if one of "l_px", "l_py", or "l_pz" properties is specfied, it is assumed that the light source is a points source.',
    'a': [_l_py, _l_pz, "directional source", "spot source"]
  }
  tpl[LGT][_l_py] = {
    'v': 50,
    'e': 'y component of the location of a light source',
    'd': 'Directional light sources can be assumed to be at inifinite distance (hence: parallel illumination direction, and no distance attenuation). Therefore "l_px", "l_py", "l_pz" properties are not defined for directional light sources. Conversely, if one of "l_px", "l_py", or "l_pz" properties is specfied, it is assumed that the light source is a points source. Notice that for natural lighting, the value of "l_py" should be positive (light conventionally coming from above)',
    'a': [_l_px, _l_pz, "directional source", "spot source"]
  }
  tpl[LGT][_l_pz] = {
    'v': 0,
    'e': 'z component of the location of a light source',
    'd': 'Directional light sources can be assumed to be at inifinite distance (hence: parallel illumination direction, and no distance attenuation). Therefore "l_px", "l_py", "l_pz" properties are not defined for directional light sources. Conversely, if one of "l_px", "l_py", or "l_pz" properties is specfied, it is assumed that the light source is a points source.',
    'a': [_l_px, _l_py, "directional source", "spot source"]
  }
  tpl[LGT][_l_open] = {
    'v': 0,
    'e': 'Angle of beam divergence for a spot source',
    'd': 'The light beam for a directional light source is parallel, and hence has opening angle 0. For a point source, the opening angle is 4 pi sterradians, as the light for a point source is assumed to be distributed isotropically over all directions. Therefore, if we specify a finite opening angle, ' + DESCARTESTM + ' assumes that the light source is a spot source. A spot source needs a location (otherwise the location is at infinity, and the angle must be 0). So the values for the properties [l_px,l_py,l_pz] are used - either their default values or specified values. Moreover, the light beam needs to have a specified axis direction, therefore the properties [l_x,l_y,l_z]  are used - again, either the default values or specified values. <br><br>The value of proprety "l_open" is given in radians; it is the half cone angle of the emitted light beam.',
    'a': [_l_dropOff, "directional source", "point source"]
  }
  tpl[LGT][_l_dropOff] = {
    'v': 0,
    'e': 'The drop-off rate of the light beam in a spot light',
    'd': 'The light beam in any physical spot light has a diffuse boundary: the transition between 100% light inside the beam and 0% light outside the beam is not abrupt. The value of "l_dropOff" is an angle, commensurable with "l_open", controlling the amount of diffuseness of the border of the beam of this spot source.',
    'a': [_l_open, "directional source", "point source"]
  }
  //-------------------------------------------------------------------
  // defaults and manuals for geometry properties
  //---------------------------------------------------------------------
  tpl[GEO][_locations] = {
    'e': 'Specifies the location values for a geometry',
    'd': 'A geometry is a (possibly empty) collection that may contain locations (rendered by icons), edges (that may be rendered as lines or beziers, possibly with arrows), and/or faces (rendered as opaque or transparent patches and/or as boundaries). Both edges and faces depend for the geometrical specification on locations. So even if the geometry shows no visual icons, the "locations" property is mandatory in order to have edges or faces. Its value is an array of concepts, every concept containing coordinates "x" and "y" and optionally "z" as properties.<br><br>The end points in an edge have their coordinates taken from the array of locations. An edge is therefore specified by means of the numbers (indices) in the locations array of the begin- and end points (and for a bezier: the two additional points defining the curved shape of the bezier). <br><br>Similarly, for a face, the collection of corner points is defined by a property "loop" which has as value an array of indices into the locations-array. The application is responsible for only including valid indices in locations; an edge or a face referring to a non-existing location is not rendered.',
    'x': 'Some examples of the specification of locations are the following:<ul><li>locations:[data:[[x:3,y:5],[x:6,y:-3]]]<br>defines two 2D points; all rendering poperties are set to default</li><li>locations:[x:[mode:"intp",low:10,high:20],y:22,nrLocations:5]<br>defines 5 locations, x-coordinates range between 10 and 20; y-coordinates are all equal to 22; all rendering properties are set to default</li><li>locations:[x:[mode:"intp"],y:[mode:"shift"],icon:"sector",rad:[mode:"intp",low:10,high:50],nrLocations:10,data:[y:100*random(),phi1:0,phi2:3.1415]]<br>defines 10 locations, each plotted as a semi-circular sector with radius ranging from 10 to 50, x ranging between 0 and 100 (defaults for interpolation), and y values shifted in from random values between 0 and 100; other rendering properties are all set to defaults</li></ul>',
    'a': [_edges, _faces, _data, _mode, _x, _y, _z]
  }
  tpl[GEO][_edges] = {
    'e': 'Specifies the edges for a geometry',
    'd': 'In order to have visible edges in a geometry, these edges must have their end points defined. Therefore there must be a property "locations" part of the geometry. The value of the "locations"-property is an array; every element in the array represents one location. End points of an edge therefore contain properties "b" and "e", being indices in the "locations" array of the two locations that are the begin point and the end point of this edge.<br>By default an edge is a straight line; it is possible, however, to have the begin point and the end point connected by a (bezier) curve. In that case we can specify two more locations, and therefore two more indices into the "locations"-array: these are the values of the properties "bB" and "eB".',
    'x': 'Some examples of the specification of edges are the following:<ul><li>edges:[data:[[b:3,e:5],[b:6,e:-3]]]<br>defining two edges, all rendering properties are set to defaults</li><li>edges:[thickness:2,b:1,data:[[e:2,tag:"first line" ],[e:3],[e:4,tag:"last line"]]]<br>defining three edges, all originating in the same location with three different end locations; all edges have same thickness; first and last edge have text tags</li><li>edges:[shape:"bezier",data:[[b:0,bB:1,eB:2,e:3]]]<br>defines a bezier curve controlled by four locations</li></ul>',
    'a': [_locations, _faces, _data, _shape, _b, _e, _bB, _eB]
  }
  tpl[GEO][_faces] = {
    'e': 'Specifies the faces for a geometry',
    'd': 'In order to have visible faces in a geometry, these faces must have their corners defined. Therefore there must be a property "locations" part of the geometry. The value of the "locations"-property is an array; every element in the array represents one location. Corners of a face therefore contains a property "loop", being an array of indices in the "locations" array of the corner points of the edge.<br>A face can be rendered as a border ("fill" has value "border"), as a filled patch ("fill" is "interior", as "both" or as "none". The color of the interior and of the border can separately be specified. The interior color in a rendered face will depend on the presence of illumination. Further, we can specify an additional specular color, which determines the color of the specular contribution to illumination; the property "beta" determines the spatial distribution of the highlight. With "beta" having value 0, there is no highlight.',
    'x': 'Some examples of the specification of faces are the following:<ul><li>faces:[data:[[loop:[0,1,2]],[loop:[1,2,3]]]]<br>defines two triangles sharing an edge; all rendering properties are set to default</li><li>faces:[thickness:2,fill:"interior",beta:20,scol_r:0,scol_g:0,scol_b:100,data:[[loop:[0,1,2],fcol_r:255,fcol_g:0,fcol_b:0],[loop:[3,4,5],fcol_r:0,fcol_g:255,fcol_b:0],[loop:[6,7,8],fcol_r:0,fcol_g:0,fcol_b:255]] <br>defines three faces, all with a bluish specular reflection, having red, green and blue diffuse colors</li></ul>',
    'a': [_locations, _edges, _data, _lights, _loop]
  }
  tpl[GEO][_camera] = {
    'e': 'Specifies the camera for perspective viewing of 3D geometric scenes',
    'd': 'A camera is determined by<ul><li>a point in space (the centre of projection or the eye point (the location of the pupil of the camera), defined by the properties "eX", "eY", "eZ";</li><li>three base vectors defining a coordinate system to specify horizontal, vertical and looking directions. This coordinate system can be oriented arbitrarily in space; it determines the direction we are looking at. The base vectors are given by values for the properties "hX", "hY", "hZ", "vX", "vY", "vZ", "kX", "kY", "kZ" ("k" for the Dutch word "kijken" for "looking"). In physical cameras the coordinate system is orthogonal, but this is not enforced by ' + DESCARTESTM + ';</li><li>a number, being the focal length, "f", which is the distance between the eye point and the projection screen. <br>In the human eye, the projection screen is the retina; in an analog camera, the projection screen is the film plane. For many (traditional) consumer cameras, the focal length is 35 mm. The focal length corresponds to the magnification factor of the image.</li></ul>Although these properties fully determine the camera, and hence the perspective transformation, they are sometimes inconvenient. For instance, to reorient the camera, involves simulteneous geometric transformations of all three base vectors, keeping them orthogonal. Therefore it is more convenient to specify the camera orientation by means of three angles:<ul><li>pitch: corresponding to nodding "yes"</li><li>yaw: corresponding to nodding "no" (in Western countries)</li><li>roll: corresponding to nodding clockwise or counterclockwise rotations.</li></ul>Specifications of orientation angles overrides the specification of the base vectors. Specification of the orientation angles can even override the specification of the eye location. Indeed: the orientation angles have two interpretations. As follows: <ul><li>In the pivot interpretation (property "look" is set to "pivot" or "ptolmy" - after an astronomer who advocated the geocentric view to planetary motion), the eye location stays put, and the camera rotates, looking at a different sector of 3D space;</li><li>in the orbit interpetation (property "look" is set to the default "orbit" or "copernicus" - after an astronomer who advocated the heliocentric view to planetary motion), the eye moves around a given gaze point (properties "gX", "gY", "gZ"), looking at this point from varying angles. In the orbit-interpretation, there is a further property called "r" which is the distance between the eye point and the gaze point.</li></ul><br>To provide a very intuitive control of camera orientation, the specification of the orientation angles yaw and pitch can also be done by dragging the mouse in the canvas. To achieve this, the property of "auto" should be set to true',
    'x': 'Some examples of the specification of a camera are the following:<ul><li>camera:[]<br>defines a default camera where all properties have default values</li><li>camera:[r:300,f:200,auto:true]<br>defines a camera under mouse control with given values for the focal length and the distance between the eye point and the gaze point</li><li>camera:[pitch:0.5,yaw:0.7,roll:3.1415,look:"pivot"] specifies a camera with default focal length, and default eye location, looking into the spatial direction given by the pitch and yaw angles; the image is "upside down" (in some sense) because the roll angle is set to pi.</li></ul>',
    'a': [_pitch, _roll, _yaw, _f, _r, _look, "pivot", "orbit", "camera control", "perspective"]
  }
  tpl[GEO][_lights] = {
    'e': 'Specify the illumination conditions in the geometric scene',
    'd': 'The rendering of faces is both determined by the proper color of faces, and by the presence of one or more light sources. The property "lights" takes as value either a single light source or an array of arbitrary many light sources. We distinguish three types of light sources:<ul><li>A directional light source corresponds to a light source at infinite distance, so that light rays are parallel. This means that there is no distance-related attenuation, and the lighting conditions are fully determined by the rgb-color of the light source ("l_r", "l_g", "l_b") and the direction vector ("l_x", "l_y", "l_z"). Color components are normalised between 0 and 255, but due to geometric attenuation (e.g., when the surface is nearly perpendicular to the direction of the incoming light beam), it might be appropriate to provide values that are (much) larger than 255 for color components. <br>The vector [l_x,l_y,l_z] is provided for a direction only, so the vector is normalized by ' + DESCARTESTM + ';</li><li>A point light source corresponds to a point in space at given location (determined by the values of "l_px", "l_py", "l_pz"), shining uniformly in all directions (an isotropic light distribution). The light intensity attenuates, because of energy conservation, proportional to 1/(square of the distance). For a point light source, the properties "l_x", "l_y", "l_z" are ignored;</li><li>A spot light source is a located light source that does not shine isotropically, but that has a light intensity distribution that is oriented along a direction. This direction is given by the values of "l_x", "l_y", "l_z". The light distribution is modeled as a beam of light with an opening angle given by the value of "l_open". The distribution falls off from 100% within the beam to 0% outside the beam. This fall-off can be more or less sharp; the value of "l_dropOff" determines the angle over which dropp-off occurs.</li></ul>',
    'x': 'Some examples of the specification of lights are the following:<ul><li>lights:[]<br>defines a default light configuration where all properties have default values</li><li>lights:[[]]<br>the same as above. Notice that the lights specification can either consist of a single light or of an aggregation (array) of lights.</li><li>lights:[[l_x:0,l_y:-1.l_z:0,l_r:255,l_g:0,l_b:0]]<br>a beam of red light shining from above perpendicularly down</li><li>lights:[l_y:-1,l_z:0,l_open:0.3,l_dropOff:0.01,[l_x:1,l_px:-50],[l_x_:-1,l_px:50]]<br>specifies two spot lights. One light beam shining into left lower direction from a source to the left of the scene, the other light beam shining into the right lower direction from a source to the right of the scene. Both have a beam opening angle of 0.3 radians and a drop-off angle of 0.01 radian.</li></ul>',
     'a': ["directional source", "point source", "spot source"]
  }
  tpl[GEO][_background] = {
    'e': 'Specify the background color',
    'd': 'The background can be given any rgb color and opacity using the properties "fcol_r", "fcol_g", "fcol_b", and "fcol_a". Notice that with several geometries, the transparency of backgrounds can be used to create fancy semi-transparent overlays.',
    'x': 'Two examples of a background are the following:<ul><li>background:[fcol_r:0,fcol_g:0,fcol_b:0,fcol_a:1.0]<br>specifies a black, totally opaque background</li><li>background:[fcol_r:153,fcol_g:51,fcol_b:204,fcol_a:1.0]<br>specifies a background that cannot be distinguished from the ACCEL background</li></ul>',
    'a': ["paque", "transparent"]
  }
  tpl[GEO][_grid] = {
    'e': 'Specifies the grid to overlay the geometry',
    'd': 'Grid plotting in ' + DESCARTESTM + ' supports a variety of grids. A grid can be a tartan grid (horizontal and/or vertical lines), a polar grid (dividing the region round a point in equal sized angular sectors) or a radial grid (dividing the region round a point in rings with equal widths; typically used in conjunction with radar icons). <br><br>Grids of various types can be overlaid. <br><br>All three kinds of grids have major and minor subdivisions, characterised by heavier and lighter lines or ticks. Instead of lines, running over the entire canvas, also ticks can be used to specify short markers. For all gridtypes, the grid spacing of both major and minor divisions can be specified.',
    'x': 'Two examples of grids are the following:<ul><li>grid:[majPhi:6,grMajPhi:"line",minPhi:18,grMinPhi:"line",majR:4,grMajR:"line",minR:20,grMinR:"tick"]<br>combines a polar grid with subdivision in 6 (major) and 18 (minor) sectors with a radial grid with 4 (major) and 24 (minor) radii (including r=0). The minor radial division is indicated by ticks; the major radial division and both the major and minor polar divisions are indicated by lines</li><li>grid:[majX:5,grMajX:"line",minPhi:18,grMinPhi:"line"]<br>specifies a less common hybrid of a polar grid without major subdivision and vertical gridlines</li></ul>',
  }
  // build the sets of all valid properties
  var allTemplates = []
  for (var i = 0; i < NRDESCARTESPROPS; i++) {
    allTemplates.push(tpl[i])
    for (var k in tpl[i]) {
      validProperties[i] += (k + "; ")
      tpl[i][k]['p']=tplNames[i]
    }
    validProperties[i] = validProperties[i].substr(0, validProperties[i].length - 2)
  }
  //-----------------------------------------------------------------------
  var checkProps=function(tuple,templateIndex){
    if(!skipCheck){
    for(var k in tuple){
      if(!isNumeric(k)){
        if(!tpl[templateIndex].hasOwnProperty(k)){
          setStatus("Found illegal property <"+k+"> in concept "+tplNames[templateIndex]+".\nValid properties are: "+validProperties[templateIndex],true)
        }
      }
    }
    }
  }
  //-----------------------------------------------------------------------
  var initGlobals = function () {
      statusReport = ""
      mouseDownState = false
      mouseLocX = 0
      mouseLocY = 0
      virtualTrackBall=clone(identity)
      gaugeCircleDark=true
      autoCamBase=[[0,0,0],[1,0,0],[0,1,0],[0,0,1]]
      skipCheck=false
      locations = []
      edges = []
      faces = []
      contours = []
      // the pRandom array is used to have reproducable random
      // values to be used in the random-property
      for (var i = 0; i < nrRandom; i++) {
        pRandom[i] = Math.random()
      }
    }
    //----------------------------------------------------------------------
  this.enforceRedraw = function () {
    // this detroys the memory e.g. as used in shift
    archive = []
    initGlobals()
  }
  //----------------------------------------------------------------------
  this.setUpGraph = function () {
    if (!canvasBuild) {
      if (cF != '') {
        $('#' + divName).append('<canvas id="' + divName + '_canvas" width="' + cW + '"  height="' + cH + '" style="' + cF + '" />');
      } else {
        $('#' + divName).append('<canvas id="' + divName + '_canvas" width="' + cW + '"  height="' + cH + '" />');
      }
      archive = [];
      canvasBuild = true;
      $('#' + divName).show();
      $('#' + divName + '_canvas').show();
      var elem = document.getElementById(divName + '_canvas');
      if (elem && elem.getContext) {
        ctx = elem.getContext('2d');
        CanvasTextFunctions.enable(ctx);
      }
      $('#' + divName + "_canvas").mousedown(function (e) {
        var x = e.pageX - $("#" + divName + "_canvas").offset().left;
        var y = e.pageY - $("#" + divName + "_canvas").offset().top;
        cB(x / cW, 1 - y / cH, true);
        mouseDownState = true
        mouseLocX = x / cW
        mouseLocY = 1 - y / cH
      });
      $('#' + divName + "_canvas").mouseup(function (e) {
        var x = e.pageX - $("#" + divName + "_canvas").offset().left;
        var y = e.pageY - $("#" + divName + "_canvas").offset().top;
        cB(x / cW, 1 - y / cH, false);
        mouseDownState = false
        mouseLocX = x / cW
        mouseLocY = 1 - y / cH
      });
      $('#' + divName + "_canvas").mousemove(function (e) {
        var x = e.pageX - $("#" + divName + "_canvas").offset().left;
        var y = e.pageY - $("#" + divName + "_canvas").offset().top;
        var xM = x / cW
        var yM = 1 - y / cH
        if (camera.auto) {
          if (mouseDownState) {
            // mouse moves near to centre of screen: interpret mouse movements as
            // rotations of virtual trackbal (no quaternions - simply horizontal/vertical - pitch/yaw)
            virtualTrackBall=calcVirtualTrackBall(xM,yM,mouseLocX,mouseLocY)
          } else {
            virtualTrackBall=clone(identity)
          }
        }
        mouseLocX = xM
        mouseLocY = yM
        cMove(xM, yM, mouseDownState);
        // the following statement is mysteriously necessary
        // in chrome: otherwise it selects the canvas after any number of
        // move events. I found the hint here:
        // http://stackoverflow.com/questions/6186844/clear-a-selection-in-firefox/6187098#6187098
        window.getSelection().removeAllRanges()
      });
      canvasBuild = true;
    }
  }
  //--------------------------------------------------------------------------
  var vLen=function(a){
    var r=Math.sqrt(a[0]*a[0]+a[1]*a[1]+a[2]*a[2])
    if(r==0){
    var kees="wakker"
    }
    return r
  }
  var vScalMul=function(s,v){
    return [s*v[0],s*v[1],s*v[2]]
  }
  //----------------------------------------------------------------------
  var vCross=function(a,b){
    return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]
  }
  //-----------------------------------------------------------------------
  var calcVirtualTrackBall=function(xNew,yNew,xOld,yOld){
  // this is a simplified implementation. If the camera has an 'auto' proprety and this is
  // set to true, a circle appears on the screen when the mouse is clicked.
  // Mouse movements within the circle cause roations over the
  // (camera) h or v axes; outside the circle, the k-axis.
  var axis=[]
  // we first compute the orientation of the rotation axis in the camera x-y
  // system. This is purely determined by the x-difference and the y-difference
  // of the most recent mouse move.
  var deltaX= xOld-xNew
  var deltaY= yOld-yNew
  var displMagnitude=Math.sqrt(deltaX*deltaX+deltaY*deltaY)
  var excentricity=Math.sqrt((xNew-0.5)*(xNew-0.5)+(yNew-0.5)*(yNew-0.5))+Math.sqrt((xOld-0.5)*(xOld-0.5)+(yOld-0.5)*(yOld-0.5))
  if(displMagnitude!=0){
    var sinAngle=0
    if(excentricity<0.5){
      axis[0]= deltaY/displMagnitude
      axis[1]=-deltaX/displMagnitude
      axis[2]=0
      sinAngle=displMagnitude
    } else {
      axis[0]=0
      axis[1]=0
      axis[2]=1
      var sinVec=vCross([xNew-xOld,yNew-yOld,0],[(xNew+xOld)/2-0.5,(yNew+yOld)/2-0.5,0])
      sinAngle=sinVec[2]
    }
    var axLen=vLen(axis)
    // these last two assignments are a matter of heuristic: to distribute the contribution of k-axis
    // rotation more or less evenly

    var cosAngle=Math.cos(Math.asin(sinAngle))
    var nAxis=vScalMul(1.0/axLen,axis)
    // this axis is drived in the coordinate system of the current camera.
    // So we must transform it to the world system
    var nnAxis=[]
    for(var i=0;i<3;i++){
      nnAxis[i]=0
      for(var j=0;j<3;j++){
        nnAxis[i]+=nAxis[j]*autoCamBase[j+1][i]
      }
    }
    for(i=0;i<3;i++){
      nAxis[i]=nnAxis[i]
    }
    //console.log("exc="+excentricity+" axis="+nAxis[0]+","+nAxis[1]+","+nAxis[2])
    var aCross=[[0,-nAxis[2],nAxis[1]],[nAxis[2],0,-nAxis[0]],[-nAxis[1],nAxis[0],0]]
    var aTensor=[]
      for(i=0;i<3;i++){
        var row=[]
        for(j=0;j<3;j++){
          row[j]=nAxis[i]*nAxis[j]
        }
        aTensor.push(row)
      }
    var result=[]
      for(i=0;i<3;i++){
        row=[]
        for(j=0;j<3;j++){
          row[j]=identity[i][j]*cosAngle+aCross[i][j]*sinAngle+aTensor[i][j]*(1.0-cosAngle)
        }
        result.push(row)
      }
      // check if the matrix is a rotation
      var check=[]
      for(i=0;i<3;i++){
        row=[]
        for(j=0;j<3;j++){
          var t=0
          for(var m=0;m<3;m++){
            t+=result[i][m]*result[j][m]
          }
          row[j]=t
        }
        check.push(row)
      }
      return result
    } else {
      return clone(identity)
    }
  }
  //----------------------------------------------------------------------
  // dArg is an array, one numbered element for each graph.
  // Further, there may be properties grid, lights and camera.
  // One graph is also an array. A graph can either be:
  // a contour, an image or a geometry (=default).
  this.draw = function (dArg) {
    var i = 0;
    statusReport = "";
    clearScreen();
    if (dArg.length > 0) {
      dLSort = []
      dLPostSort = []
      dLPreSort = []
      skipCheck=false
      pRandomIndex=0
      if (dArg.hasOwnProperty(_lights)) {
        mainLights = installLights(dArg[_lights])
      } else {
        // if there is no light, rendered faces just have their face color.
        // This is different from having lights:[], which means that there is a default
        // light setting, including a light source
        mainLights = undefined
      }
      if (dArg.hasOwnProperty(_camera)) {
        // this behaves different from lights: there cannot be a situation with no camera.
        // So if no camera is specified, the default camera is brought in with
        // propery _perspective set to false.
        mainCamera = installCamera(dArg[_camera])
      } else {
        mainCamera=clone(tpl[CAM])
        mainCamera[_perspective] = false
      }
      for (i = 0; i < dArg.length; i++) {
        dealWithBackground(dArg[i])
        if (dArg[i].hasOwnProperty(_grid)) {
          installGrid(dArg[i][_grid])
        } else {
          grid[_gridPresent] = false
        }
        if (!archive[i]) {
          archive[i] = [];
        }
        if (statusReport == '') {
          doDraw(dArg[i], archive[i]);
        }
      }
      if (grid[_gridPresent]) {
        drawGrid();
      }
      if(camera[_auto]){
        if(mouseDownState && camera[_auto] && camera[_perspective]){
          if(gaugeCircleDark){
            dLPush({
              'w': 'a',
              's': "rgb(128,128,128)",
              'c': [[cW/2,cH/2]],
              'l': 0.5,
              'p': [cM/4,0,twoPi,false]
            })
          } else {
            dLPush({
              'w': 'a',
              's': "rgb(64,64,64)",
              'c': [[cW/2,cH/2]],
              'l': 0.5,
              'p': [cM/4,0,twoPi,false]
            })
          }
          gaugeCircleDark=!gaugeCircleDark
        }
      }
      if (statusReport == '') {
        pseudoGPU()
      }
      archive.length = dArg.length
    }
    //var vtb=""
    //for(var i=0;i<3;i++){
    //  for(var j=0;j<3;j++){
    //    vtb+=(" "+Math.round(virtualTrackBall[i][j]*100)/100)
    //  }
    //  vtb+="\n"
    //}
    //vtb+="\n"
    //console.log(vtb)
    //console.log(autoCamBase)
  }
  //-------------------------------------------------------------------------
  var dealWithBackground = function (dArg) {
      if (dArg.hasOwnProperty(_background)) {
        checkProps(dArg[_background],BCK)
        if (dArg[_background].hasOwnProperty(_image)) {
          setStatus("Background image is not yet implemented", true)
        } else {
          var br = dArg[_background].hasOwnProperty(_fcol_r) ? dArg[_background][_fcol_r] : 128
          var bg = dArg[_background].hasOwnProperty(_fcol_g) ? dArg[_background][_fcol_g] : 128
          var bb = dArg[_background].hasOwnProperty(_fcol_b) ? dArg[_background][_fcol_b] : 128
          var ba = dArg[_background].hasOwnProperty(_fcol_a) ? dArg[_background][_fcol_a] : 1.0
          ctx.beginPath()
          ctx.fillStyle = "rgba(" + br + "," + bg + "," + bb + "," + ba + ")"
          ctx.fillRect(0, 0, cW, cH)
        }
      }
    }
    //------------------------------------------------------------------------
  this.whipeGraph = function (p) {
  // sorry for the spelling mistake ... should be wipe
    ctx = $('#' + p + '_canvas')[0].getContext("2d");
    ctx.clearRect(0, 0, cW, cH);
  }
  //----------------------------------------------------------------------
  this.eraseGraph = function () {
    $('#' + divName + '_canvas').remove();
    canvasBuild = false;
    archive = [];
    $('#' + divName).hide();
  }
  //-----------------------------------------------------------------------
  var clearScreen = function () {
      ctx = $('#' + divName + '_canvas')[0].getContext("2d");
      ctx.clearRect(0, 0, cW, cH);
    }
    //-----------------------------------------------------------------------
  var installLights = function (lightsInfo) {
      var lO = []
      checkProps(lightsInfo,LGT)
      for (var k in tpl[LGT]) {
        if (k != _l_px && k != _l_py && k != _l_pz && k != _l_open && k != _l_dropOff) {
          // these properties should not be included in the default. Otherwise
          // light sources could not be simple directional light sources.
          // Indeed: a source is a directional source in virtue of the fact
          // that it posses no l_px etc. properties.
          lO[k] = lightsInfo.hasOwnProperty(k) ? lightsInfo[k] : tpl[LGT][k].v
        }
      }
      checkProps(lO,LGT)
      // are there any lights defined? That is: is there a nameless property which is an array?
      var lightsDefined = false
      var lArr = []
      for (var k in lightsInfo) {
        if (isNumeric(k)) {
          lightsDefined = true
          checkProps(lightsInfo[k],LGT)
          lArr.push(lightsInfo[k])
        }
      }
      if (!lightsDefined) {
        lArr = [lO]
      } else {
        for (var i = 0; i < lArr.length; i++) {
          for (var k in lO) {
            if (!lArr[i].hasOwnProperty(k)) {
              lArr[i][k] = lO[k]
            }
          }
        }
      }
      for (i = 0; i < lArr.length; i++) {
        var lNorm = Math.sqrt(lArr[i][_l_x] * lArr[i][_l_x] + lArr[i][_l_y] * lArr[i][_l_y] + lArr[i][_l_z] * lArr[i][_l_z])
        if (lNorm > 0) {
          lArr[i][_l_x] /= lNorm
          lArr[i][_l_y] /= lNorm
          lArr[i][_l_z] /= lNorm
        }
        lArr[i][_l_y] = -lArr[i][_l_y]
        // this is because the y-axis runs from top to bottom, and is therefore inverted in
        // the mapping to the viewport. To make light directions consistehnt, we have to invert the y-component
        // of the shining direction.
      }
      return lArr
    }
    //----------------------------------------------------------------------
  var installCamera = function (cameraInfo) {
      checkProps(cameraInfo,CAM)
      var lCamera = {}
      for (var k in tpl[CAM]) {
        lCamera[k] = cameraInfo.hasOwnProperty(k) ? cameraInfo[k] : tpl[CAM][k].v
      }
      if (cameraInfo[_auto]) {
        // if auto is set to true, the camera has to undergo a rotation
        // that is taken from the virtual trackball. The auto-mode only makes sense in
        // orbit mode (otherwise the entire virtual trackball concept is lost), so we ignore the
        // setting of property _look
        //
        // We form 4 points in 3-space, being the camera eye point (0), the horPoint (1), the verPoint (2), and
        // the gazePoint (3), and rotate all three using the virtual trackball, These are stored in a global
        // variable to keep the camera state: the variable autoCamBase.
        //
        // First displace the camera such that the gaze point, that is the point at distance r in front of
        // the camera, coincides with the origin (which is the rotation centre).
        // As the gaze point, we pick the point that is right in front of the camera (i.e., in the k-direction)
        // at distance r. So we also ignore the properties _gX.._gZ when in auto-mode.
        for(var i=0;i<3;i++){
          autoCamBase[0][i]-=(autoCamBase[0][i]+lCamera[_r]*autoCamBase[3][i])
        }
        for(i=0;i<4;i++){
          var nw=[]
          for(var j=0;j<3;j++){
            var t=0
            for(var m=0;m<3;m++){
              t+=autoCamBase[i][m]*virtualTrackBall[j][m]
            }
            nw[j]=t
          }
          for(j=0;j<3;j++){
            autoCamBase[i][j]=nw[j]
          }
        }
        lCamera[_eX]=autoCamBase[0][0]
        lCamera[_eY]=autoCamBase[0][1]
        lCamera[_eZ]=autoCamBase[0][2]
        lCamera[_hX]=autoCamBase[1][0]
        lCamera[_hY]=autoCamBase[1][1]
        lCamera[_hZ]=autoCamBase[1][2]
        lCamera[_vX]=autoCamBase[2][0]
        lCamera[_vY]=autoCamBase[2][1]
        lCamera[_vZ]=autoCamBase[2][2]
        lCamera[_kX]=autoCamBase[3][0]
        lCamera[_kY]=autoCamBase[3][1]
        lCamera[_kZ]=autoCamBase[3][2]
      } else {
        var cx = Math.cos(camera.hasOwnProperty(_pitch)?camera[_pitch]:tpl[CAM][_pitch].v)
        var sx = Math.sin(camera.hasOwnProperty(_pitch)?camera[_pitch]:tpl[CAM][_pitch].v)
        var cy = Math.cos(camera.hasOwnProperty(_yaw)?camera[_yaw]:tpl[CAM][_yaw].v)
        var sy = Math.sin(camera.hasOwnProperty(_yaw)?camera[_yaw]:tpl[CAM][_yaw].v)
        var cz = Math.cos(camera.hasOwnProperty(_roll)?camera[_roll]:tpl[CAM][_roll].v)
        var sz = Math.sin(camera.hasOwnProperty(_roll)?camera[_roll]:tpl[CAM][_roll].v)
        if (lCamera[_look] == 'orbit' || lCamera[_look] == 'copernicus') {
          // this is the orbit, or copernicus mode: the gaze point (the sun) is kept fixed
          if (cameraInfo.hasOwnProperty(_roll) || cameraInfo.hasOwnProperty(_yaw) || cameraInfo.hasOwnProperty(_pitch) || cameraInfo[_auto]) {
            // never mind if there also had been set some carthesion orientation properties: if toll-pitch-yaw
            // definitions are provided upon input, these will be used and overrule
            // any present carthesian ones. Dependinn look (orbit ot pivot), the
            // gaze point or the eye point, as well as the distance from the gaze point, r,  will be taken into account.
            lCamera[_eX] = lCamera[_gX] + lCamera[_r] * sy * cx
            lCamera[_eY] = lCamera[_gY] + lCamera[_r] * sx
            lCamera[_eZ] = lCamera[_gZ] - lCamera[_r] * cy * cx
            lCamera[_kX] = -sy * cx
            lCamera[_kY] = -sx
            lCamera[_kZ] = cy * cx
            lCamera[_hX] = cy
            lCamera[_hY] = 0
            lCamera[_hZ] = sy
            // finally, v=k X h
            lCamera[_vX] = -lCamera[_hY] * lCamera[_kZ] + lCamera[_hZ] * lCamera[_kY]
            lCamera[_vY] = -lCamera[_hZ] * lCamera[_kX] + lCamera[_hX] * lCamera[_kZ]
            lCamera[_vZ] = -lCamera[_hX] * lCamera[_kY] + lCamera[_hY] * lCamera[_kX]
            // to bring roll into account, we have to rotate over k-axis.
            var hhx = cz * lCamera[_hX] + sz * lCamera[_vX]
            var hhy = cz * lCamera[_hY] + sz * lCamera[_vY]
            var hhz = cz * lCamera[_hZ] + sz * lCamera[_vZ]
            var vvx = cz * lCamera[_vX] - sz * lCamera[_hX]
            var vvy = cz * lCamera[_vY] - sz * lCamera[_hY]
            var vvz = cz * lCamera[_vZ] - sz * lCamera[_hZ]
            lCamera[_hX] = hhx
            lCamera[_hY] = hhy
            lCamera[_hZ] = hhz
            lCamera[_vX] = vvx
            lCamera[_vY] = vvy
            lCamera[_vZ] = vvz
          }
        } else {
          // this is the pivot, or ptolmy mode: the eye point (the earth) is fixed and we look  around.
          if (cameraInfo.hasOwnProperty(_roll) || cameraInfo.hasOwnProperty(_yaw) || cameraInfo.hasOwnProperty(_pitch) || cameraInfo[_auto]) {
          // never mind if there also had been set some carthesion orientation properties: the toll-pitch-yaw
          // definitions will be used and overrule
          // any present carthesian ones.
            lCamera[_hX] = cy * cz
            lCamera[_hY] = -cy * sz
            lCamera[_hZ] = -sy
            lCamera[_vX] = -sy * sx * cz + sz * cx
            lCamera[_vY] = sy * sx * sz + cx * cz
            lCamera[_vZ] = -cy * sx
            lCamera[_kX] = sy * cx * cz + sz * sx
            lCamera[_kY] = -sz * sy * cx + sx * cz
            lCamera[_kZ] = cy * cx
          }
        }
      }
      return lCamera
    }
    //----------------------------------------------------------------------
  var installGrid = function (gridInfo) {
      checkProps(gridInfo,GRD)
      grid[_gridPresent] = true
      for(var k in tpl[GRD]){
        grid[k] = gridInfo.hasOwnProperty(k) ? gridInfo[k] : tpl[GRD][k].v
      }
    }
    //----------------------------------------------------------------------
  var dLPush = function (t) {
    if (t.hasOwnProperty(_z)) {
      // z-values only have the purpose in z-sorting for hidden surface elimination
      dLSort.push(t)
    } else {
      if (t.w == 'i') {
        dLPreSort.push(t)
      } else {
        dLPostSort.push(t)
      }
    }
  }

  //----------------------------------------------------------------------
  var pseudoGPU = function () {
      var i, j
      var cRender = function (p) {
        switch (p.w) {
        case 'l': // polyline, filled or non-filled
          ctx.beginPath()
          if (p.l) {
            ctx.lineWidth = p.l
          } else {
            ctx.lineWidth = 1
          }
          ctx.moveTo(p.c[0][0], p.c[0][1])
          for (j = 1; j < p.c.length; j++) {
            ctx.lineTo(p.c[j][0], p.c[j][1])
          }
          if (p.f) {
            ctx.fillStyle = p.f
            ctx.fill()
          }
          if (p.s) {
            ctx.strokeStyle = p.s
            ctx.stroke()
          }
          break;
        case 'a': // arc, filled or non filled
          ctx.beginPath()
          if (p.p[1] != 0 || p.p[2] != twoPi) ctx.moveTo(p.c[0][0], p.c[0][1])
          ctx.arc(p.c[0][0], p.c[0][1], Math.max(1, p.p[0]), p.p[1], p.p[2], p.p[3])
          ctx.closePath()
          if (p.l) {
            ctx.lineWidth = p.l
          } else {
            ctx.lineWidth = 1
          }
          if (p.f) {
            ctx.fillStyle = p.f
            ctx.fill()
          }
          if (p.s) {
            ctx.strokeStyle = p.s
            ctx.stroke()
          }
          break;
        case 'r': // filled rectangle
          ctx.beginPath()
          ctx.fillStyle = p.f
          ctx.fillRect(p.c[0][0], p.c[0][1], p.p[0], p.p[1])
          break;
        case 't': // text
          if (p.a) {
            ctx.globalAlpha = p.a
          } else {
            ctx.globalAlpha = 0.8
          }
          if (p.s) {
            ctx.strokeStyle = p.s
          } else {
            ctx.strokeStyle = "rgb(0,0,0)"
          }
          ctx.drawTextCenter(p.t[0], p.t[1], p.t[2], p.t[3], p.t[4])

          break;
        case 'b': // bezier
          ctx.beginPath()
          if (p.l) {
            ctx.lineWidth = p.l
          } else {
            ctx.lineWidth = 1
          }
          ctx.moveTo(p.c[0][0], p.c[0][1])
          ctx.bezierCurveTo(p.c[1][0], p.c[1][1], p.c[2][0], p.c[2][1], p.c[3][0], p.c[3][1])
          if (p.f) {
            ctx.fillStyle = p.f
            ctx.fill()
          }
          if (p.s) {
            ctx.strokeStyle = p.s
            ctx.stroke()
          }
          break;
        case 'i': // image
          ctx.putImageData(p.i, p.p[0], p.p[1])
          break;
        }
      }
      dLSort.sort(function (a, b) {
        if (a.z < b.z) {
          return 1
        } else {
          if (a.z > b.z) {
            return -1
          } else {
            return 0
          }
        }
      })
      for (i = 0; i < dLPreSort.length; i++) {
        cRender(dLPreSort[i])
      }
      for (i = 0; i < dLSort.length; i++) {
        cRender(dLSort[i])
      }
      for (i = 0; i < dLPostSort.length; i++) {
        cRender(dLPostSort[i])
      }

    }
    //----------------------------------------------------------------------
  var setLocationDrawStyles = function (p) {
      var tplLOC=tpl[LOC]
      fillTopology = p.hasOwnProperty(_fill) ? p[_fill] : tplLOC[_fill].v
      if(fillTopology!=_interior && fillTopology!=_border && fillTopology!=_both){
        setStatus("Descartes: value of property 'fill' should be <"+_both+">, <"+_interior+">, or <"+_border+">, scanning <"+fillTopology+">",true)
      } else {
      lineThicknessStyle = mrr(p.hasOwnProperty(_thickness) ? p[_thickness] : tplLOC[_thickness].v)
      if (fillTopology == _interior || fillTopology == _both) {
        fillStyle = "rgba(" +
          (p.hasOwnProperty(_fcol_r) ? Math.round(Math.min(255, p[_fcol_r])) : tplLOC[_fcol_r].v).toString() + "," +
          (p.hasOwnProperty(_fcol_g) ? Math.round(Math.min(255, p[_fcol_g])) : tplLOC[_fcol_g].v).toString() + "," +
          (p.hasOwnProperty(_fcol_b) ? Math.round(Math.min(255, p[_fcol_b])) : tplLOC[_fcol_b].v).toString() + "," +
          (p.hasOwnProperty(_fcol_a) ? p[_fcol_a] : tplLOC[_fcol_a].v).toString() + ")"
      }
      if (fillTopology == _border || fillTopology == _both) {
        strokeStyle = "rgb(" +
          (p.hasOwnProperty(_col_r) ? Math.round(Math.min(255, p[_col_r])) : tplLOC[_col_r].v).toString() + "," +
          (p.hasOwnProperty(_col_g) ? Math.round(Math.min(255, p[_col_g])) : tplLOC[_col_g].v).toString() + "," +
          (p.hasOwnProperty(_col_b) ? Math.round(Math.min(255, p[_col_b])) : tplLOC[_col_b].v).toString() + ")"
      }
      if (p.hasOwnProperty(_tag)) {
        textStyle = "rgb(" +
          (p.hasOwnProperty(_tcol_r) ? Math.round(Math.min(255, p[_tcol_r])) : tplLOC[_tcol_r].v).toString() + "," +
          (p.hasOwnProperty(_tcol_g) ? Math.round(Math.min(255, p[_tcol_g])) : tplLOC[_tcol_g].v).toString() + "," +
          (p.hasOwnProperty(_tcol_b) ? Math.round(Math.min(255, p[_tcol_b])) : tpl[LOC][_tcol_b].v).toString() + ")"
      }
      }
    }
    //----------------------------------------------------------------------
  var setEdgeDrawStyles = function (e) {
      var tplEDG=tpl[EDG]
      fillTopology = e.hasOwnProperty(_fill) ? e[_fill] : tplEDG[_fill].v
      if(fillTopology!=_interior && fillTopology!=_border && fillTopology!=_both){
        setStatus("Descartes: value of property 'fill' should be <"+_both+">, <"+_interior+">, or <"+_border+">, scanning <"+fillTopology+">",true)
      } else {
      lineThicknessStyle = mrr(e.hasOwnProperty(_thickness) ? e[_thickness] : tplEDG[_thickness].v)
      if (fillTopology == _interior || fillTopology == _both) {
        fillStyle = "rgba(" +
          (e.hasOwnProperty(_fcol_r) ? Math.round(Math.min(255, e[_fcol_r])) : tplEDG[_fcol_r].v).toString() + "," +
          (e.hasOwnProperty(_fcol_g) ? Math.round(Math.min(255, e[_fcol_g])) : tplEDG[_fcol_g].v).toString() + "," +
          (e.hasOwnProperty(_fcol_b) ? Math.round(Math.min(255, e[_fcol_b])) : tplEDG[_fcol_b].v).toString() + "," +
          (e.hasOwnProperty(_fcol_a) ? e[_fcol_a] : tplEDG[_fcol_a].v).toString() + ")"
      }
      if (fillTopology == _border || fillTopology == _both) {
        strokeStyle = "rgb(" +
          (e.hasOwnProperty(_col_r) ? Math.round(Math.min(255, e[_col_r])) : tplEDG[_col_r].v).toString() + "," +
          (e.hasOwnProperty(_col_g) ? Math.round(Math.min(255, e[_col_g])) : tplEDG[_col_g].v).toString() + "," +
          (e.hasOwnProperty(_col_b) ? Math.round(Math.min(255, e[_col_b])) : tplEDG[_col_b].v).toString() + ")"
      }
      if (e.hasOwnProperty(_tag)) {
        textStyle = "rgb(" +
          (e.hasOwnProperty(_tcol_r) ? Math.round(Math.min(255, e[_tcol_r])) : tplEDG[_tcol_r].v).toString() + "," +
          (e.hasOwnProperty(_tcol_g) ? Math.round(Math.min(255, e[_tcol_g])) : tplEDG[_tcol_g].v).toString() + "," +
          (e.hasOwnProperty(_tcol_b) ? Math.round(Math.min(255, e[_tcol_b])) : tplEDG[_tcol_b].v).toString() + ")"
      }
      }
    }
    //----------------------------------------------------------------------
  var setFaceDrawStyles = function (f) {
      var tplFCE=tpl[FCE]
      fillTopology = f.hasOwnProperty(_fill) ? f[_fill] : tplFCE[_fill].v
      if(fillTopology!=_interior && fillTopology!=_border && fillTopology!=_both){
        setStatus("Descartes: value of property 'fill' should be <"+_both+">, <"+_interior+">, or <"+_border+">, scanning <"+fillTopology+">",true)
      } else {
      lineThicknessStyle = mrr(f.hasOwnProperty(_thickness) ? f[_thickness] : tplFCE[_thickness].v)
      if (fillTopology == _border || fillTopology == _both) {
        strokeStyle = "rgb(" +
          (f.hasOwnProperty(_col_r) ? Math.round(Math.min(255, f[_col_r])) : tplFCE[_col_r].v).toString() + "," +
          (f.hasOwnProperty(_col_g) ? Math.round(Math.min(255, f[_col_g])) : tplFCE[_col_g].v).toString() + "," +
          (f.hasOwnProperty(_col_b) ? Math.round(Math.min(255, f[_col_b])) : tplFCE[_col_b].v).toString() + ")"
      }
      if (fillTopology == _interior || fillTopology == _both) {
        fillStyle = "rgba(" +
          (f.hasOwnProperty(_fcol_r) ? Math.round(Math.min(255, f[_fcol_r])) : tplFCE[_fcol_r].v).toString() + "," +
          (f.hasOwnProperty(_fcol_g) ? Math.round(Math.min(255, f[_fcol_g])) : tplFCE[_fcol_g].v).toString() + "," +
          (f.hasOwnProperty(_fcol_b) ? Math.round(Math.min(255, f[_fcol_b])) : tplFCE[_fcol_b].v).toString() + "," +
          (f.hasOwnProperty(_fcol_a) ? f[_fcol_a] : tplFCE[_fcol_a].v).toString() + ")"
      }
      }
    }
    //----------------------------------------------------------------------
  var doDraw = function (a, b) {
      var whatGraph = 0
      if (a.hasOwnProperty(_image)) whatGraph++
        if (a.hasOwnProperty(_geometry)) whatGraph++
          if (a.hasOwnProperty(_contour)) whatGraph++
            if (whatGraph == 0) {
              drawGeometry(a, b)
              return
            }
      if (whatGraph == 1) {
        if (a.hasOwnProperty(_image)) drawImage(a[_image])
        if (a.hasOwnProperty(_contour)) drawContour(a[_contour])
        if (a.hasOwnProperty(_geometry)) drawGeometry(a[_geometry], b)
        return
      }
      setStatus("Descartes: can only have one of 'image', 'contour' or 'geometry'", true)
      return
    }
    //-----------------------------------------------------------------------
  var drawImage = function (a) {
      checkProps(a,IMG)
      var mPresent = []
      var finalHeight = cH
      var finalWidth = cW
      var m=[]
      var allMaps=[_mapR,_mapG,_mapB,_mapA]
      for(var i=0;i<allMaps.length;i++){
        mPresent[i]=false
        if (a.hasOwnProperty(allMaps[i])) {
          if (a[allMaps[i]] instanceof Array) {
            if (a[allMaps[i]][0] instanceof Array) {
              finalHeight = Math.min(finalHeight, a[allMaps[i]].length)
              finalWidth = Math.min(finalWidth, a[allMaps[i]][0].length)
              mPresent[i] = true
              m[i] = a[allMaps[i]]
            } else {
              setStatus("Descartes: '"+allMaps[i]+"' property must be array of arrays", false)
            }
          } else {
            setStatus("Descartes: '"+allMaps[i]+"' property must be array", false)
          }
        }
      }
      var scalX = a.hasOwnProperty(_scaleX) ? a[_scaleX] : tpl[IMG][_scaleX].v
      var scalY = a.hasOwnProperty(_scaleY) ? a[_scaleY] : tpl[IMG][_scaleY].v
      scalX *= (cW / vpX)
      scalY *= (cH / vpY)
      var tplIMG = []
      for (var k in tpl[IMG]) {
        if (a.hasOwnProperty(k)) {
          tplIMG[k] = a[k]
        } else {
          tplIMG[k] = tpl[IMG][k].v
        }
      }
      finalWidth = Math.min(finalWidth, cW / scalX)
      finalHeight = Math.min(finalHeight, cH / scalY)
      var imgData = ctx.createImageData(scalX * finalWidth, scalY * finalHeight);
      var d = imgData.data;
      var run = 0;
      var iRun = 0;
      for (var yy = 0; yy < finalHeight; yy++) {
        var fromHere = run;
        for (var xx = 0; xx < finalWidth; xx++) {
          for (var xxx = 0; xxx < scalX; xxx++) {
            for(var cc=0;cc<4;cc++){
              d[run++] = mPresent[cc] ? (Math.round(m[cc][yy][xx])) : tplIMG[allMaps[cc]]
            }
          }
        }
        var toHere = run;
        for (var yyy = 0; yyy < scalY - 1; yyy++) {
          for (var iRun = fromHere; iRun < toHere; iRun++) {
            d[run++] = d[iRun];
          }
        }
      }
      dLPush({
        'w': 'i',
        'i': imgData,
        'p': [(cW - scalX * finalWidth) / 2, (cH - scalY * finalHeight) / 2]
      });

    }
    //-----------------------------------------------------------------------
  var drawContour = function (a) {
      checkProps(a,CTR)
      var i
      cTemplate = []
      contours = []
      if (a[_map]) {
        if (a[_map] instanceof Array) {
          if (a[_map][0] instanceof Array) {
            map = a[_map]
            var contourDataPresent = buildContourTemplate(a)
            if (contourDataPresent) {
              var cD = a[_data]
              if (cD instanceof Array) {
                fillInTemplateIntoContours(cD)
                processContours(a)
              } else {
                fillInTemplateIntoContours([cD])
                processContours(a)
              }
            } else {
              fillInTemplateIntoContours([clone(cTemplate)])
              processContours(a)
            }
          } else {
            setStatus("Descartes: property 'map' must be an array of arrays", false)
          }
        } else {
          setStatus("Descartes: property 'map' must be an array", false)
        }
      } else {
        setStatus("Descartes: in the plot type 'contour', you must specify a property 'map', being a 2-D array of function values. Otherwise there is nothing to define contour curves for.", false)
      }
      generateContourRenderings()
    }
    //-------------------------------------------------------------------------
  var fillInTemplateIntoContours = function (d) {
      checkProps(d,CTR)
      for (var i = 0; i < d.length; i++) {
        var cITemplate = new clone(cTemplate)
        contours.push(cITemplate)
        dealWithContoursDataArray(d[i])
        if (!contours[i].hasOwnProperty(_iso)) {
          setStatus("Descartes: every contour must have an iso-value; contour nr. " + i + " lacks iso-property", false)
          // we tacitly skip over this flaw
          contours[i][_iso] = tpl[CTR][_iso].v
        }
      }
    }
    //------------------------------------------------------------------------
  var processContours = function (a) {
      // see if we need to elongate the d-array - this is necessary if a nrLocations-property is set.
      if (statusReport == '') dealWithContourElongation(a)
        // see if we need to replace values for some of the properties in elements of the locations-array
      if (statusReport == '') dealWithContourIntp()
    }
    //------------------------------------------------------------------
  var dealWithContourElongation = function (a) {
      if (a.hasOwnProperty(_nrContours)) {
        while (a[_nrContours] > contours.length) {
          contours.push(clone(contours[contours.length - 1]))
          for (k in cTemplate) {
            contours[contours.length - 1][k] = cTemplate[k]
          }
        }
      } else {
        if (contours.length > 1) {
          a[_nrContours] = contours.length
        } else {
            a[_nrContours] = tpl[CTR][_nrContours].v
            while (a[_nrContours] > contours.length) {
              contours.push(clone(contours[contours.length - 1]))
              for (k in cTemplate) {
                contours[contours.length - 1][k] = cTemplate[k]
              }
            }

        }
      }
    }
    //-----------------------------------------------------------------------
  var dealWithContourIntp = function () {
      var i
      for (i = 0; i < contours.length; i++) {
        if (statusReport == '') {
          for (k in contours[i]) {
            if (k != _map) {
              if (contours[i][k] instanceof Object) {
                // this is not an atomic value: then it should be
                // the instruction to interpolate
                // In any case, there should be a property 'mode'
                if (contours[i][k].hasOwnProperty(_mode)) {
                  switch (contours[i][k][_mode]) {
                  case _intp:
                    var low = 0
                    var high = 100
                    if (contours[i][k].hasOwnProperty(_low)) {
                      low = contours[i][k][_low]
                    }
                    if (contours[i][k].hasOwnProperty(_high)) {
                      high = contours[i][k][_high]
                    }
                    contours[i][k] = low + i * (high - low) / (contours.length - 1)
                    break
                  case _random:
                    var low = 0
                    var high = 100
                    if (contours[i][k].hasOwnProperty(_low)) {
                      low = contours[i][k][_low]
                    }
                    if (contours[i][k].hasOwnProperty(_high)) {
                      high = contours[i][k][_high]
                    }
                    contours[i][k] = low + (high - low) * pRandom[(pRandomIndex++) % nrRandom]
                    break
                  default:
                    setStatus("Descartes: unknown value for 'mode':<" + contours[i][k][_mode] + "> for contour nr. " + i + ", for property " + k + ".\nValid modes for contours are 'intp' and 'random'.", false)
                    break
                  }
                } else {
                  setStatus("Descartes: expecting a property 'mode' for contour nr. " + i + ", property <" + k + ">.", false)
                }
              }
            }
          }
        }
      }
    }
    //------------------------------------------------------------------------
  var drawGeometry = function (a, b) {
      var i, k
      checkProps(a,GEO)
      lTemplate = []
      eTemplate = []
      fTemplate = []
      locations = []
      edges = []
      faces = []
      if (a.hasOwnProperty(_camera)) {
        camera = installCamera(a[_camera])
      } else {
        camera = clone(mainCamera)
      }
      if (a.hasOwnProperty(_lights)) {
        lights = installLights(a[_lights])
      } else {
        lights = clone(mainLights)
      }
      var locationDataPresent = buildLocationTemplate(a)
      var edgeDataPresent = buildEdgeTemplate(a)
      var faceDataPresent = buildFaceTemplate(a)
      if(a.hasOwnProperty(_edges) || a.hasOwnProperty(_faces)){
        tpl[LOC][_icon]=_none
      } else {
        tpl[LOC][_icon]=_bubble
      }
      if (a[_locations]) {
        skipCheck=a[_locations].hasOwnProperty(_skipCheck)?a[_locations].skipCheck:tpl[LOC][_skipCheck]
        if (locationDataPresent) {
          var vd = a[_locations][_data]
          if (vd instanceof Array) {
            if (vd.length > 0) {
              fillInTemplateIntoLocations(vd, true)
              processLocations(a, b)
            } else {
              fillInTemplateIntoLocations([vd], true)
              processLocations(a, b)
            }
          } else {
            //fillInTemplateIntoLocations([vd], true)
            //processLocations(a, b)
          }
        } else {
          // it is not forbidden to have no data (although this yields boring graphs)
          fillInTemplateIntoLocations([clone(lTemplate)], false)
          processLocations(a, b)
        }
        if (a[_edges]) {
          skipCheck=a[_edges].hasOwnProperty(_skipCheck)?a[_edges].skipCheck:tpl[EDG][_skipCheck]
          if (edgeDataPresent) {
            var ed = a[_edges][_data]
            if (ed instanceof Array) {
              if (ed.length > 0) {
                fillInTemplateIntoEdges(ed, true)
                processEdges(a, b)
              } else {
                fillInTemplateIntoEdges([ed], true)
                processEdges(a, b)
              }
            } else {
              fillInTemplateIntoEdges([ed], true)
              processEdges(a, b)
            }
          } else {
            fillInTemplateIntoEdges([clone(eTemplate)], false)
            processEdges(a, b)
          }
        }
        if (a[_faces]) {
          skipCheck=a[_faces].hasOwnProperty(_skipCheck)?a[_faces].skipCheck:tpl[FCE][_skipCheck]
          if (faceDataPresent) {
            var fd = a[_faces][_data]
            if (fd instanceof Array) {
              if (fd.length > 0) {
                fillInTemplateIntoFaces(fd, true)
                processFaces(a, b)
              } else {
                fillInTemplateIntoFaces([fd], true)
                processFaces(a, b)
              }
            } else {
              fillInTemplateIntoFaces([fd], true)
              processFaces(a, b)
            }
          } else {
            fillInTemplateIntoFaces([clone(fTemplate)], false)
            processFaces(a, b)
          }
        }
      }
      if (statusReport == '') {
        // now do the actual generation of location-icons
        if (a[_faces]) {
          generateFaceRenderings()
        }
        if (a[_edges]) {
          generateEdgeRenderings()
        }
        if(a[_locations]){
          generateLocationRenderings()
        }
      }
    }
    //-----------------------------------------------------------------------------
  var processLocations = function (a, b) {
      // see if we need to elongate the d-array - this is necessary if a nrLocations-property is set.
      if (statusReport == '') dealWithLocationElongation(a)
        // see if we need to replace values for some of the properties in elements of the locations-array
      if (statusReport == '') dealWithLocationShiftIntp(b)
        // make the backup
      if (statusReport == '') backUpLocationData(b)
        // deal with the _frac-property
      if (statusReport == '') dealWithFrac()
        // deal with the radar icon
      if (statusReport == '') dealWithRadar()
        // apply perspective transformation
      if (statusReport == '') applyPerspectiveProjection()
    }
    //---------------------------------------------------------------------------
  var processEdges = function (a, b) {
        // see if we need to replace values for some of the properties in elements of the edges-array
      if (statusReport == '') dealWithEdgeShiftIntp()
    }
    //---------------------------------------------------------------------------
  var processFaces = function (a, b) {
      // there is no special processing required for faces, unlike for locations
      // see if we need to replace values for some of the properties in elements of the edges-array
      if (statusReport == '') dealWithFaceShiftIntp()
    }
    //-----------------------------------------------------------------------------
  var fillInTemplateIntoLocations = function (d, dataPresent) {
  // we must check for the presence of x,y,(z) coordinates here, because
  // soon thre will be a perspective transformation. If we would postpone the check until the rendering
  // of the location, it would be too late to detect that x and or y and or z are missing.
      if (!dataPresent) {
        var vITemplate=new clone(lTemplate)
        locations.push(lTemplate)
        checkProps(locations[0],LOC)
          if ((!locations[0].hasOwnProperty(_x)) || (!locations[0].hasOwnProperty(_y))) {
            locations[0][_x] = tpl[LOC][_x].v
            locations[0][_y] = tpl[LOC][_y].v
          }
          if (camera[_perspective]) {
            if (!locations[0].hasOwnProperty(_z)) {
              locations[0][_z] = tpl[LOC][_z].v
            }
          }

      } else {
        for (var i = 0; i < d.length; i++) {
          var vITemplate = new clone(lTemplate)
          locations.push(vITemplate)
          checkProps(d[i],LOC)
          dealWithLocationsDataArray(d[i],i)
          if ((!locations[i].hasOwnProperty(_x)) || (!locations[i].hasOwnProperty(_y))) {
            locations[i][_x] = tpl[LOC][_x].v
            locations[i][_y] = tpl[LOC][_y].v
          }
          if (camera[_perspective]) {
            if (!locations[i].hasOwnProperty(_z)) {
              locations[i][_z] = tpl[LOC][_z].v
            }
          }
        }
      }
    }
    //-----------------------------------------------------------------------------
  var fillInTemplateIntoEdges = function (d, dataPresent) {
      //  if the edges array is still empty,
      // and if no b or e propreties are given, fill it with default deges.
      // that is one edge between any two subsequent locations.
      if (!dataPresent) {
        if(!d[0].hasOwnProperty(_b) && !d[0].hasOwnProperty(_e)){
          for (var i = 0; i < locations.length - 1; i++) {
            var eITemplate = new clone(d[0])
            // the reason for new here is, that otherwise all instances
            // of eITemplate, and therefore all elements of edges
            // stay entangled, that is: pointing to the
            // same variables (being the _b and _e attributes and
            // alll other shared attributes of edges. So updating the
            // _b or _e attribute of one edge changes them all.
            // This is because eITemplate is an object, and thus a bag of
            // pointers instead of an atomic variable.
            edges.push(eITemplate)
            dealWithEdgesDataArray(eITemplate,i)
          }
          for (i = 0; i < locations.length - 1; i++) {
            edges[i][_b] = i
            edges[i][_e] = i + 1
          }
        } else {
          // there is no data array, but the user wants a single edge.
            edges.push(d[0])
        }
        for(i=0;i<edges.length;i++){
          dealWithEdgesDataArray(edges[i],i)
        }
      } else {
        for (i = 0; i < d.length; i++) {
          var eITemplate = new clone(eTemplate)
          edges.push(eITemplate)
          checkProps(d[i],EDG)
          dealWithEdgesDataArray(d[i],i)
          if ((!edges[i].hasOwnProperty(_b)) || (!edges[i].hasOwnProperty(_e))) {
            setStatus("Descartes: every edge has to have begin (b) and end (e) properties; edge nr. " + i + " lacks b and/or e-property", false)
            // tacitly accept this flaw
            edges[i] = []
          }
        }
      }
    }
    //-----------------------------------------------------------------------------
  var fillInTemplateIntoFaces = function (d, dataPresent) {
      if (!dataPresent) {
      // if d has a proprety 'loop', we can produce a valid face.
        if(d[0].hasOwnProperty(_loop)){
          faces.push(d[0])
        } else {
          setStatus("Descartes: every face has to have loop property; encountered a face without a loop-property", false)
        }
      } else {
        for (var i = 0; i < d.length; i++) {
          var fITemplate = new clone(fTemplate)
          faces.push(fITemplate)
          checkProps(d[i],FCE)
          dealWithFacesDataArray(d[i],i)
          if ((!faces[i].hasOwnProperty(_loop))) {
            setStatus("Descartes: every face has to have loop property; face nr. " + i + " lacks loop-property", false)
          }
        }
      }
    }
    //----------------------------------------------------------------------------
  var buildContourTemplate = function (a) {
      checkProps(a,CTR)
      var dataPresent = false
      for (var k in a) {
        if (k != _data) {
      if(k!=_map){
            if (tpl[CTR].hasOwnProperty(k)) {
              cTemplate[k] = a[k]
            } else {
              setStatus("Descartes: property <" + k + "> is not recognized as a property of 'contour'. Valid properties are " + validProperties[CTR] + ".", true)
      }
          }
        } else {
          dataPresent = true
        }
      }
      return dataPresent
    }
    //----------------------------------------------------------------------------
  var buildLocationTemplate = function (a) {
      checkProps(a[_locations],LOC)
      var dataPresent = false
      for (var k in a[_locations]) {
        if (k != _data) {
          if (tpl[LOC].hasOwnProperty(k)) {
            lTemplate[k] = a[_locations][k]
          }
        } else {
          dataPresent = true
        }
      }
      return dataPresent
    }
    //----------------------------------------------------------------------------
  var buildEdgeTemplate = function (a) {
      checkProps(a[_edges],EDG)
      var dataPresent = false
      for (var k in a[_edges]) {
        if (k != _data) {
          if (tpl[EDG].hasOwnProperty(k)) {
            eTemplate[k] = a[_edges][k]
          }
        } else {
          dataPresent = true
        }
      }
      return dataPresent
    }
    //----------------------------------------------------------------------------
  var buildFaceTemplate = function (a) {
      checkProps(a[_faces],FCE)
      var dataPresent = false
      for (var k in a[_faces]) {
        if (k != _data) {
          if (tpl[FCE].hasOwnProperty(k)) {
            fTemplate[k] = a[_faces][k]
          }
        } else {
          dataPresent = true
        }
      }
      return dataPresent
    }
    //---------------------------------------------------------------------------
  var dealWithContoursDataArray = function (di) {
      if (di instanceof Object) {
        for (var k in di) {
          if (tpl[CTR].hasOwnProperty(k)) {
            if (!(di[k] instanceof Array)) {
              contours[contours.length - 1][k] = di[k]
            } else {
              setStatus("Descartes: values for properties in the 'data'-array of 'contour' must be atomic, scanning a compound value for property <" + k + ">.", false)
              // we choose to let this condition pass tacitly, as initial conditionsin ACCEL are difficult to control, and
              // an invalid index -error in ACCEL results in a value []
              contours[contours.length - 1][k] = tpl[CTR][k].v
            }
          } else {
            setStatus("Descartes: property <" + k + "> is not recognized as a property of 'contours'. Valid properties are " + validProperties[CTR] + ".", true)
          }
        }
      }
    }
    //---------------------------------------------------------------------------
  var dealWithLocationsDataArray = function (di,i) {
      if (di instanceof Object) {
        for (var k in di) {
          if (tpl[LOC].hasOwnProperty(k)) {
              locations[i][k] = di[k]
          }
        }
      }
    }
    //---------------------------------------------------------------------------
  var dealWithEdgesDataArray = function (ei,i) {
      if (ei instanceof Object) {
        for (var k in ei) {
          if (tpl[EDG].hasOwnProperty(k)) {
              edges[i][k] = ei[k]
          }
        }
      }
    }
    //---------------------------------------------------------------------------
  var dealWithFacesDataArray = function (fi,i) {
      if (fi instanceof Object) {
        for (k in fi) {
          if (tpl[FCE].hasOwnProperty(k)) {
              faces[i][k] = fi[k]
          }
        }
      }
    }
    //---------------------------------------------------------------------------
  var dealWithLocationElongation = function (a) {
      if (a[_locations].hasOwnProperty(_nrLocations)) {
        while (a[_locations][_nrLocations] > locations.length) {
          locations.push(clone(locations[locations.length - 1]))
          for (k in lTemplate) {
            locations[locations.length - 1][k] = lTemplate[k]
          }
        }
      } else {
        if (locations.length > 1) {
          a[_locations][_nrLocations] = locations.length
        } else {
            // the user has not provided a nrLocations-property. There is a dilemma now:
            // should we give only a single icon? That is good if the user wants a single icon - but if the user
            // wants a graph of some sort, the default of tpl[LOC][_nrLocations] should be used. How to tell which case applies?
            // Heuristic: if at least the x property or the y property is compound, that is: a form such as
            // [mode:'intp']  or ['mode':shift,value: ...], we assume that the user wants a
            // whole collection.
            var userWantsCollection=false
            if(a[_locations][_x]){
              if(a[_locations][_x] instanceof Object){
                userWantsCollection=true
              }
            }
            if(a[_locations][_y]){
              if(a[_locations][_y] instanceof Object){
                userWantsCollection=true
              }
            }
            a[_locations][_nrLocations] = userWantsCollection?tpl[LOC][_nrLocations].v:1
            while (a[_locations][_nrLocations] > locations.length) {
              locations.push(clone(locations[locations.length - 1]))
              for (k in lTemplate) {
                locations[locations.length - 1][k] = lTemplate[k]
              }
            }

        }
      }
    }
    //-------------------------------------------------------------------------
  var dealWithLocationShiftIntp = function (b) {
      var i
      for (i = 0; i < locations.length; i++) {
        if (statusReport == '') {
          for (k in locations[i]) {
            if (locations[i][k] instanceof Object) {
              // this is not an atomic value: then it should be
              // the instruction to interpolate or to shift
              // In any case, there should be a property 'mode'
              if (locations[i][k].hasOwnProperty(_mode)) {
                switch (locations[i][k][_mode]) {
                case _intp:
                  if (k != _icon && k != _tag && k != _fill) {
                    var low = 0
                    var high = 100
                    if (locations[i][k].hasOwnProperty(_low)) {
                      low = locations[i][k][_low]
                    }
                    if (locations[i][k].hasOwnProperty(_high)) {
                      high = locations[i][k][_high]
                    }
                    locations[i][k] = low + i * (high - low) / (locations.length - 1)
                  } else {
                    setStatus("Descartes: interpolation in locations is not allowed for properties 'tag', 'fill', and 'icon'", true)
                  }
                  break
                case _random:
                  if (k != _icon && k != _tag && k != _fill) {
                    var low = 0
                    var high = 100
                    if (locations[i][k].hasOwnProperty(_low)) {
                      low = locations[i][k][_low]
                    }
                    if (locations[i][k].hasOwnProperty(_high)) {
                      high = locations[i][k][_high]
                    }
                    locations[i][k] = low + (high - low) * pRandom[(pRandomIndex++) % nrRandom]
                  } else {
                    setStatus("Descartes: random assignment in locations is not allowed for properties 'tag', 'fill', and 'icon'", true)
                  }
                  break
                case _shift:
                if(i>=1){
                // b is the archive
                  if (b[_locations]) {
                    if (b[_locations][i - 1]) {
                      if (b[_locations][i - 1][k]) {
                        locations[i][k] = b[_locations][i - 1][k]
                      }
                    }
                  }
                } else {
                  if(locations[0][k].hasOwnProperty(_value)){
                    locations[0][k]=locations[0][k][_value]
                  }
                }
                break
                default:
                  setStatus("Descartes: unknown value for 'mode':<" + locations[i][k][_mode] + "> for location nr. " + i + ", for property " + k + ".\nValid modes for locations are 'intp', 'random', and 'shift'.", true)
                  break
                }
              } else {
                setStatus("Descartes: expecting a property 'mode' for location nr. " + i + ", property <" + k + ">.", false)
              }
            }
          }
        }
      }
    }
  //-------------------------------------------------------------------------
  var dealWithEdgeShiftIntp = function () {
      var i
      for (i = 0; i < edges.length; i++) {
        if (statusReport == '') {
          for (k in edges[i]) {
            if (edges[i][k] instanceof Object) {
              // this is not an atomic value: then it should be
              // the instruction to interpolate or to shift
              // In any case, there should be a property 'mode'
              if (edges[i][k].hasOwnProperty(_mode)) {
                switch (edges[i][k][_mode]) {
                case _intp:
                  if (k != _shape && k != _tag && k != _fill && k!=_b && k!=_e && k!=_bB && k!=_bB) {
                    var low = 0
                    var high = 100
                    if (edges[i][k].hasOwnProperty(_low)) {
                      low = edges[i][k][_low]
                    }
                    if (edges[i][k].hasOwnProperty(_high)) {
                      high = edges[i][k][_high]
                    }
                    edges[i][k] = low + i * (high - low) / (edges.length - 1)
                  } else {
                    setStatus("Descartes: interpolation in edges is not allowed for properties 'e', 'b', 'eB', 'bB', 'tag', 'fill', and 'shape'", true)
                  }
                  break
                case _random:
                  if (k != _shape && k != _tag && k != _fill  && k!=_b && k!=_e && k!=_bB && k!=_bB) {
                    var low = 0
                    var high = 100
                    if (edges[i][k].hasOwnProperty(_low)) {
                      low = edges[i][k][_low]
                    }
                    if (edges[i][k].hasOwnProperty(_high)) {
                      high = edges[i][k][_high]
                    }
                    edges[i][k] = low + (high - low) * pRandom[(pRandomIndex++) % nrRandom]
                  } else {
                    setStatus("Descartes: random assignment in edges is not allowed for properties 'tag', 'fill', and 'shape'", true)
                  }
                  break
                case _shift:
                  if(i>=1){
                    if (b[_edges]) {
                      if (b[_edges][i - 1]) {
                        if (b[_edges][i - 1][k]) {
                          edges[i][k] = b[_edges][i - 1][k]
                        }
                      }
                    }
                  } else {
                    if(edges[0][k].hasOwnProperty(_value)){
                      edges[0][k]=edges[0][k][_value]
                    }
                  }
                  break
                default:
                  setStatus("Descartes: unknown value for 'mode':<" + edges[i][k][_mode] + "> for edge nr. " + i + ", for property " + k + ".\nValid modes for edges are 'intp','random', and 'shift'.", true)
                  break
                }
              } else {
                setStatus("Descartes: expecting a property 'mode' for edge nr. " + i + ", property <" + k + ">.", false)
              }
            }
          }
        }
      }
    }
    //-------------------------------------------------------------------------
  var dealWithFaceShiftIntp = function () {
      var i
      for (i = 0; i < faces.length; i++) {
        if (statusReport == '') {
          for (k in faces[i]) {
            if (faces[i][k] instanceof Object && k!=_loop) {
              // this is not an atomic value: then it should be
              // the instruction to interpolate or to shift
              // In any case, there should be a property 'mode'
              if (faces[i][k].hasOwnProperty(_mode)) {
                switch (faces[i][k][_mode]) {
                case _intp:
                  if (k != _loop && k != _fill) {
                    var low = 0
                    var high = 100
                    if (faces[i][k].hasOwnProperty(_low)) {
                      low = faces[i][k][_low]
                    }
                    if (faces[i][k].hasOwnProperty(_high)) {
                      high = faces[i][k][_high]
                    }
                    faces[i][k] = low + i * (high - low) / (faces.length - 1)
                  } else {
                    setStatus("Descartes: interpolation in faces is not allowed for properties 'loop' and 'fill'", true)
                  }
                  break
                case _random:
                  if (k != _loop && k != _fill) {
                    var low = 0
                    var high = 100
                    if (faces[i][k].hasOwnProperty(_low)) {
                      low = faces[i][k][_low]
                    }
                    if (faces[i][k].hasOwnProperty(_high)) {
                      high = faces[i][k][_high]
                    }
                    faces[i][k] = low + (high - low) * pRandom[(pRandomIndex++) % nrRandom]
                  } else {
                    setStatus("Descartes: random assignment in faces is not allowed for properties 'loop' and 'fill'", true)
                  }
                  break
                case _shift:
                  if(i>=1){
                    if (b[_faces]) {
                      if (b[_faces][i - 1]) {
                        if (b[_faces][i - 1][k]) {
                          faces[i][k] = b[_faces][i - 1][k]
                        }
                      }
                    }
                  } else {
                    if(faces[0][k].hasOwnProperty(_value)){
                      faces[0][k]=faces[0][k][_value]
                    }
                  }
                  break
                default:
                  setStatus("Descartes: unknown value for 'mode':<" + faces[i][k][_mode] + "> for face nr. " + i + ", for property " + k + ".\nValid modes for faces are 'intp','random', and 'shift'.", true)
                  break
                }
              } else {
                setStatus("Descartes: expecting a property 'mode' for face nr. " + i + ", property <" + k + ">.", false)
              }
            }
          }
        }
      }
    }
    //------------------------------------------------------------------------
  var backUpLocationData = function (b) {
      var i
      if (!b[_locations]) {
        b[_locations] = []
      }
      for (i = 0; i < locations.length; i++) {
        if (!b[_locations][i]) {
          b[_locations][i] = []
        }
        for (k in locations[i]) {
          b[_locations][i][k] = locations[i][k]
        }
      }
    }
    //------------------------------------------------------------------------
  var dealWithRadar = function () {
      var i, radarArms = []
      for (i = 0; i < locations.length; i++) {
        if (locations[i][_icon] == _radar) {
          if (locations[i].hasOwnProperty(_rad)) {
            radarArms.push(i)
          } else {
            setStatur("Descartes: encountered icon 'radar' without property 'rad' in point nr. " + i + ".")
          }
        }
      }
      if (statusReport == '') {
        var curAng = 0
        if (radarArms.length > 0) {
          var angIncrement = twoPi / radarArms.length
          for (i = 0; i < radarArms.length; i++) {
            locations[radarArms[i]][_phi1] = curAng
            locations[radarArms[i]][_phi2] = curAng + angIncrement
            locations[radarArms[i]][_radAux] = locations[radarArms[(i + 1) % radarArms.length]][_rad]
            curAng += angIncrement
          }
        }
      }
    }
    //------------------------------------------------------------------------
  var dealWithFrac = function () {
      var i, totFrac = 0
      for (i = 0; i < locations.length; i++) {
        if (locations[i].hasOwnProperty(_frac)) {
          if (locations[i][_icon] == _sector) {
            totFrac += locations[i][_frac]
          } else {
            setStatus("Descartes: encountered property 'frac' in icon which is not 'sector' in point nr. " + i + ". Property 'frac' shall only be used in conjunction with icon-value 'sector'.", true)
          }
        }
      }
      totFrac /= twoPi
      var curAng = 0
      for (i = 0; i < locations.length; i++) {
        if (locations[i].hasOwnProperty(_frac)) {
          locations[i][_phi1] = curAng
          locations[i][_phi2] = locations[i][_phi1] + locations[i][_frac] / totFrac
          curAng = locations[i][_phi2]
        }
      }
    }
    //------------------------------------------------------------------------
  var applyPerspectiveProjection = function () {
      var i, vi
      if (camera[_perspective]) {
        for (i = 0; i < locations.length; i++) {
          locations[i][_x3] = locations[i][_x]
          locations[i][_y3] = locations[i][_y]
          locations[i][_z3] = locations[i][_z]
          var vi = locations[i]
          var aux = []
          for (k in vi) {
            if (transformProperties.indexOf(k) >= 0) {
              aux[k] = vi[k]
            }
          }
          var res = perspProj(vi[_x], vi[_y], vi[_z], aux)
          vi[_x] = res.x
          vi[_y] = res.y
          vi[_z] = res.z
          for (k in vi) {
            if (transformProperties.indexOf(k) >= 0) {
              vi[k] = res[k]
            }
          }
        }
      }
    }
    //------------------------------------------------------------------------
  var generateLocationRenderings = function () {
      var i, vi
      for (i = 0; i < locations.length; i++) {
        vi = locations[i]
        if(!vi.hasOwnProperty(_icon)){
          vi[_icon]=tpl[LOC][_icon]
        }
          // even if icon==_none,
          // we do the styles. Indeed, it might be that we want
          // to have just text placement.
          setLocationDrawStyles(vi)
          switch (vi[_icon]) {
          case _none:
            break;
          case _bubble:
            doBubble(vi)
            break
          case _box:
            doBox(vi)
            break
          case _hBar:
            doHBar(vi)
            break
          case _vBar:
            doVBar(vi)
            break
          case _triUp:
            doTriUp(vi)
            break
          case _triDown:
            doTriDown(vi)
            break
          case _diamond:
            doDiamond(vi)
            break;
          case _cross:
            doCross(vi)
            break;
          case _diagonalCross:
            doDiagonalCross(vi)
            break;
          case _sector:
            doSector(vi)
            break
          case _radar:
            doRadar(vi)
            break
          case _sprite:
            doSprite(vi)
          break
          default:
            setStatus("Descartes: unknown icon <" + locations[i][_icon] + "> in location nr. " + i + ".", true)
            break
          }
        placeTextNearLocation(vi)
      }
    }
    //-----------------------------------------------------------------------
  var generateEdgeRenderings = function () {
      var i, ei
      for (i = 0; i < edges.length; i++) {
        ei = edges[i]
        setEdgeDrawStyles(ei)
        if (ei[_shape]) {
          switch (ei[_shape]) {
          case _none:
            break
          case _line:
            doLine(ei)
            if (ei.hasOwnProperty(_arrows)) {
              doLineArrows(ei)
            }
            break
          case _bezier:
            // 3D beziers are not correctly supported. If we transform and map to 2D the vertices
            // then the resulting 2D vertices are not the control points for the
            // transformed bezier. Deviations are generally not very large though;
            // a future fix could be to do some subdivisions to make the difference
            // small enough to become unnoticeable.
            doBezier(ei)
            if (ei.hasOwnProperty(_arrows)) {
              doBezierArrows(ei)
            }
            break
          default:
            setStatus("Descartes: unknown shape <" + edges[i][_shape] + "> in edge nr. " + i + ".", true)
            break
          }
        } else {
          // when the shape-property is absent,we do the default rendition
          doLine(ei)
          if (ei.hasOwnProperty(_arrows)) {
            doLineArrows(ei)
          }
        }
        placeTextNearEdge(ei)
      }
    }
    //------------------------------------------------------------------------
  var generateFaceRenderings = function () {
      var i, fi
      for (i = 0; i < faces.length; i++) {
        fi = faces[i]
        setFaceDrawStyles(fi)
        doFace(fi)
      }
    }
    //-----------------------------------------------------------------------
  var placeTextNearLocation = function (vi) {
      if (vi[_tag]) {
        // figure out text placement. First the standard case:
        var textX = mrx((vi[_tagx] ? vi[_tagx] : tpl[LOC][_tagx].v) + vi[_x])
        var textY = mry((vi[_tagy] ? vi[_tagy] : tpl[LOC][_tagy].v) + vi[_y])
          // next text placement for sector or radar
        if (vi[_icon] == _sector || vi[_icon] == _radar) {
          if (vi.hasOwnProperty(_phi1)) {
            if (vi.hasOwnProperty(_phi2)) {
              if (vi.hasOwnProperty(_rad)) {
                if (vi[_icon] == _sector) {
                  var avPhi = (vi[_phi1] + vi[_phi2]) / 2
                } else {
                  var avPhi = vi[_phi1]
                }
                if (avPhi > onePi) {
                  avPhi -= twoPi
                }
                if (avPhi < -onePi) {
                  avPhi += twoPi
                }
                var corrR = vi[_rad] * 1.1
                if (avPhi >= -halfPi && avPhi < halfPi) {
                  textX = mrx(vi[_x] + corrR * Math.cos(avPhi) + TEXTWIDTHOFFSET)
                  textY = mry(vi[_y] - corrR * Math.sin(avPhi))
                } else {
                  textX = mrx(vi[_x] + corrR * Math.cos(avPhi) - TEXTWIDTHOFFSET)
                  textY = mry(vi[_y] - corrR * Math.sin(avPhi))
                }
              }
            }
          }
        }
        if (vi[_tag] != '') {
          dLPush({
            'w': 't',
            's': textStyle,
            'a': (vi.hasOwnProperty(_tcol_a) ? vi[_tcol_a] : tpl[LOC][_tcol_a].v),
            't': ['sans', mrr(vi[_pointSize] ? vi[_pointSize] : tpl[LOC][_pointSize].v), textX, textY, vi[_tag]]
          })
        }
      }
    }
    //-----------------------------------------------------------------------
  var placeTextNearEdge = function (ei) {
      if (ei.hasOwnProperty(_tag)) {
        if (locations[ei.b] && locations[ei.e]) {
          var lb = locations[ei.b]
          var le = locations[ei.e]
          var x = (lb[_x] + le[_x]) / 2
          var y = (lb[_y] + le[_y]) / 2
          if (ei[_tag]) {
            // figure out text placement.
            var textX = mrx((ei.hasOwnProperty(_tagx) ? ei[_tagx] : tpl[EDG][_tagx].v) + x)
            var textY = mry((ei.hasOwnProperty(_tagy) ? ei[_tagy] : tpl[EDG][_tagy].v) + y)
            if (ei[_tag] != '') {
              dLPush({
                'w': 't',
                's': textStyle,
                'a': (ei.hasOwnProperty(_tcol_a) ? ei[_tcol_a] : tpl[EDG][_tcol_a].v),
                't': ['sans', mrr(ei[_pointSize] ? ei[_pointSize] : tpl[EDG][_pointSize].v), textX, textY, ei[_tag]]
              })
            }
          }
        }
      }
    }
    //------------------------------------------------------------------------
  var doLineArrows = function (ei) {
      switch (ei[_arrows]) {
      case _begin:
      case _end:
      case _both:
      case _none:
        if (locations[ei.b] && locations[ei.e]) {
          var x1 = mrx(locations[ei.b][_x])
          var x2 = mrx(locations[ei.e][_x])
          var y1 = mry(locations[ei.b][_y])
          var y2 = mry(locations[ei.e][_y])
          if (locations[ei.b].hasOwnProperty(_z) && locations[ei.e].hasOwnProperty(_z)) {
            var z1 = locations[ei.b][_z]
            var z2 = locations[ei.e][_z]
          }
          if (ei[_arrows] == _begin || ei[_arrows] == _both) {
            var vHB = locations[ei.b].hasOwnProperty(_height) ? locations[ei.b][_height] : tpl[LOC][_height].v
            var vWB = locations[ei.b].hasOwnProperty(_width) ? locations[ei.b][_width] : tpl[LOC][_width].v
            drawArrow(x1, y1, z1, x2, y2, z2, vHB, vWB)
          }
          if (ei[_arrows] == _end || ei[_arrows] == _both) {
            var vHE = locations[ei.e].hasOwnProperty(_height) ? locations[ei.e][_height] : tpl[LOC][_height].v
            var vWE = locations[ei.e].hasOwnProperty(_width) ? locations[ei.e][_width] : tpl[LOC][_width].v
            drawArrow(x2, y2, z2, x1, y1, z1, vHE, vWE)
          }
        }
        break
      default:
        setStatus("Descartes: values for property 'arrows' must be 'begin', 'end', both', or 'none', scanning <" + ei[_arrows] + ">.", true)
        break
      }
    }
    //------------------------------------------------------------------------
  var doBezierArrows = function (ei) {
      switch (ei[_arrows]) {
      case _begin:
      case _end:
      case _both:
      case _none:
        var x0 = mrx(locations[ei.b][_x])
        var x3 = mrx(locations[ei.e][_x])
        var y0 = mry(locations[ei.b][_y])
        var y3 = mry(locations[ei.e][_y])
        if (locations[ei.b].hasOwnProperty(_z) && locations[ei.e].hasOwnProperty(_z)) {
          var z0 = locations[ei.b][_z]
          var z3 = locations[ei.e][_z]
        } else {
          var z0 = tpl[LOC][_z].v
          var z3 = tpl[LOC][_z].v
        }
        if (locations[ei.bB]) {
          var x1 = mrx(locations[ei.bB][_x])
          var y1 = mry(locations[ei.bB][_y])
          if (locations[ei.bB].hasOwnProperty(_z)) {
            var z1 = locations[ei.bB][_z]
          } else {
            var z1 = z0
          }
        } else {
          var x1 = x0
          var y1 = y0
          var z1 = z0
        }
        if (locations[ei.eB]) {
          var x2 = mrx(locations[ei.eB][_x])
          var y2 = mry(locations[ei.eB][_y])
          if (locations[ei.eB].hasOwnProperty(_z)) {
            var z2 = locations[ei.eB][_z]
          } else {
            var z2 = z3
          }
        } else {
          var x2 = x3
          var y2 = y3
          var z2 = z3
        }
        if (ei[_arrows] == _begin || ei[_arrows] == _both) {
          var vHB = locations[ei.b].hasOwnProperty(_height) ? locations[ei.b][_height] : tpl[LOC][_height].v
          var vWB = locations[ei.b].hasOwnProperty(_width) ? locations[ei.b][_width] : tpl[LOC][_width].v
          if (z1 && z2) {
            drawArrow(x0, y0, z0, x1, y1, z1, vHB, vWB)
          } else {
            drawArrow(x0, y0, x1, y1, vHB, vWB)
          }
        }
        if (ei[_arrows] == _end || ei[_arrows] == _both) {
          var vHE = locations[ei.e].hasOwnProperty(_height) ? locations[ei.e][_height] : tpl[LOC][_height].v
          var vWE = locations[ei.e].hasOwnProperty(_width) ? locations[ei.e][_width] : tpl[LOC][_width].v
          if (z1 && z2) {
            drawArrow(x3, y3, z3, x2, y2, z2, vHE, vWE)
          } else {
            drawArrow(x3, y3, x2, y2, vHE, vWE)
          }
        }
        break
      default:
        setStatus("Descartes: values for property 'arrows' must be 'begin', 'end', both', or 'none', scanning <" + ei[_arrows] + ">.", true)
        break
      }
    }
    //------------------------------------------------------------------------
  var doLine = function (e) {
      if (locations[e.b] && locations[e.e]) {
        var x1 = mrx(locations[e.b][_x])
        var x2 = mrx(locations[e.e][_x])
        var y1 = mry(locations[e.b][_y])
        var y2 = mry(locations[e.e][_y])
        if (locations[e.b].hasOwnProperty(_z) && locations[e.e].hasOwnProperty(_z)) {
          // offsetting z-values is a dirty hack to remedy the
          // unsolvable problem of mixing hidden line and hidden surface
          var z1 = locations[e.b][_z] - FUDGEZ
          var z2 = locations[e.e][_z] - FUDGEZ
          dLPush({
            'w': 'l',
            'z': (z1 + z2) / 2,
            's': strokeStyle,
            'l': lineThicknessStyle,
            'c': [
              [x1, y1],
              [x2, y2]
            ]
          })
        } else {
          dLPush({
            'w': 'l',
            's': strokeStyle,
            'l': lineThicknessStyle,
            'c': [
              [x1, y1],
              [x2, y2]
            ]
          })
        }
      } else {
        // we choose to let this reference error pass tacitly:
        // since initial conditions are difficult to control in ACCEL,
        // it might happen that a transient condition occurs where we have too few locations.
      }
    }
    //-------------------------------------------------------------------------
  var doBezier = function (e) {
      if (locations[e.b] && locations[e.e]) {
        var x0 = mrx(locations[e.b][_x])
        var x3 = mrx(locations[e.e][_x])
        var y0 = mry(locations[e.b][_y])
        var y3 = mry(locations[e.e][_y])
        if (locations[e.b].hasOwnProperty(_z) && locations[e.e].hasOwnProperty(_z)) {
          var z0 = locations[e.b][_z]
          var z3 = locations[e.e][_z]
        } else {
          var z0 = tpl[LOC][_z].v
          var z3 = tpl[LOC][_z].v
        }
        if (locations[e.bB]) {
          var x1 = mrx(locations[e.bB][_x])
          var y1 = mry(locations[e.bB][_y])
          if (locations[e.bB].hasOwnProperty(_z)) {
            var z1 = locations[e.bB][_z]
          } else {
            var z1 = z0
          }
        } else {
          var x1 = x0
          var y1 = y0
          var z1 = z0
        }
        if (locations[e.eB]) {
          var x2 = mrx(locations[e.eB][_x])
          var y2 = mry(locations[e.eB][_y])
          if (locations[e.eB].hasOwnProperty(_z)) {
            var z2 = locations[e.eB][_z]
          } else {
            var z2 = z3
          }
        } else {
          var x2 = x3
          var y2 = y3
          var z2 = z3
        }
        if (locations[e.b].hasOwnProperty(_z) && locations[e.e].hasOwnProperty(_z)) {
          dLPush({
            'w': 'b',
            'z': (z0 + z1 + z2 + z3) / 4,
            's': strokeStyle,
            'l': lineThicknessStyle,
            'c': [
              [x0, y0],
              [x1, y1],
              [x2, y2],
              [x3, y3]
            ]
          })
        } else {
          dLPush({
            'w': 'b',
            's': strokeStyle,
            'l': lineThicknessStyle,
            'c': [
              [x0, y0],
              [x1, y1],
              [x2, y2],
              [x3, y3]
            ]
          })
        }
      } else {
        // we choose to let this reference error pass tacitly:
        // since initial conditions are difficult to control in ACCEL,
        // it might happen that a transient condition occurs where we have too few locations.
      }
    }
    //--------------------------------------------------------------------------
  var calcIll = function (f, px, py, pz, nx, ny, nz) {
      var ANGLEFACTOR=150
      // this is a heuristic factor to scale the light intensity in dependene of the
      // opening angle in a spot light.
      var spotReduce=1
      // the reduction factor due to the light being focuessed in a beam
      var myR = f.hasOwnProperty(_fcol_r) ? f[_fcol_r] : tpl[FCE][_fcol_r].v
      var myG = f.hasOwnProperty(_fcol_g) ? f[_fcol_g] : tpl[FCE][_fcol_g].v
      var myB = f.hasOwnProperty(_fcol_b) ? f[_fcol_b] : tpl[FCE][_fcol_b].v
      var myA = f.hasOwnProperty(_fcol_a) ? f[_fcol_a] : tpl[FCE][_fcol_a].v
        // the diffuse reflected color of the surface
      var fcr = 0
      var fcg = 0
      var fcb = 0
        // the accumulated light color
      var lInX = 0
      var lInY = 0
      var lInZ = 0
        // the normalized incoming light direction, pointing towards the light source
      var distReduce = 1
        // reduction due to distance between light source and surface
        // for the diffuse part only, since the distance between the refelcting surface and the
        // doesn't play a role
      var distReduceSpec = 1
        // reduction due to distance along the light ray
        // since the light beam keeps diverging
        // before and after the reflection.
      for (var l = 0; l < lights.length; l++) {
        if (lights[l].hasOwnProperty(_l_px)) {
          // it is a point source or a spot source. So we have to take both distance and direction into account
          var dx = lights[l][_l_px] - px
          var dy = lights[l][_l_py] - py
          var dz = lights[l][_l_pz] - pz
          var dLen = Math.sqrt(dx * dx + dy * dy + dz * dz)
          lInX = dx / dLen
          lInY = dy / dLen
          lInZ = dz / dLen
          distReduce = vpM * vpM / (dLen * dLen)
          // we need to have a dimensionless factor. vpM is the 'average dimension' of the scene,
          // being derived from the canvas dimensions.
        } else {
          // it is a directional source
          lInX = -lights[l][_l_x]
          lInY = -lights[l][_l_y]
          lInZ = -lights[l][_l_z]
        }
        if (lights[l].hasOwnProperty(_l_open)) {
          var aOpen=Math.max(0.01,lights[l][_l_open])
          if (lights[l].hasOwnProperty(_l_dropOff)) {
            if (lights[l][_l_dropOff] > 0) {
              // it is a spot source with a finite opening angle
              // calculate the angle. Realize that both (lInX, lInY, lInZ) and the _l_x, _l_y, _l_z properties of lights[l] are normalized
              // Further, notice that lInX is pointing from the surface to the light source, whereas _l_x etc. point from the light source to
              // the surface.
              var dotAng = -lInX * lights[l][_l_x] + lInY * lights[l][_l_y] - lInZ * lights[l][_l_z]
              var actAng = Math.acos(dotAng)
                // good old Saxon Woods potential!
              spotReduce=1/(ANGLEFACTOR*aOpen*aOpen*(1 + Math.exp((actAng - aOpen) / lights[l][_l_dropOff])))
            } else {
              var dotAng = -lInX * lights[l][_l_x] + lInY * lights[l][_l_y] - lInZ * lights[l][_l_z]
              var actAng = Math.acos(dotAng)
                // good old Saxon Woods potential!
              if(actAng<aOpen){
                spotReduce=1/(ANGLEFACTOR*aOpen*aOpen)
              } else {
                spotReduce = 0
              }
            }
          }
        }
        // first add the contribution due to diffuse reflection
        var dot = nx * lInX + ny * lInY + nz * lInZ
        if (dot < 0) {
          dot = -dot
          nx = -nx
          ny = -ny
          nz = -nz
        }
        dot *=((distReduce*spotReduce)/onePi)
        // since n is normalized to 1/256 and lIn is normalized to 1, the dot is normalized to 1/256
        // The additional normalisation of 1/pi is for energy conservation; see
        // http://www.rorydriscoll.com/2009/01/25/energy-conservation-in-games/
        fcr += (dot * lights[l][_l_r] * myR)
        fcg += (dot * lights[l][_l_g] * myG)
        fcb += (dot * lights[l][_l_b] * myB)
        // should we add a specular contribution?
        // In that case, the user is responsible that the sum
        // of the reflection coefficients for diffuse
        // and specular doesn't exceed 256 (per channel) to
        // preserve energy conservation
        if (f.hasOwnProperty(_beta)) {
          if (f[_beta] >= 0) {
            var sr = f.hasOwnProperty(_scol_r) ? f[_scol_r] : 256
            var sg = f.hasOwnProperty(_scol_g) ? f[_scol_g] : 256
            var sb = f.hasOwnProperty(_scol_b) ? f[_scol_b] : 256
              // do specular term.
            var ex = camera[_eX] - px
            var ey = camera[_eY] - py
            var ez = camera[_eZ] - pz
            var eLen = Math.sqrt(ex * ex + ey * ey + ez * ez)
            //distReduceSpec=4*vpM * vpM / ((dLen+eLen) * (dLen+eLen))
            distReduceSpec=1
            ex /= eLen
            ey /= eLen
            ez /= eLen
            // this is the unit vector in the direction of the eye
            var hx = (ex + lInX) / 2
            var hy = (ey + lInY) / 2
            var hz = (ez + lInZ) / 2
              // this is the halfway direction (we use Blinn-Phong)
            var hLen = Math.sqrt(hx * hx + hy * hy + hz * hz) / 256.0
            hx /= hLen
            hy /= hLen
            hz /= hLen
            // this is the normalized halfway vector
            var hDotn = Math.abs(hx * nx - hy * ny + hz * nz)
            // notice the - sign for the ny component:
            // this again is a remaineder of the y-axis running down.
            if (hDotn > 0) {
              var spec = spotReduce*distReduceSpec*(f[_beta]+8) * Math.pow(hDotn, f[_beta]) / (8*256.0*onePi)
                // we adopt the convention that the color of the highlight is modulated by the
                // the reflection color of the surface. Remember that n is normalized to 1/256.
                // Since h is normalized to 256, the dot product is correctly normalized.
                // The additional factor (8+beta)/(8pi) comes from energy normalization
              fcr = spec * sr * lights[l][_l_r] + fcr
              fcg = spec * sg * lights[l][_l_g] + fcg
              fcb = spec * sb * lights[l][_l_b] + fcb
            }
          } else {
          }

        }
      }
      return "rgba(" + Math.round(fcr) + "," + Math.round(fcg) + "," + Math.round(fcb) + "," + myA.toString() + ")"
    }
    //--------------------------------------------------------------------------
  var doFace = function (f) {
      var MAXTRIALS = 20
      if (f.loop) {
        if (f.loop.length > 2) {
          if (camera[_perspective]) {
            if (fillTopology == _interior || fillTopology == _both) {
              if (lights) {
                var i = 0
                var norm = 0
                var trials = 0
                do {
                  // perhaps there are a few colinear locations, so we must be prepared to do several tries before
                  // we have three subsequent non-colinear ones.
                  // Also, if the two neighbours of i=0 happen to form a concave
                  // angle, the normal vector is oriented wrongly.
                  // A more stable method to compute the surface normal sould be to start in the
                  // centroid, and compute the average normal by form cross products for all pairs of subsequent
                  // 'spokes'. The is something for later.
                  var lIndex0 = f.loop[i]
                  var lIndex1 = f.loop[i + 1]
                  var lIndex2 = f.loop[i + 2]
                  if (locations[lIndex0] && locations[lIndex1] && locations[lIndex2]) {
                    var x0 = locations[lIndex0][_x3]
                    var y0 = locations[lIndex0][_y3]
                    var z0 = locations[lIndex0][_z3]
                    var x1 = locations[lIndex1][_x3]
                    var y1 = locations[lIndex1][_y3]
                    var z1 = locations[lIndex1][_z3]
                    var x2 = locations[lIndex2][_x3]
                    var y2 = locations[lIndex2][_y3]
                    var z2 = locations[lIndex2][_z3]
                    var dx1 = x1 - x0
                    var dy1 = y1 - y0
                    var dz1 = z1 - z0
                    var dx2 = x2 - x0
                    var dy2 = y2 - y0
                    var dz2 = z2 - z0
                    var nx = dy1 * dz2 - dz1 * dy2
                    var ny = dz1 * dx2 - dx1 * dz2
                    var nz = dx1 * dy2 - dy1 * dx2
                    norm = 256.0 * Math.sqrt(nx * nx + ny * ny + nz * nz)
                  } else {
                    // this is an emergency: some locations are not defined. Provide a default normal vector
                    // in order not to frustrrate the rest of the algorithm
                    nx = 0
                    ny = 1
                    nz = 0
                    norm = 1
                  }
                  trials++
                } while (norm == 0 && trials < MAXTRIALS)
                nx /= norm
                ny /= norm
                nz /= norm
                fillStyle = calcIll(f, x0, y0, z0, nx, ny, nz)
              }
            }
          }
          var cPars = []
          var zAvg = 0
          var nLocs = 0
          for (var i = 0; i < f.loop.length; i++) {
            if (locations[f.loop[i]]) {
              cPars.push([mrx(locations[f.loop[i]][_x]), mry(locations[f.loop[i]][_y])])
              zAvg += locations[f.loop[i]][_z]
              nLocs++
            }
          }
          zAvg /= nLocs
          renderAllCases(cPars, zAvg)
        }
      }
    }
    //-----------------------------------------------------------------------
  var doRadar = function (p) {
      var xx1 = mrx(p[_x] + p[_rad] * Math.cos(p[_phi1]))
      var yy1 = mry(p[_y] - p[_rad] * Math.sin(p[_phi1]))
      var xx2 = mrx(p[_x] + p[_radAux] * Math.cos(p[_phi2]))
      var yy2 = mry(p[_y] - p[_radAux] * Math.sin(p[_phi2]))
      if (p.hasOwnProperty(_z)) {
        dLPush({
          'w': 'l',
          'z': p[_z],
          's': strokeStyle,
          'l': lineThicknessStyle,
          'c': [
            [xx1, yy1],
            [xx2, yy2]
          ]
        })
      } else {
        dLPush({
          'w': 'l',
          's': strokeStyle,
          'l': lineThicknessStyle,
          'c': [
            [xx1, yy1],
            [xx2, yy2]
          ]
        })
      }
    }
    //-----------------------------------------------------------------------
  var doSector = function (p) {
      var pPars = [mrr(p.hasOwnProperty(_rad) ? p[_rad] : tpl[LOC][_rad].v), p.hasOwnProperty(_phi1) ? p[_phi1] : tpl[LOC][_phi1].v, p.hasOwnProperty(_phi2) ? p[_phi2] : tpl[LOC][_phi2].v, false]
      var cPars = [
        [mrx(p[_x]), mry(p[_y])]
      ]
      if (p.hasOwnProperty(_z)) {
        if (fillTopology == _interior) {
          dLPush({
            'w': 'a',
            'z': p[_z],
            'f': fillStyle,
            'c': cPars,
            'p': pPars
          })
        } else {
          if (fillTopology == _border) {
            dLPush({
              'w': 'a',
              'z': p[_z],
              's': strokeStyle,
              'c': cPars,
              'l': lineThicknessStyle,
              'p': pPars
            })
          } else {
            dLPush({
              'w': 'a',
              'z': p[_z],
              's': strokeStyle,
              'f': fillStyle,
              'c': cPars,
              'l': lineThicknessStyle,
              'p': pPars
            })
          }
        }
      } else {
        if (fillTopology == _interior) {
          dLPush({
            'w': 'a',
            'f': fillStyle,
            'c': cPars,
            'p': pPars
          })
        } else {
          if (fillTopology == _border) {
            dLPush({
              'w': 'a',
              's': strokeStyle,
              'c': cPars,
              'l': lineThicknessStyle,
              'p': pPars
            })
          } else {
            dLPush({
              'w': 'a',
              's': strokeStyle,
              'f': fillStyle,
              'c': cPars,
              'l': lineThicknessStyle,
              'p': pPars
            })
          }
        }
      }
    }
    // ----------------------------------------------------------------------
  var doSprite=function(p){
  // notice: this icon uses the spriteData property if present.
  // spriteData passes a compound argument at descartes level
  // directly to html-level without checking for structural correctness.
  // This means that all sorts of non-caught runtime exceptions may occur
  // e.g. if the argument vector for _spriteData is not well-formed.
  // At some later point we should provide error checking here!
  // Also, it has not been checked what happens if the spriteData feature is passed at global level (i.e., not as a property of each individual
  // icon, but as a collection of icons. Will it be copied correctly to each individual icon? I doubt it. So be prepared
  // for unexcpeted visuals or uncaught runtime exception with liberal use of _sprite.
  //
  var ww = Math.abs(mrx(p.hasOwnProperty(_width) ? p[_width] : tpl[LOC][_width].v))
  var hh = Math.abs(mryRel(p.hasOwnProperty(_height) ? p[_height] : tpl[LOC][_height].v))
  // ww and hh are the dimensions the sprite should have in the canvas
  var sD = p.hasOwnProperty(_spriteData) ? p[_spriteData] : tpl[LOC][_spriteData].v
  var w = sD[0].length
  var h = sD.length
  // w and h are the dimensions of the provided sprite data
  var fw=w/ww
  var fh=h/hh
  var imgData = ctx.createImageData(ww,hh);
  var d=imgData.data;
  var run = 0;
    for (var yy = 0; yy < hh; yy++) {
      var py=Math.floor(yy*fh)
      for (var xx = 0; xx < ww; xx++) {
        var px=Math.floor(xx*fw)
        for(var cc=0;cc<4;cc++){
          d[run++] = sD[py][px][cc]
        }
      }
    }
  if(p.hasOwnProperty(_z)){
    dLPush({
        'z': p[_z],
        'w': 'i',
        'i': imgData,
        'p': [mrx(p[_x])-ww/2,mry(p[_y])-hh/2]
    });
  } else {
    dLPush({
        'w': 'i',
        'i': imgData,
        'p': [mrx(p[_x])-ww/2,mry(p[_y])-hh/2]
    });
  }
}
    //-----------------------------------------------------------------------
  var doBubble = function (p) {
  // notice: the gradient feature passes a compound argument at descartes level
  // directly to html-level without checking for structural correctness.
  // This means that all sorts of non-caught runtime exceptions may occur
  // e.g. if the argument vector for _grad is not well-formed.
  // At some later point we should provide error checking here!
  // Also, it has not been checked what happens if the gradient feature is passed at global level (i.e., not as a property of each individual
  // icon, but as a collection of icons. Will it be copied correctly to each individual icon? I doubt it. So be prepared
  // for unexcpeted visuals or uncaught runtime exception with liberal use of _grad.
      var pPars = [mrr(p.hasOwnProperty(_rad) ? p[_rad] : tpl[LOC][_rad].v), 0, twoPi, false]
      var cPars = [
        [mrx(p[_x]), mry(p[_y])]
      ]
      if(p.hasOwnProperty(_grad)){
        try{
          var bubbleFillStyle=ctx.createRadialGradient(cPars[0][0]+mrx(p[_grad][0]),cPars[0][1]+mryRel(p[_grad][1]),mrr(p[_grad][2]),cPars[0][0]+mrx(p[_grad][3]),cPars[0][1]+mryRel(p[_grad][4]),mrr(p[_grad][5]))
          var nrStops=p[_grad][6].length
          for(var i=0;i<nrStops;i++){
            bubbleFillStyle.addColorStop(p[_grad][6][i][0],'rgba(' +p[_grad][6][i][1] + ',' + p[_grad][6][i][2] + ',' + p[_grad][6][i][3] + ',' + p[_grad][6][i][4] + ')')
          }
        } catch(err){
          setStatus("gradient caused error; error msg="+err,false)
        }
      } else {
        bubbleFillStyle=fillStyle
      }
      if (p.hasOwnProperty(_z)) {
        if (fillTopology == _interior) {
          dLPush({
            'w': 'a',
            'z': p[_z],
            'f': bubbleFillStyle,
            'c': cPars,
            'p': pPars
          })
        } else {
          if (fillTopology == _border) {
            dLPush({
              'w': 'a',
              'z': p[_z],
              's': strokeStyle,
              'c': cPars,
              'l': lineThicknessStyle,
              'p': pPars
            })
          } else {
            dLPush({
              'w': 'a',
              'z': p[_z],
              's': strokeStyle,
              'f': bubbleFillStyle,
              'c': cPars,
              'l': lineThicknessStyle,
              'p': pPars
            })
          }
        }
      } else {
        if (fillTopology == _interior) {
          dLPush({
            'w': 'a',
            'f': bubbleFillStyle,
            'c': cPars,
            'p': pPars
          })
        } else {
          if (fillTopology == _border) {
            dLPush({
              'w': 'a',
              's': strokeStyle,
              'c': cPars,
              'l': lineThicknessStyle,
              'p': pPars
            })
          } else {
            dLPush({
              'w': 'a',
              's': strokeStyle,
              'f': bubbleFillStyle,
              'c': cPars,
              'l': lineThicknessStyle,
              'p': pPars
            })
          }
        }
      }
    }
    //-----------------------------------------------------------------------
  var doBox = function (p) {
      var w = p.hasOwnProperty(_width) ? p[_width] : tpl[LOC][_width].v
      var h = p.hasOwnProperty(_height) ? p[_height] : tpl[LOC][_height].v
      var xLeft = mrx(p[_x] - w / 2)
      var xRght = mrx(p[_x] + w / 2)
      var yLow = mry(p[_y] - h / 2)
      var yHigh = mry(p[_y] + h / 2)
      var cPars = [
        [xLeft,yLow],
        [xLeft,yHigh],
        [xRght,yHigh],
        [xRght,yLow],
        [xLeft,yLow]
      ]
      renderAllCases(cPars, p.hasOwnProperty(_z) ? p[_z] : tpl[LOC][_z].v)
    }
    //-----------------------------------------------------------------------
  var doVBar = function (p) {
      var w = p.hasOwnProperty(_width) ? p[_width] : tpl[LOC][_width].v
      var h = p.hasOwnProperty(_height) ? p[_height] : tpl[LOC][_height].v
      var xLeft = mrx(p[_x] - w / 2)
      var xRght = mrx(p[_x] + w / 2)
      var yLow = mry(p[_y])
      var yHigh = mry(p[_y] + h)
      var cPars = [
        [xLeft,yLow],
        [xLeft,yHigh],
        [xRght,yHigh],
        [xRght,yLow],
        [xLeft,yLow]
      ]
      renderAllCases(cPars, p.hasOwnProperty(_z) ? p[_z] : tpl[LOC][_z].v)
    }
    //-----------------------------------------------------------------------
  var doHBar = function (p) {
      var w = p.hasOwnProperty(_width) ? p[_width] : tpl[LOC][_width].v
      var h = p.hasOwnProperty(_height) ? p[_height] : tpl[LOC][_height].v
      var xLeft = mrx(p[_x])
      var xRght = mrx(p[_x] + w)
      var yLow = mry(p[_y]-h/2)
      var yHigh = mry(p[_y] + h/2)
      var cPars = [
        [xLeft,yLow],
        [xLeft,yHigh],
        [xRght,yHigh],
        [xRght,yLow],
        [xLeft,yLow]
      ]
      renderAllCases(cPars, p.hasOwnProperty(_z) ? p[_z] : tpl[LOC][_z].v)
    }
    //-----------------------------------------------------------------------
  var doTriUp = function (p) {
      var w = p.hasOwnProperty(_width) ? p[_width] : tpl[LOC][_width].v
      var h = p.hasOwnProperty(_height) ? p[_height] : tpl[LOC][_height].v
      var xLeft = mrx(p[_x] - w / 2)
      var xRght = mrx(p[_x] + w / 2)
      var yLow = mry(p[_y] - h / 2)
      var yHigh = mry(p[_y] + h / 2)
      var cPars = [
        [xLeft, yLow],
        [xRght, yLow],
        [(xLeft + xRght) / 2, yHigh],
        [xLeft, yLow]
      ]
      renderAllCases(cPars, p.hasOwnProperty(_z) ? p[_z] : tpl[LOC][_z].v)
    }
    //-----------------------------------------------------------------------
  var doTriDown = function (p) {
      var w = p.hasOwnProperty(_width) ? p[_width] : tpl[LOC][_width].v
      var h = p.hasOwnProperty(_height) ? p[_height] : tpl[LOC][_height].v
      var xLeft = mrx(p[_x] - w / 2)
      var xRght = mrx(p[_x] + w / 2)
      var yLow = mry(p[_y] - h / 2)
      var yHigh = mry(p[_y] + h / 2)
      var cPars = [
        [xLeft, yHigh],
        [xRght, yHigh],
        [(xLeft + xRght) / 2, yLow],
        [xLeft, yHigh]
      ]
      renderAllCases(cPars, p.hasOwnProperty(_z) ? p[_z] : tpl[LOC][_z].v)
    }
    //-----------------------------------------------------------------------
  var doDiamond = function (p) {
      var w = p.hasOwnProperty(_width) ? p[_width] : tpl[LOC][_width].v
      var h = p.hasOwnProperty(_height) ? p[_height] : tpl[LOC][_height].v
      var xLeft = mrx(p[_x] - w / 2)
      var xRght = mrx(p[_x] + w / 2)
      var yLow = mry(p[_y] - h / 2)
      var yHigh = mry(p[_y] + h / 2)
      var cPars = [
        [xLeft, (yHigh + yLow) / 2],
        [(xLeft + xRght) / 2, yLow],
        [xRght, (yHigh + yLow) / 2],
        [(xLeft + xRght) / 2, yHigh],
        [xLeft, (yHigh + yLow) / 2]
      ]
      renderAllCases(cPars, p.hasOwnProperty(_z) ? p[_z] : tpl[LOC][_z].v)

    }
    //-----------------------------------------------------------------------
  var doCross = function (p) {
      var w = p.hasOwnProperty(_width) ? p[_width] : tpl[LOC][_width].v
      var h = p.hasOwnProperty(_height) ? p[_height] : tpl[LOC][_height].v
      var xLeft = mrx(p[_x] - w / 2)
      var xRght = mrx(p[_x] + w / 2)
      var yLow = mry(p[_y] - h / 2)
      var yHigh = mry(p[_y] + h / 2)
      var cPars1 = [
        [xLeft, (yHigh + yLow) / 2],
        [xRght, (yHigh + yLow) / 2]
      ]
      var cPars2 = [
        [(xLeft + xRght) / 2, yLow],
        [(xLeft + xRght) / 2, yHigh]
      ]
      if (camera[_perspective]) {
        dLPush({
          'w': 'l',
          'z': p[_z],
          's': strokeStyle,
          'l': lineThicknessStyle,
          'c': cPars1
        })
        dLPush({
          'w': 'l',
          'z': p[_z],
          's': strokeStyle,
          'l': lineThicknessStyle,
          'c': cPars2
        })
      } else {
        dLPush({
          'w': 'l',
          's': strokeStyle,
          'l': lineThicknessStyle,
          'c': cPars1
        })
        dLPush({
          'w': 'l',
          's': strokeStyle,
          'l': lineThicknessStyle,
          'c': cPars2
        })
      }
    }
    //-----------------------------------------------------------------------
  var doDiagonalCross = function (p) {
      var w = p.hasOwnProperty(_width) ? p[_width] : tpl[LOC][_width].v
      var h = p.hasOwnProperty(_height) ? p[_height] : tpl[LOC][_height].v
      var xLeft = mrx(p[_x] - w / 2)
      var xRght = mrx(p[_x] + w / 2)
      var yLow = mry(p[_y] - h / 2)
      var yHigh = mry(p[_y] + h / 2)
      var cPars1 = [
        [xLeft, yHigh],
        [xRght, yLow]
      ]
      var cPars2 = [
        [xLeft, yLow],
        [xRght, yHigh]
      ]
      if (camera[_perspective]) {
        dLPush({
          'w': 'l',
          'z': p[_z],
          's': strokeStyle,
          'l': lineThicknessStyle,
          'c': cPars1
        })
        dLPush({
          'w': 'l',
          'z': p[_z],
          's': strokeStyle,
          'l': lineThicknessStyle,
          'c': cPars2
        })
      } else {
        dLPush({
          'w': 'l',
          's': strokeStyle,
          'l': lineThicknessStyle,
          'c': cPars1
        })
        dLPush({
          'w': 'l',
          's': strokeStyle,
          'l': lineThicknessStyle,
          'c': cPars2
        })
      }
    }
    //------------------------------------------------------------------------
  var perspProj = function (x, y, z, aux) {
      // a point with coordinates corresponding to the center of the screen should stay there.
      // aux may contain additional metric quantities, such as radii, heights or widths.
      // These are transformed as well.
      var r = {
        'x': 0,
        'y': 0,
        'z': 0
      }
      var dx = x - camera.eX
      var dy = y - camera.eY
      var dz = z - camera.eZ
      var txDot = dx * camera.hX + dy * camera.hY + dz * camera.hZ
      var tyDot = dx * camera.vX + dy * camera.vY + dz * camera.vZ
      var tzDot = dx * camera.kX + dy * camera.kY + dz * camera.kZ
      var s = camera.f / tzDot
      var factor = camera.f / Math.sqrt(dx * dx + dy * dy + dz * dz)
      r.x = vpX2 + s * txDot
      r.y = vpY2 + s * tyDot
      r.z = tzDot
      for (var k in aux) {
        r[k] = factor * aux[k]
      }
      return r
    }
    //----------------------------------------------------------------------
  var drawArrow = function (x1, y1, z1, x2, y2, z2, l, w) {
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
        var cPars = [
          [x1, y1],
          [x3 + x4, y3 + y4],
          [x3 - x4, y3 - y4],
          [x1, y1]
        ]
        renderAllCases(cPars, (z1 + z2) / 2)

      }
    }
    //-----------------------------------------------------------------------
  var renderAllCases = function (cPars, z) {
      if (camera[_perspective]) {
        if (fillTopology == _interior) {
          dLPush({
            'w': 'l',
            'z': z,
            'f': fillStyle,
            'c': cPars
          })
        } else {
          if (fillTopology == _border) {
            dLPush({
              'w': 'l',
              'z': z,
              's': strokeStyle,
              'l': lineThicknessStyle,
              'c': cPars
            })
          } else {
            dLPush({
              'w': 'l',
              'z': z,
              's': strokeStyle,
              'l': lineThicknessStyle,
              'f': fillStyle,
              'c': cPars
            })
          }
        }


      } else {
        if (fillTopology == _interior) {
          dLPush({
            'w': 'l',
            'f': fillStyle,
            'c': cPars
          })
        } else {
          if (fillTopology == _border) {
            dLPush({
              'w': 'l',
              's': strokeStyle,
              'l': lineThicknessStyle,
              'c': cPars
            })
          } else {
            dLPush({
              'w': 'l',
              's': strokeStyle,
              'l': lineThicknessStyle,
              'f': fillStyle,
              'c': cPars
            })
          }
        }
      }
    }
    //----------------------------------------------------------------------
  var generateContourRenderings = function () {
      var mask = 0
      var ww = cW / (map.length - 1)
      var hh = cH / (map[0].length - 1)
      for (var k = 0; k < contours.length; k++) {
        if (contours[k].hasOwnProperty(_col_r)) {
          contours[k][_col_r] = Math.round(contours[k][_col_r])
        }
        if (contours[k].hasOwnProperty(_col_g)) {
          contours[k][_col_g] = Math.round(contours[k][_col_g])
        }
        if (contours[k].hasOwnProperty(_col_b)) {
          contours[k][_col_b] = Math.round(contours[k][_col_b])
        }
      }
      for (var i = 0; i < map.length - 1; i++) {
        for (var j = 0; j < map[0].length - 1; j++) {
          for (k = 0; k < contours.length; k++) {
            mask = 0
            var strokeStyle = "rgb(" + (contours[k].hasOwnProperty(_col_r) ? contours[k][_col_r] : tpl[CTR][_col_r].v).toString() + "," + (contours[k].hasOwnProperty(_col_g) ? contours[k][_col_g] : tpl[CTR][_col_g].v).toString() + "," + (contours[k].hasOwnProperty(_col_b) ? contours[k][_col_b] : tpl[CTR][_col_b].v).toString() + ")";
            var lineThickness = contours[k].hasOwnProperty(_thickness) ? contours[k][_thickness] : tpl[CTR][_thickness].v
            if (map[i][j] > contours[k].iso) mask += 1
            if (map[i + 1][j] > contours[k].iso) mask += 2
            if (map[i + 1][j + 1] > contours[k].iso) mask += 4
            if (map[i][j + 1] > contours[k].iso) mask += 8
            switch (mask) {
            case 0:
            case 15:
              break
            case 1:
            case 14:
              mCLine(contours[k].iso, ww, hh, strokeStyle, lineThickness, i, j, i + 1, j, i, j, i, j + 1)
              break
            case 2:
            case 13:
              mCLine(contours[k].iso, ww, hh, strokeStyle, lineThickness, i + 1, j, i, j, i + 1, j, i + 1, j + 1)
              break
            case 3:
            case 12:
              mCLine(contours[k].iso, ww, hh, strokeStyle, lineThickness, i, j, i, j + 1, i + 1, j, i + 1, j + 1)
              break
            case 4:
            case 11:
              mCLine(contours[k].iso, ww, hh, strokeStyle, lineThickness, i + 1, j + 1, i + 1, j, i + 1, j + 1, i, j + 1)
              break
            case 5:
            case 10:
              mCLine(contours[k].iso, ww, hh, strokeStyle, lineThickness, i, j, i + 1, j, i, j, i, j + 1)
              mCLine(contours[k].iso, ww, hh, strokeStyle, lineThickness, i + 1, j + 1, i + 1, j, i + 1, j + 1, i, j + 1)
              break
            case 6:
            case 9:
              mCLine(contours[k].iso, ww, hh, strokeStyle, lineThickness, i, j, i + 1, j, i, j + 1, i + 1, j + 1)
              break
            case 7:
            case 8:
              mCLine(contours[k].iso, ww, hh, strokeStyle, lineThickness, i, j + 1, i, j, i, j + 1, i + 1, j + 1)
              break;
            }
          }
        }
      }
    }
    //---------------------------------------------------------------------
  var mCLine = function (iso, ww, hh, ss, lw, i1, j1, i2, j2, i3, j3, i4, j4) {
      var x1 = i1 * ww
      var x2 = i2 * ww
      var y1 = cH - j1 * hh
      var y2 = cH - j2 * hh
      var x3 = i3 * ww
      var x4 = i4 * ww
      var y3 = cH - j3 * hh
      var y4 = cH - j4 * hh
      var delta12 = map[i2][j2] - map[i1][j1]
      var delta34 = map[i4][j4] - map[i3][j3]
      var x12 = x1 + (x2 - x1) * (iso - map[i1][j1]) / delta12
      var y12 = y1 + (y2 - y1) * (iso - map[i1][j1]) / delta12
      var x34 = x3 + (x4 - x3) * (iso - map[i3][j3]) / delta34
      var y34 = y3 + (y4 - y3) * (iso - map[i3][j3]) / delta34
      dLPush({
        'w': 'l',
        's': ss,
        'l': lw,
        'c': [
          [x12, y12],
          [x34, y34]
        ]
      })
    }
    //-----------------------------------------------------------------------
  this.getStatusReport = function () {
    return statusReport;
  }
  //-------------------------------------------------------------------------
  this.makeHelpSystem = function (f) {
    // complement all properties with one additional property, namely the list of all valid proprty names
    for(var i=0;i<NRDESCARTESPROPS;i++){
      tpl[i][_allProps] = {
      'e': 'all properties',
      'd': 'All valid properties for ' + DESCARTESTM + '-concept "'+tplNames[i]+'" are: ' + validProperties[i],
      'p':tplNames[i]
      }
    }
    for (var i = 0; i < allTemplates.length; i++) {
      var tplI = allTemplates[i]
      for (var k in tplI) {
        var seeAlso = ''
        if (tplI[k].hasOwnProperty("a")) {
          for (var j = 0; j < tplI[k].a.length; j++) {
            seeAlso += (tplI[k].a[j] + ",")
          }
        }
        f.push({
          fName: k + ' (Descartes)'+'    <span class="tinyScript">property of concept "' + tplI[k].p + '"</span>',
          cat: "Descartes",
          help: tplI[k].e,
          autoMapping: "not supported",
          example: tplI[k].hasOwnProperty("x") ? tplI[k].x : "--",
          details: tplI[k].hasOwnProperty("d") ? tplI[k].d : "--",
          seeAlso: seeAlso,
          external: "",
          abbreviation: tplI[k].hasOwnProperty("v") ? ("When omitted, default value is provided: '" + tplI[k].v) + "'" : "No abbreviation or default"
        });
      }
    }
  }
  //----------------------------------------------------------------------
  var drawGrid = function () {
    var i = 0;
    var TICKHEIGHT1 = 6;
    var TICKHEIGHT2 = 5;
    var HEAVYSTYLE = "rgb(0,0,0)"
    var LIGHTSTYLE = "rgb(100,100,100)"
    var HEAVYWIDTH = 0.8
    var LIGHTWIDTH = 0.5
    var nArms = Math.max(1, Math.max(grid[_majPhi], grid[_minPhi]))
    if (grid[_majX] > 1 && grid[_grMajX] != _none) {
      dLPush({
        'w': 'l',
        's': HEAVYSTYLE,
        'l': HEAVYWIDTH,
        'c': [
          [0, cH - 1],
          [cW - 1, cH - 1]
        ]
      })
      for (i = 0; i < grid[_majX]; i++) {
        var xP = cW * i / (grid[_majX] - 1);
        switch (grid[_grMajX]) {
        case _none:
          break;
        case _tick:
          dLPush({
            'w': 'l',
            's': HEAVYSTYLE,
            'l': HEAVYWIDTH,
            'c': [
              [xP, cH],
              [xP, cH - TICKHEIGHT1]
            ]
          })
          break;
        case _line:
          dLPush({
            'w': 'l',
            's': HEAVYSTYLE,
            'l': HEAVYWIDTH,
            'c': [
              [xP, cH],
              [xP, 0]
            ]
          })
          break;
        }
      }
    }
    if (grid[_minX] > 1 && grid[_grMinX] != _none) {
      dLPush({
        'w': 'l',
        's': LIGHTSTYLE,
        'l': LIGHTWIDTH,
        'c': [
          [0, cH - 1],
          [cW - 1, cH - 1]
        ]
      })
      for (i = 0; i < grid[_minX]; i++) {
        var xP = cW * i / (grid[_minX] - 1);
        switch (grid[_grMinX]) {
        case _none:
          break;
        case _tick:
          dLPush({
            'w': 'l',
            's': LIGHTSTYLE,
            'l': LIGHTWIDTH,
            'c': [
              [xP, cH],
              [xP, cH - TICKHEIGHT2]
            ]
          })
          break;
        case _line:
          dLPush({
            'w': 'l',
            's': LIGHTSTYLE,
            'l': LIGHTWIDTH,
            'c': [
              [xP, cH],
              [xP, 0]
            ]
          })
          break;
        }
      }
    }
    if (grid[_majY] > 1 && grid[_grMajY] != _none) {
      dLPush({
        'w': 'l',
        's': HEAVYSTYLE,
        'l': HEAVYWIDTH,
        'c': [
          [1, 0],
          [1, cH - 1]
        ]
      })
      for (i = 0; i < grid[_majY]; i++) {
        var yP = cW * i / (grid[_majY] - 1);
        switch (grid[_grMajY]) {
        case _none:
          break;
        case _tick:
          dLPush({
            'w': 'l',
            's': HEAVYSTYLE,
            'l': HEAVYWIDTH,
            'c': [
              [0, yP],
              [TICKHEIGHT1, yP]
            ]
          })
          break;
        case _line:
          dLPush({
            'w': 'l',
            's': HEAVYSTYLE,
            'l': HEAVYWIDTH,
            'c': [
              [0, yP],
              [cW, yP]
            ]
          })
          break;
        }
      }
    }
    if (grid[_minY] > 1 && grid[_grMinY] != _none) {
      dLPush({
        'w': 'l',
        's': LIGHTSTYLE,
        'l': LIGHTWIDTH,
        'c': [
          [1, 0],
          [1, cH - 1]
        ]
      })
      for (i = 0; i < grid[_minY]; i++) {
        var yP = cW * i / (grid[_minY] - 1);
        switch (grid[_grMinY]) {
        case _none:
          break;
        case _tick:
          dLPush({
            'w': 'l',
            's': LIGHTSTYLE,
            'l': LIGHTWIDTH,
            'c': [
              [0, yP],
              [TICKHEIGHT1, yP]
            ]
          })
          break;
        case _line:
          dLPush({
            'w': 'l',
            's': LIGHTSTYLE,
            'l': LIGHTWIDTH,
            'c': [
              [0, yP],
              [cW, yP]
            ]
          })
          break
        }
      }
    }
    if (grid[_majPhi] > 1 && grid[_grMajPhi] != _none) {
      if (cM > 0) {
        dLPush({
          'w': 'a',
          's': HEAVYSTYLE,
          'l': HEAVYWIDTH,
          'c': [
            [cW / 2, cH / 2]
          ],
          'p': [cM / 2, 0, twoPi, false]
        })
      }
      for (i = 0; i < grid[_majPhi]; i++) {
        var xP1 = cW / 2 + 0.5 * cM * Math.cos(twoPi * i / grid[_majPhi]);
        var yP1 = cH / 2 + 0.5 * cM * Math.sin(twoPi * i / grid[_majPhi]);
        switch (grid[_grMajPhi]) {
        case _none:
          break;
        case _tick:
          var xP2 = cW / 2 + (0.5 * cM - TICKHEIGHT1) * Math.cos(twoPi * i / grid[_majPhi]);
          var yP2 = cH / 2 + (0.5 * cM - TICKHEIGHT1) * Math.sin(twoPi * i / grid[_majPhi]);
          dLPush({
            'w': 'l',
            's': HEAVYSTYLE,
            'l': HEAVYWIDTH,
            'c': [
              [xP1, yP1],
              [xP2, yP2]
            ]
          })
          break;
        case _line:
          var xP2 = cW / 2;
          var yP2 = cH / 2
          dLPush({
            'w': 'l',
            's': HEAVYSTYLE,
            'l': HEAVYWIDTH,
            'c': [
              [xP1, yP1],
              [xP2, yP2]
            ]
          })
          break;
        }

      }
    }
    if (grid[_minPhi] > 1 && grid[_grMinPhi] != _none) {
      if (cM > 0) {
        dLPush({
          'w': 'a',
          's': LIGHTSTYLE,
          'l': LIGHTWIDTH,
          'c': [
            [cW / 2, cH / 2]
          ],
          'p': [cM / 2, 0, twoPi, false]
        })
      }
      for (i = 0; i < grid[_minPhi]; i++) {
        var xP1 = cW / 2 + 0.5 * cM * Math.cos(twoPi * i / grid[_minPhi]);
        var yP1 = cH / 2 + 0.5 * cM * Math.sin(twoPi * i / grid[_minPhi]);
        switch (grid[_grMinPhi]) {
        case _none:
          break;
        case _tick:
          var xP2 = cW / 2 + (0.5 * cM - TICKHEIGHT2) * Math.cos(twoPi * i / grid[_minPhi]);
          var yP2 = cH / 2 + (0.5 * cM - TICKHEIGHT2) * Math.sin(twoPi * i / grid[_minPhi]);
          dLPush({
            'w': 'l',
            's': LIGHTSTYLE,
            'l': LIGHTWIDTH,
            'c': [
              [xP1, yP1],
              [xP2, yP2]
            ]
          })
          break;
        case _line:
          var xP2 = cW / 2;
          var yP2 = cH / 2
          dLPush({
            'w': 'l',
            's': LIGHTSTYLE,
            'l': LIGHTWIDTH,
            'c': [
              [xP1, yP1],
              [xP2, yP2]
            ]
          })
          break;
        }
      }
    }
    if (grid[_majR] > 1 && grid[_grMajR] != _none) {
      var nrA = nArms;
      if (nrA > 20)
        nrA = 20;
      for (var rho = 0; rho < nArms; rho++) {
        var rl = cM / 2;
        dLPush({
          'w': 'l',
          's': HEAVYSTYLE,
          'l': HEAVYWIDTH,
          'c': [
            [cW / 2, cH / 2],
            [cW / 2 + rl * Math.cos(rho * twoPi / nArms), cH / 2 + rl * Math.sin(rho * twoPi / nArms)]
          ]
        })
        break
      }
      for (i = 0; i < grid[_majR]; i++) {
        switch (grid[_grMajR]) {
        case _none:
          break;
        case _tick:
          for (rho = 0; rho < nArms; rho++) {
            var dX = TICKHEIGHT1 * Math.cos(twoPi * rho / nArms);
            var dY = TICKHEIGHT1 * Math.sin(twoPi * rho / nArms);
            var baseX = cW / 2 + rl * i * Math.cos(twoPi * rho / nArms) / (grid[_majR] - 1);
            var baseY = cW / 2 + rl * i * Math.sin(twoPi * rho / nArms) / (grid[_majR] - 1);
            dLPush({
              'w': 'l',
              's': HEAVYSTYLE,
              'l': HEAVYWIDTH,
              'c': [
                [baseX - dY, baseY + dX],
                [baseX + dY, baseY - dX]
              ]
            })
          }
          break;
        case _line:
          var rrr = rl * i / (grid[_majR] - 1);
          if (rrr > 0) {
            dLPush({
              'w': 'a',
              's': HEAVYSTYLE,
              'l': HEAVYWIDTH,
              'c': [
                [cW / 2, cH / 2]
              ],
              'p': [rrr, 0, twoPi, false]
            })
          }
          break;
        }
      }
    }
    if (grid[_minR] > 1 && grid[_grMinR] != _none) {
      var nrA = nArms;
      if (nrA > 20)
        nrA = 20;
      for (var rho = 0; rho < nArms; rho++) {
        var rl = cM / 2;
        dLPush({
          'w': 'l',
          's': LIGHTSTYLE,
          'l': LIGHTWIDTH,
          'c': [
            [cW / 2, cH / 2],
            [cW / 2 + rl * Math.cos(rho * twoPi / nArms), cH / 2 + rl * Math.sin(rho * twoPi / nArms)]
          ]
        })
      }
      for (i = 0; i < grid[_minR]; i++) {
        switch (grid[_grMinR]) {
        case _none:
          break;
        case _tick:
          for (rho = 0; rho < nArms; rho++) {
            var dX = TICKHEIGHT2 * Math.cos(twoPi * rho / nArms);
            var dY = TICKHEIGHT2 * Math.sin(twoPi * rho / nArms);
            var baseX = cW / 2 + rl * i * Math.cos(twoPi * rho / nArms) / (grid[_minR] - 1);
            var baseY = cW / 2 + rl * i * Math.sin(twoPi * rho / nArms) / (grid[_minR] - 1);
            dLPush({
              'w': 'l',
              's': LIGHTSTYLE,
              'l': LIGHTWIDTH,
              'c': [
                [baseX - dY, baseY + dX],
                [baseX + dY, baseY - dX]
              ]
            })
          }
          break;
        case _line:
          var rrr = rl * i / (grid[_minR] - 1);
          if (rrr > 0) {
            dLPush({
              'w': 'a',
              's': LIGHTSTYLE,
              'l': LIGHTWIDTH,
              'c': [
                [cW / 2, cH / 2]
              ],
              'p': [rrr, 0, twoPi, false]
            })
          }
          break;
        }
      }
    }
  }
}
