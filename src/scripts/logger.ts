module TSCompiler {
	
	export class Logger {

		// Writes out the user supplied input message to the log textbox
		// TODO: Make it so first line in log is not skipped
		public static write(logMessage: string): void {

			// Get the log textbox
			var logContents = <HTMLInputElement> document.getElementById("textboxLog");

			// Add new log message to the end of the log
			logContents.value = logContents.value + "\n" + logMessage;
		}
	}
}
