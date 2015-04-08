var Compiler;
(function (Compiler) {
    var Control = (function () {
        function Control() {
        }
        // Clears out the code and log textboxes when the page is loaded
        Control.clearData = function () {
            // Clear textboxes and divs of any content
            this.clearInputCode();
            this.clearLog();
            this.clearCompilerResults();
            this.clearCST();
            this.clearAST();

            // Reset any tables that were created on the last run
            var tablesToClear = ["tokenTable", "symbolTable"];

            for (var i = 0; i < tablesToClear.length; i++) {
                this.clearTable(tablesToClear[i]);
            }

            this.enableButtons();
        };

        Control.clearInputCode = function () {
            document.getElementById("textboxInputCode").value = "";
        };

        Control.clearLog = function () {
            document.getElementById("textboxLog").value = "";
        };

        Control.clearCST = function () {
            document.getElementById("textboxCST").value = "";
        };

        Control.clearAST = function () {
            document.getElementById("textboxAST").value = "";
        };

        Control.clearCompilerResults = function () {
            document.getElementById("divCompilerResults").innerHTML = "";
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
            this.clearCompilerResults();
            this.clearCST();
            this.clearAST();

            // Compile the program
            var code = document.getElementById("textboxInputCode").value;
            var compileResult = Compiler.Compiler.compile(code);

            this.enableButtons();
        };

        Control.buttonTestClick = function () {
            this.disableButtons();

            this.clearLog();
            this.clearCompilerResults();

            this.runTests();

            this.enableButtons();
        };

        // Dynamically creates a suite of buttons that will place test code in the code textbox to be compiled when clicked
        Control.createTestButtons = function () {
            var dropDropMenu = document.getElementById("dropDownPrograms");

            for (var i = 0; i < _testCodeList.length; i++) {
                var newButton = document.createElement("button");

                // Value of button correlates to which code fragment is loaded
                newButton.value = i.toString();
                newButton.innerHTML = _testCodeList[i].name;

                // When button is clicked, button is passed and its value is used to update the code
                newButton.onclick = function () {
                    Control.loadTestCode(this);
                };

                dropDropMenu.appendChild(newButton);
            }
        };

        // Loads the specified test code into the code textbox using the button that was clicked
        Control.loadTestCode = function (button) {
            var index = parseInt(button.value, 10);
            var code = _testCodeList[index].code;

            document.getElementById("textboxInputCode").value = code;
        };

        // Displays tokens produced from lex
        Control.displayTokenTable = function (tokenList) {
            var tableName = "tokenTable";
            this.clearTable(tableName);

            var table = document.getElementById(tableName);

            for (var i = 0; i < tokenList.length; i++) {
                var token = tokenList[i].token;

                var row = table.insertRow(-1);

                var nameCell = row.insertCell(-1);
                nameCell.innerHTML = token.getTokenName();

                var valueCell = row.insertCell(-1);
                valueCell.innerHTML = token.getValue();
            }
        };

        Control.displaySymbolTable = function (symbolTable) {
            var tableName = "symbolTable";
            this.clearTable(tableName);

            var htmlTable = document.getElementById(tableName);

            var firstScope = symbolTable.getCurrentScope();
            this.buildTable(firstScope, htmlTable);
        };

        Control.buildTable = function (currentScope, htmlTable) {
            for (var entryIndex = 0; entryIndex < _Constants.MAX_SCOPE_ENTRIES; entryIndex++) {
                var entry = currentScope.getEntry(entryIndex);

                if (entry !== null) {
                    var row = htmlTable.insertRow(-1);

                    var idCell = row.insertCell(-1);
                    idCell.innerHTML = entry.getIdName();

                    var typeCell = row.insertCell(-1);
                    typeCell.innerHTML = entry.getIdType();

                    var scopeCell = row.insertCell(-1);
                    scopeCell.innerHTML = currentScope.getScopeLevel().toString();

                    var lineCell = row.insertCell(-1);
                    lineCell.innerHTML = entry.getLineNumber().toString();
                }
            }

            var childScopeList = currentScope.getChildList();

            if (childScopeList.length > 0) {
                for (var childIndex = 0; childIndex < childScopeList.length; childIndex++) {
                    var childScope = childScopeList[childIndex];
                    this.buildTable(childScope, htmlTable);
                }
            }
        };

        Control.clearTable = function (tableName) {
            var table = document.getElementById(tableName);

            if (table !== null) {
                while (table.rows.length > 1) {
                    table.deleteRow(-1);
                }
            }
        };

        Control.displayCST = function (concreteSyntaxTree) {
            concreteSyntaxTree.printPreOrder();
        };

        Control.displayAST = function (abstractSyntaxTree) {
            abstractSyntaxTree.printPreOrder();
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
                this.clearCST();
                this.clearAST();

                if (testResult) {
                    unitTestsPassed++;
                } else {
                    failedTests.push(programName);
                }
            }

            Compiler.Compiler.setTestMode(false);

            var sectionTextDelimiter = "-------------------------";

            Compiler.Logger.log("Unit Test Summary");
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

        // TODO: Add Code Gen results in Project 3
        Control.displayCompilerResults = function (lex, parse, semantic) {
            var resultDiv = document.getElementById("divCompilerResults");

            var results = "Compilation Results <br />";

            results += "Lex: ";
            results += lex ? "<b>Passed</b>" : "<b>Failed</b>";
            results += " | ";

            results += "Parse: ";
            results += parse ? "<b>Passed</b>" : "<b>Failed</b>";
            results += " | ";

            results += "Semantic: ";
            results += semantic ? "<b>Passed</b>" : "<b>Failed</b>";

            resultDiv.innerHTML = results;
        };
        return Control;
    })();
    Compiler.Control = Control;
})(Compiler || (Compiler = {}));
