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
            // TODO: Checked for now (debugging)
            document.getElementById("checkboxDebug").checked = true;
            document.getElementById("checkboxParse").checked = true;

            // Reset compile button
            document.getElementById("buttonCompile").disabled = false;
        };

        // Starts the compilation process using the input code
        Control.buttonCompileClick = function (button) {
            // Disable compile button
            document.getElementById("buttonCompile").disabled = true;

            // TODO: Refactor into individual functions for clearing specific portions of textboxes / checkboxes
            // Clear the previous log
            document.getElementById("textboxLog").value = "";

            var divToRemove = document.getElementById("divDebugToken");

            if (divToRemove !== null) {
                document.getElementById("mainBody").removeChild(divToRemove);
            }

            // Compile the program
            var code = document.getElementById("textboxInputCode").value;

            var compileResult = Compiler.Compiler.compile(code);

            // Enable compile button
            document.getElementById("buttonCompile").disabled = false;
            // TODO: Make use of the boolean result of the compilation
            // TODO: Make it show error messages and stuff
        };

        // Dynamically creates a suite of buttons that will place test code in the code textbox to be compiled when clicked
        Control.createTestButtons = function () {
            // Get the div that will contain the buttons
            var buttonDiv = document.getElementById("divTestPrograms");

            for (var i = 0; i < _testCodeList.length; i++) {
                var newButton = document.createElement("button");

                // Value of button correlates to which code fragment is loaded
                newButton.value = i.toString();
                newButton.innerHTML = _testCodeList[i].name;

                // When button is clicked, button is passed and its value is ued to update the code
                newButton.onclick = function () {
                    Control.loadTestCode(this);
                };

                buttonDiv.appendChild(newButton);
            }
        };

        // Displays tokens produced from lex if debug mode is enabled
        Control.debugCreateTokenDiv = function (tokenList) {
            var divTokenWindow = document.createElement("div");
            divTokenWindow.id = "divDebugToken";

            var stringBody = "Tokens found: <br />";

            for (var i = 0; i < tokenList.length; i++) {
                stringBody += TokenType[tokenList[i].type];
                stringBody += "<br />";
            }

            divTokenWindow.innerHTML = stringBody;

            // TODO Make it attach to right of test buttons
            document.getElementById("mainBody").appendChild(divTokenWindow);
        };

        // Loads the specified test code into the code textbox using the button that was clicked
        Control.loadTestCode = function (button) {
            var index = parseInt(button.value, 10);
            var code = _testCodeList[index].code;

            document.getElementById("textboxInputCode").value = code;
        };
        return Control;
    })();
    Compiler.Control = Control;
})(Compiler || (Compiler = {}));
