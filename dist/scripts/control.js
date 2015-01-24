var TSCompiler;
(function (TSCompiler) {
    var Control = (function () {
        function Control() {
        }
        Control.buttonCompileClick = function (button) {
            console.log("Compile button clicked");
        };
        return Control;
    })();
    TSCompiler.Control = Control;
})(TSCompiler || (TSCompiler = {}));
