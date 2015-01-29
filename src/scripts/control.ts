module Compiler {

	export class Control {

		// Clears out the code and log textboxes when the page is loaded
		public static clearData(): void {

			// Clear textboxes of any content
			(<HTMLInputElement> document.getElementById("textboxInputCode")).value = "";
			(<HTMLInputElement> document.getElementById("textboxLog")).value = "";

			// Reset selections on compiler flags
			(<HTMLInputElement> document.getElementById("checkboxDebug")).checked = false;
		}

		// Starts the compilation process using the input code
		public static buttonCompileClick(button): void {

			// Disable compile button
			document.getElementById("buttonCompile").disabled = true;

			// TODO: Refactor into individual functions for clearing specific portions of textboxes / checkboxes
			// Clear the previous log
			(<HTMLInputElement> document.getElementById("textboxLog")).value = "";

			// Compile the program
			var compileResult: boolean = Compiler.compile();

			// Enable compile button
			document.getElementById("buttonCompile").disabled = false;

			// TODO: Make use of the boolean result of the compilation
			// TODO: Make it show error messages and stuff
		}

		// Dynamically creates a suite of buttons that will place test code in the code textbox to be compiled
		public static createTestButtons(): void {

			// Get the div that will contain the buttons
			var buttonDiv = document.getElementById("divTestPrograms");

			for(var i: number = 0; i < _testCodeList.length; i++) {

				var newButton = document.createElement("button");

				// Name / value of button correlates to which code fragment is loaded
				newButton.innerHTML = i.toString(); 
				newButton.value = i.toString();

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
			var code: string = _testCodeList[index];

			(<HTMLInputElement> document.getElementById("textboxInputCode")).value = code;
		}
	}
}
