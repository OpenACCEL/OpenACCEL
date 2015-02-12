function kees() {
    var keesImg = new Image();
    keesImg.onload = function() {
        var canvas = document.getElementById("editrun_plot_canvas");
        var context = canvas.getContext('2d');
        context.imageSmoothingEnabled = true;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(keesImg, (canvas.width-keesImg.width)/2, (canvas.height-keesImg.height)/2);
    };
    keesImg.src = "../../../img/kees.jpg";
    controller.pause();

    return "The creator of ACCEL, the predecessor of OpenACCEL.";
}
