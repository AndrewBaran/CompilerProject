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

			var logContents = <HTMLInputElement> document.getElementById(textboxName);
			logContents.value = logContents.value + logMessage + "\n";
		}

		public static logVerbose(logMessage: string): void {

            var textboxName: string = "textboxLog";

            if(Control.verboseMode) {

				var logContents = <HTMLInputElement> document.getElementById(textboxName);
				logContents.value = logContents.value + logMessage + "\n";
            }

		}

	}
}
