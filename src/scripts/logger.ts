module Compiler {
	
	export class Logger {

		// Writes out the user supplied input message to the log textbox
		public static log(logMessage: string): void {

			// Get the log textbox
			var logContents = <HTMLInputElement> document.getElementById("textboxLog");

			// Add new log message to the end of the log
			logContents.value = logContents.value + logMessage + "\n";
		}
	}
}
