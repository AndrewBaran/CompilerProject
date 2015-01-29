var Compiler;
(function (Compiler) {
    var Control = (function () {
        function Control() {
        }
        // Clears out the code and log textboxes when the page is loaded
        Control.clearData = function () {
            // Clear textboxes of any content
            document.getElementById("textboxInputCode").value = "";
            document.getElementById("textboxLog").value = "";

            // Reset selections on compiler flags
            document.getElementById("checkboxDebug").checked = false;
        };

        // Starts the compilation process using the input code
        Control.buttonCompileClick = function (button) {
            // Disable compile button
            document.getElementById("buttonCompile").disabled = true;

            // TODO: Refactor into individual functions for clearing specific portions of textboxes / checkboxes
            // Clear the previous log
            document.getElementById("textboxLog").value = "";

            // Compile the program
            var compileResult = Compiler.Compiler.compile();

            // Enable compile button
            document.getElementById("buttonCompile").disabled = false;
            // TODO: Make use of the boolean result of the compilation
            // TODO: Make it show error messages and stuff
        };

        // Dynamically creates a suite of buttons that will place test code in the code textbox to be compiled
        Control.createTestButtons = function () {
            // Get the div that will contain the buttons
            var buttonDiv = document.getElementById("divTestPrograms");

            for (var i = 0; i < _testCodeList.length; i++) {
                var newButton = document.createElement("button");

                // Name / value of button correlates to which code fragment is loaded
                newButton.innerHTML = i.toString();
                newButton.value = i.toString();

                // When button is clicked, button is passed and its value is ued to update the code
                newButton.onclick = function () {
                    Control.loadTestCode(this);
                };

                buttonDiv.appendChild(newButton);
            }
        };

        // Loads the specified test code into the code textbox using the button that was clicked
        Control.loadTestCode = function (button) {
            var index = parseInt(button.value, 10);
            var code = _testCodeList[index];

            document.getElementById("textboxInputCode").value = code;
        };
        return Control;
    })();
    Compiler.Control = Control;
})(Compiler || (Compiler = {}));
