module Compiler {
	
	export class Logger {

		// Writes out the user supplied input message to the specified log textbox
		public static log(logMessage: string, source?: string): void {

			var textboxName: string = "";

			switch(source) {

				case "cst":

					textboxName = "textboxCST";
					break;

				case "ast":

					textboxName = "textboxAST";
					break;

				default:

					textboxName = "textboxLog";
					break;
			}

			// Get the log textbox
			var logContents = <HTMLInputElement> document.getElementById(textboxName);

			// Add new log message to the end of the log
			logContents.value = logContents.value + logMessage + "\n";
		}
	}
}
