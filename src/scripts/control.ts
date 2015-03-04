module Compiler {

	export class Control {

		// Clears out the code and log textboxes when the page is loaded
		public static clearData(): void {

			// Clear textboxes and divs of any content
			this.clearInputCode();
			this.clearLog();
			this.clearCompilerResults();
			this.clearCST();
			this.clearAST();

			// Reset any tables that were created on the last run
			var tablesToClear: string[] = ["tokenTable", "symbolTable"];

			for(var i: number = 0; i < tablesToClear.length; i++) {
				this.clearTable(tablesToClear[i]);
			}

			this.enableButtons();
		}

		private static clearInputCode(): void {
			(<HTMLInputElement> document.getElementById("textboxInputCode")).value = "";
		}

		private static clearLog(): void {
			(<HTMLInputElement> document.getElementById("textboxLog")).value = "";
		}

		private static clearCST(): void {
			(<HTMLInputElement> document.getElementById("textboxCST")).value = "";
		}

		private static clearAST(): void {
			(<HTMLInputElement> document.getElementById("textboxAST")).value = "";
		}

		private static clearCompilerResults(): void {
			document.getElementById("divCompilerResults").innerHTML = "";
		}

		private static enableButtons(): void {

			document.getElementById("buttonCompile").disabled = false;
			document.getElementById("buttonTest").disabled = false;
		}

		private static disableButtons(): void {

			document.getElementById("buttonCompile").disabled = true;
			document.getElementById("buttonTest").disabled = true;
		}

		// Starts the compilation process using the input code
		public static buttonCompileClick(button): void {

			this.disableButtons();

			this.clearLog();
			this.clearCompilerResults();
			this.clearCST();
			this.clearAST();

			// Compile the program
			var code: string = (<HTMLInputElement> document.getElementById("textboxInputCode")).value;

			var compileResult: boolean = Compiler.compile(code);

			this.enableButtons();

			// TODO: Make use of the boolean result of the compilation by showing error signs or something
		}

		public static buttonTestClick(): void {

			this.disableButtons();

			this.clearLog();
			this.clearCompilerResults();

			this.runTests();

			this.enableButtons();
		}

		// Dynamically creates a suite of buttons that will place test code in the code textbox to be compiled when clicked
		public static createTestButtons(): void {

			var dropDropMenu = document.getElementById("dropDownPrograms");

			for(var i: number = 0; i < _testCodeList.length; i++) {

				var newButton = document.createElement("button");

				// Value of button correlates to which code fragment is loaded
				newButton.value = i.toString();
				newButton.innerHTML = _testCodeList[i].name;

				// When button is clicked, button is passed and its value is used to update the code
				newButton.onclick = function() {
					Control.loadTestCode(this);
				}

				dropDropMenu.appendChild(newButton);
			}
		}

		// Loads the specified test code into the code textbox using the button that was clicked
		private static loadTestCode(button): void {
			
			var index: number = parseInt(button.value, 10);
			var code: string = _testCodeList[index].code;

			(<HTMLInputElement> document.getElementById("textboxInputCode")).value = code;
		}

		// Displays tokens produced from lex
		public static displayTokenTable(tokenList: TokenInfo[]): void {

			var tableName: string = "tokenTable";
			this.clearTable(tableName);

			var table = <HTMLTableElement> document.getElementById(tableName);

			for(var i: number = 0; i < tokenList.length; i++) {

				var token: Token = tokenList[i].token;

				var row = <HTMLTableRowElement> table.insertRow(-1);

				var nameCell = <HTMLTableCellElement> row.insertCell(-1);
				nameCell.innerHTML = token.getTokenName();

				var valueCell = <HTMLTableCellElement> row.insertCell(-1);
				valueCell.innerHTML = token.getValue();
			}
		}

		public static displaySymbolTable(symbolTable: SymbolTable): void {

			var tableName: string = "symbolTable";
			this.clearTable(tableName);

			var htmlTable = <HTMLTableElement> document.getElementById(tableName);

			var firstScope: ScopeTable = symbolTable.getCurrentScope();
			this.buildTable(firstScope, htmlTable);
		}

		private static buildTable(currentScope: ScopeTable, htmlTable: HTMLTableElement): void {

			for(var entryIndex: number = 0; entryIndex < _Constants.MAX_SCOPE_ENTRIES; entryIndex++) {

				var entry: SymbolTableEntry = currentScope.getEntry(entryIndex);

				if(entry !== null) {

					var row = <HTMLTableRowElement> htmlTable.insertRow(-1);

					var idCell = row.insertCell(-1);
					idCell.innerHTML = entry.getIdName();

					var typeCell = row.insertCell(-1);
					typeCell.innerHTML = entry.getIdType();

					var valueCell = row.insertCell(-1);
					valueCell.innerHTML = entry.getValue();

					var scopeCell = row.insertCell(-1);
					scopeCell.innerHTML = currentScope.getScopeLevel().toString();
				}

			}

			var childScopeList: ScopeTable [] = currentScope.getChildList();

			if(childScopeList.length > 0) {

				for(var childIndex: number = 0; childIndex < childScopeList.length; childIndex++) {

					var childScope: ScopeTable = childScopeList[childIndex];
					this.buildTable(childScope, htmlTable);
				}
			}

		}

		private static clearTable(tableName: string): void {

			var table = <HTMLTableElement> document.getElementById(tableName);

			if(table !== null) {

				while(table.rows.length > 1) {
					table.deleteRow(-1);
				}
			}
		}

		public static displayCST(concreteSyntaxTree: ConcreteSyntaxTree): void {
			concreteSyntaxTree.preOrderTraversal();
		}

		// TODO: Display which phase of compilation failed
		// Executes each unit test and displays the result
		private static runTests(): void {

			var unitTestsPassed: number = 0;
			var unitTestCount: number = _testCodeList.length;

			var failedTests: string [] = [];

			// Set up compiler appropriately
			Compiler.setTestMode(true);

			for(var i: number = 0; i < _testCodeList.length; i++) {

				var programName: string = _testCodeList[i].name;
				var code: string = _testCodeList[i].code;

				var testResult: boolean = Compiler.compile(code);

				this.clearLog();

				if(testResult) {

					unitTestsPassed++;
				}

				else {
					failedTests.push(programName);
				}
			}

			Compiler.setTestMode(false);

			var sectionTextDelimiter: string = "-------------------------";

			Logger.log("Unit Test Summary");
			Logger.log(sectionTextDelimiter);
			Logger.log(unitTestsPassed + " / " + unitTestCount + " tests passed.");

			if(failedTests.length > 0) {

				Logger.log("");
				Logger.log("Failing tests");
				Logger.log(sectionTextDelimiter);

				for(var i: number = 0; i < failedTests.length; i++) {
					Logger.log(failedTests[i]);
				}
			}

		}

		public static displayCompilerResults(lex: boolean, parse: boolean, semantic: boolean): void {

			var resultDiv = document.getElementById("divCompilerResults");

			var results: string = "Compilation Results <br />";

			results += "Lex: ";
			results += lex ? "<b>Passed</b>" : "<b>Failed</b>";
			results += " | ";

			results += "Parse: ";
			results += parse ? "<b>Passed</b>" : "<b>Failed</b>";
			results += " | ";

			results += "Semantic: ";
			results += semantic ? "<b>Passed</b>" : "<b>Failed</b>";

			resultDiv.innerHTML = results;
		}
	}
}
