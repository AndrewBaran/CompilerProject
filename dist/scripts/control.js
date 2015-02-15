var Compiler;
(function (Compiler) {
    var Control = (function () {
        function Control() {
        }
        // Clears out the code and log textboxes when the page is loaded
        Control.clearData = function () {
            // Clear textboxes of any content
            this.clearInputCode();
            this.clearLog();

            // Reset selections on compiler flags
            // TODO: Checked for now (debugging)
            document.getElementById("checkboxDebug").checked = true;
            document.getElementById("checkboxParse").checked = false;

            this.enableButtons();
        };

        Control.clearInputCode = function () {
            document.getElementById("textboxInputCode").value = "";
        };

        Control.clearLog = function () {
            document.getElementById("textboxLog").value = "";
        };

        Control.enableButtons = function () {
            document.getElementById("buttonCompile").disabled = false;
            document.getElementById("buttonTest").disabled = false;
        };

        Control.disableButtons = function () {
            document.getElementById("buttonCompile").disabled = true;
            document.getElementById("buttonTest").disabled = true;
        };

        // Starts the compilation process using the input code
        Control.buttonCompileClick = function (button) {
            this.disableButtons();

            this.clearLog();

            var divsToRemove = ["divDebugToken", "divDebugSymbolTable"];
            this.removeDivs(divsToRemove);

            // Compile the program
            var code = document.getElementById("textboxInputCode").value;

            var compileResult = Compiler.Compiler.compile(code);

            this.enableButtons();
            // TODO: Make use of the boolean result of the compilation by showing error signs or something
        };

        Control.buttonTestClick = function () {
            this.disableButtons();
            this.clearLog();

            var divsToRemove = ["divDebugToken", "divDebugSymbolTable"];
            this.removeDivs(divsToRemove);

            this.runTests();

            this.enableButtons();
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

        // Executes each unit test and displays the result
        Control.runTests = function () {
            var unitTestsPassed = 0;
            var unitTestCount = _testCodeList.length;

            var failedTests = [];

            // Set up compiler appropriately
            Compiler.Compiler.setTestMode(true);

            for (var i = 0; i < _testCodeList.length; i++) {
                var programName = _testCodeList[i].name;
                var code = _testCodeList[i].code;

                var testResult = Compiler.Compiler.compile(code);

                this.clearLog();

                if (testResult) {
                    unitTestsPassed++;
                } else {
                    failedTests.push(programName);
                }
            }

            Compiler.Compiler.setTestMode(false);

            var sectionTextDelimiter = "-------------------------";

            Compiler.Logger.log("Unit test summary");
            Compiler.Logger.log(sectionTextDelimiter);
            Compiler.Logger.log(unitTestsPassed + " / " + unitTestCount + " tests passed.");

            if (failedTests.length > 0) {
                Compiler.Logger.log("");
                Compiler.Logger.log("Failing tests");
                Compiler.Logger.log(sectionTextDelimiter);

                for (var i = 0; i < failedTests.length; i++) {
                    Compiler.Logger.log(failedTests[i]);
                }
            }
        };
        return Control;
    })();
    Compiler.Control = Control;
})(Compiler || (Compiler = {}));
