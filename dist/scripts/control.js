var Compiler;
(function (Compiler) {
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
            // Disable compile button
            document.getElementById("buttonCompile").disabled = true;

            // Compile the program
            var compileResult = Compiler.Compiler.compile();

            // Enable compile button
            document.getElementById("buttonCompile").disabled = false;
            // TODO: Make use of the boolean result of the compilation
            // TODO: Make it show error messages and stuff
        };

        Control.buttonTest1 = function (button) {
            var code = "int a\na = 10";
            this.loadTestCode(code);
        };

        Control.buttonTest2 = function (button) {
            var code = "int b\nb = 20";
            this.loadTestCode(code);
        };

        // Loads the specified test code into the code textbox
        Control.loadTestCode = function (code) {
            document.getElementById("textboxInputCode").value = code;
        };
        return Control;
    })();
    Compiler.Control = Control;
})(Compiler || (Compiler = {}));
