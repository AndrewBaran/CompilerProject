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
			(<HTMLInputElement> document.getElementById("checkboxParse")).checked = true;

			// Reset compile button
			document.getElementById("buttonCompile").disabled = false;
		}

		// Starts the compilation process using the input code
		public static buttonCompileClick(button): void {

			// Disable compile button
			document.getElementById("buttonCompile").disabled = true;

			// TODO: Refactor into individual functions for clearing specific portions of textboxes / checkboxes
			// Clear the previous log
			(<HTMLInputElement> document.getElementById("textboxLog")).value = "";

			var divToRemove = document.getElementById("divDebugToken");

			if(divToRemove !== null) {
				document.getElementById("mainBody").removeChild(divToRemove);
			}

			// Compile the program
			var code: string = (<HTMLInputElement> document.getElementById("textboxInputCode")).value;

			var compileResult: boolean = Compiler.compile(code);

			// Enable compile button
			document.getElementById("buttonCompile").disabled = false;

			// TODO: Make use of the boolean result of the compilation
			// TODO: Make it show error messages and stuff
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

		// Displays tokens produced from lex if debug mode is enabled
		public static debugCreateTokenDiv(tokenList: Token[]): void {

			var divTokenWindow = document.createElement("div");
			divTokenWindow.id = "divDebugToken";

			var stringBody: string = "Tokens found: <br />";

			for(var i: number = 0; i < tokenList.length; i++) {
				stringBody += TokenType[tokenList[i].type];
				stringBody += "<br />";
			}

			divTokenWindow.innerHTML = stringBody;

			// TODO Make it attach to right of test buttons
			document.getElementById("mainBody").appendChild(divTokenWindow);
		}


		// Loads the specified test code into the code textbox using the button that was clicked
		private static loadTestCode(button): void {
			
			var index: number = parseInt(button.value, 10);
			var code: string = _testCodeList[index].code;

			(<HTMLInputElement> document.getElementById("textboxInputCode")).value = code;
		}

	}
}
