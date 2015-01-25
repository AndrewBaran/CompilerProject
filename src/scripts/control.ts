module Compiler {

	export class Control {

		// Clears out the code and log textboxes when the page is loaded
		public static clearData(): void {

			(<HTMLInputElement> document.getElementById("textboxInputCode")).value = "";
			(<HTMLInputElement> document.getElementById("textboxLog")).value = "";
		}

		// Starts the compilation process using the input code
		public static buttonCompileClick(button): void {

			// Disable compile button
			document.getElementById("buttonCompile").disabled = true;

			// Compile the program
			var compileResult: boolean = Compiler.compile();

			// Enable compile button
			document.getElementById("buttonCompile").disabled = false;

			// TODO: Make use of the boolean result of the compilation
			// TODO: Make it show error messages and stuff
		}

		public static buttonTest1(button): void {

			var code: string = "int a\na = 10";
			this.loadTestCode(code);
		}

		public static buttonTest2(button): void {

			var code: string = "int b\nb = 20";
			this.loadTestCode(code);
		}

		// Loads the specified test code into the code textbox
		private static loadTestCode(code: string): void {

			(<HTMLInputElement> document.getElementById("textboxInputCode")).value = code;
		}
	}
}
