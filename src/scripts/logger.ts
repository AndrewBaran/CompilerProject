module TSCompiler {
	export class Logger {

		// Writes out the user supplied input message to the log textbox
		public static write(logMessage: string): void {

			// Get the log textbox
			var logContents = <HTMLInputElement> document.getElementById("textboxLog");

			// Add new log message to start of the log
			logContents.value = logContents.value + "\n" + logMessage;
		}
	}
}
