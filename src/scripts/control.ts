module Compiler {

	export class Control {

		// Clears out the code and log textboxes when the page is loaded
		public static clearData(): void {

			// Clear textboxes of any content
			(<HTMLInputElement> document.getElementById("textboxInputCode")).value = "";
			(<HTMLInputElement> document.getElementById("textboxLog")).value = "";

			// Reset selections on compiler flags
			// TODO: Checked for now (debugging) 
			(<HTMLInputElement> document.getElementById("checkboxDebug")).checked = true;
			(<HTMLInputElement> document.getElementById("checkboxParse")).checked = false;

			// Reset compile button
			document.getElementById("buttonCompile").disabled = false;
		}

		// Starts the compilation process using the input code
		public static buttonCompileClick(button): void {

			// Disable buttons
			document.getElementById("buttonCompile").disabled = true;
			document.getElementById("buttonTest").disabled = true;

			// TODO: Refactor into individual functions for clearing specific portions of textboxes / checkboxes
			// Clear the previous log
			(<HTMLInputElement> document.getElementById("textboxLog")).value = "";

			var divsToRemove: string [] = ["divDebugToken", "divDebugSymbolTable"];
			this.removeDivs(divsToRemove)

			// Compile the program
			var code: string = (<HTMLInputElement> document.getElementById("textboxInputCode")).value;

			var compileResult: boolean = Compiler.compile(code);

			// Enable buttons
			document.getElementById("buttonCompile").disabled = false;
			document.getElementById("buttonTest").disabled = false;

			// TODO: Make use of the boolean result of the compilation
			// TODO: Make it show error messages and stuff
		}

		public static buttonTestClick(): void {

			Logger.log("Running unit tests");

			// Disable buttons
			document.getElementById("buttonCompile").disabled = true;
			document.getElementById("buttonTest").disabled = true;

			// Clear the previous log
			(<HTMLInputElement> document.getElementById("textboxInputCode")).value = "";
			(<HTMLInputElement> document.getElementById("textboxLog")).value = "";

			var divsToRemove: string [] = ["divDebugToken", "divDebugSymbolTable"];
			this.removeDivs(divsToRemove)

			this.runTests();

			// Enable buttons
			document.getElementById("buttonCompile").disabled = false;
			document.getElementById("buttonTest").disabled = false;
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

		// TODO: Make it so it doesn't show normal log text
		// TODO: Make it so it doesn't show symbol table and token debug table
		// Executes each unit test and displays the result
		private static runTests(): void {

			Logger.log("Running the unit tests");

			var unitTestsPassed: number = 0;
			var totalUnitTests: number = _testCodeList.length;

			for(var i: number = 0; i < _testCodeList.length; i++) {

				var codeName: string = _testCodeList[i].name;
				var code: string = _testCodeList[i].code;

				var testResult: boolean = Compiler.compile(code);

				if(testResult) {

					Logger.log("Program " + codeName + " passed.");
					unitTestsPassed++;
				}

				else {

					Logger.log("Program " + codeName + " did not pass.");
				}
			}

			Logger.log("Unit test summary");
			Logger.log("-------------------------");
			Logger.log(unitTestsPassed + " / " + totalUnitTests + " passed.");
		}

	}
}
