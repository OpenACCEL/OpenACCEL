var controller;

require(["../controller/ControllerAPI", "./View"], /**@lends View*/ function(Controller, View) {
    controller = new Controller(new View());
});
