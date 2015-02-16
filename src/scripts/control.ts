module Compiler {

	export class Control {

		// Clears out the code and log textboxes when the page is loaded
		public static clearData(): void {

			// Clear textboxes of any content
			this.clearInputCode();
			this.clearLog();

			// Reset selections on compiler flags
			// TODO: Checked for now (debugging) 
			(<HTMLInputElement> document.getElementById("checkboxDebug")).checked = true;

			this.enableButtons();
		}

		private static clearInputCode(): void {
			(<HTMLInputElement> document.getElementById("textboxInputCode")).value = "";
		}

		private static clearLog(): void {
			(<HTMLInputElement> document.getElementById("textboxLog")).value = "";
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

			var divsToRemove: string [] = ["divDebugToken", "divDebugSymbolTable"];
			this.removeDivs(divsToRemove)

			// Compile the program
			var code: string = (<HTMLInputElement> document.getElementById("textboxInputCode")).value;

			var compileResult: boolean = Compiler.compile(code);

			this.enableButtons();

			// TODO: Make use of the boolean result of the compilation by showing error signs or something
		}

		public static buttonTestClick(): void {

			this.disableButtons();
			this.clearLog();

			var divsToRemove: string [] = ["divDebugToken", "divDebugSymbolTable"];
			this.removeDivs(divsToRemove)

			this.runTests();

			this.enableButtons();
		}

		// Dynamically creates a suite of buttons that will place test code in the code textbox to be compiled when clicked
		public static createTestButtons(): void {

			// Get the div that will contain the buttons
			var buttonDiv = document.getElementById("divTestPrograms");

			for(var i: number = 0; i < _testCodeList.length; i++) {

				var newButton = document.createElement("button");

				// Value of button correlates to which code fragment is loaded
				newButton.value = i.toString();
				newButton.innerHTML = _testCodeList[i].name;

				// When button is clicked, button is passed and its value is ued to update the code
				newButton.onclick = function() {
					Control.loadTestCode(this);
				}

				buttonDiv.appendChild(newButton);
			}
		}

		// Loads the specified test code into the code textbox using the button that was clicked
		private static loadTestCode(button): void {
			
			var index: number = parseInt(button.value, 10);
			var code: string = _testCodeList[index].code;

			(<HTMLInputElement> document.getElementById("textboxInputCode")).value = code;
		}

		// Displays tokens produced from lex if debug mode is enabled
		public static debugCreateTokenDiv(tokenList: Token[]): void {

			var divTokenWindow = document.createElement("div");
			divTokenWindow.id = "divDebugToken";

			var stringBody: string = "Tokens found: <hr />";

			for(var i: number = 0; i < tokenList.length; i++) {

				stringBody += tokenList[i].toString();
				stringBody += "<br />";
			}

			divTokenWindow.innerHTML = stringBody;

			document.getElementById("mainBody").appendChild(divTokenWindow);
		}

		public static debugCreateSymbolTableDiv(symbolTable: SymbolTable): void {

			var divSymbolTable = document.createElement("div");
			divSymbolTable.id = "divDebugSymbolTable";

			var stringBody: string = "Symbol table: <hr />";

			for(var i: number = 0; i < symbolTable.getSize(); i++) {

				var currentEntry: SymbolTableEntry = symbolTable.getEntry(i);

				if(currentEntry !== null) {

					if(!currentEntry.isReservedWord) {

						stringBody += currentEntry.toString();
						stringBody += "<br />";
					}
				}
			}

			divSymbolTable.innerHTML = stringBody;

			document.getElementById("mainBody").appendChild(divSymbolTable);
		}

		private static removeDivs(divList: string[]): void {

			for(var i: number = 0; i < divList.length; i++) {

				var div = document.getElementById(divList[i]);

				if(div !== null) {
					document.getElementById("mainBody").removeChild(div);
				}
			}
		}

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
	}
}
