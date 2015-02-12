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
            document.getElementById("checkboxParse").checked = false;

            // Reset compile button
            document.getElementById("buttonCompile").disabled = false;
        };

        // Starts the compilation process using the input code
        Control.buttonCompileClick = function (button) {
            // Disable buttons
            document.getElementById("buttonCompile").disabled = true;
            document.getElementById("buttonTest").disabled = true;

            // TODO: Refactor into individual functions for clearing specific portions of textboxes / checkboxes
            // Clear the previous log
            document.getElementById("textboxLog").value = "";

            var divsToRemove = ["divDebugToken", "divDebugSymbolTable"];
            this.removeDivs(divsToRemove);

            // Compile the program
            var code = document.getElementById("textboxInputCode").value;

            var compileResult = Compiler.Compiler.compile(code);

            // Enable buttons
            document.getElementById("buttonCompile").disabled = false;
            document.getElementById("buttonTest").disabled = false;
            // TODO: Make use of the boolean result of the compilation
            // TODO: Make it show error messages and stuff
        };

        Control.buttonTestClick = function () {
            Compiler.Logger.log("Running unit tests");

            // Disable buttons
            document.getElementById("buttonCompile").disabled = true;
            document.getElementById("buttonTest").disabled = true;

            // Clear the previous log
            document.getElementById("textboxInputCode").value = "";
            document.getElementById("textboxLog").value = "";

            var divsToRemove = ["divDebugToken", "divDebugSymbolTable"];
            this.removeDivs(divsToRemove);

            this.runTests();

            // Enable buttons
            document.getElementById("buttonCompile").disabled = false;
            document.getElementById("buttonTest").disabled = false;
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

        // Loads the specified test code into the code textbox using the button that was clicked
        Control.loadTestCode = function (button) {
            var index = parseInt(button.value, 10);
            var code = _testCodeList[index].code;

            document.getElementById("textboxInputCode").value = code;
        };

        // Displays tokens produced from lex if debug mode is enabled
        Control.debugCreateTokenDiv = function (tokenList) {
            var divTokenWindow = document.createElement("div");
            divTokenWindow.id = "divDebugToken";

            var stringBody = "Tokens found: <hr />";

            for (var i = 0; i < tokenList.length; i++) {
                stringBody += tokenList[i].toString();
                stringBody += "<br />";
            }

            divTokenWindow.innerHTML = stringBody;

            document.getElementById("mainBody").appendChild(divTokenWindow);
        };

        Control.debugCreateSymbolTableDiv = function (symbolTable) {
            var divSymbolTable = document.createElement("div");
            divSymbolTable.id = "divDebugSymbolTable";

            var stringBody = "Symbol table: <hr />";

            for (var i = 0; i < symbolTable.getSize(); i++) {
                var currentEntry = symbolTable.getEntry(i);

                if (currentEntry !== null) {
                    if (!currentEntry.isReservedWord) {
                        stringBody += currentEntry.toString();
                        stringBody += "<br />";
                    }
                }
            }

            divSymbolTable.innerHTML = stringBody;

            document.getElementById("mainBody").appendChild(divSymbolTable);
        };

        Control.removeDivs = function (divList) {
            for (var i = 0; i < divList.length; i++) {
                var div = document.getElementById(divList[i]);

                if (div !== null) {
                    document.getElementById("mainBody").removeChild(div);
                }
            }
        };

        // TODO: Make it so it doesn't show normal log text
        // TODO: Make it so it doesn't show symbol table and token debug table
        // Executes each unit test and displays the result
        Control.runTests = function () {
            Compiler.Logger.log("Running the unit tests");

            var unitTestsPassed = 0;
            var totalUnitTests = _testCodeList.length;

            for (var i = 0; i < _testCodeList.length; i++) {
                var codeName = _testCodeList[i].name;
                var code = _testCodeList[i].code;

                var testResult = Compiler.Compiler.compile(code);

                if (testResult) {
                    Compiler.Logger.log("Program " + codeName + " passed.");
                    unitTestsPassed++;
                } else {
                    Compiler.Logger.log("Program " + codeName + " did not pass.");
                }
            }

            Compiler.Logger.log("Unit test summary");
            Compiler.Logger.log("-------------------------");
            Compiler.Logger.log(unitTestsPassed + " / " + totalUnitTests + " passed.");
        };
        return Control;
    })();
    Compiler.Control = Control;
})(Compiler || (Compiler = {}));
