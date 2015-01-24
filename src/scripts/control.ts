module TSCompiler {
	export class Control {


		// Clears out the code and log textboxes when the page is loaded
		public static clearData(): void {

			(<HTMLInputElement> document.getElementById("textboxInputCode")).value = "";
			(<HTMLInputElement> document.getElementById("textboxLog")).value = "";
		}


		// Starts the compilation process using the input code
		public static buttonCompileClick(button): void {

			// TODO: Remove console.log
			console.log("Compile button clicked");

			Compiler.compile();
		}
	}
}
