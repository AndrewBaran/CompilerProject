var TSCompiler;
(function (TSCompiler) {
    var Control = (function () {
        function Control() {
        }
        // Clears out the code and log textboxes when the page is loaded
        Control.clearData = function () {
            document.getElementById("textboxInputCode").value = "";
            document.getElementById("textboxLog").value = "";
        };

        // Starts the compilation process using the input code
        Control.buttonCompileClick = function (button) {
            // TODO: Remove console.log
            console.log("Compile button clicked");

            TSCompiler.Compiler.compile();
        };
        return Control;
    })();
    TSCompiler.Control = Control;
})(TSCompiler || (TSCompiler = {}));
