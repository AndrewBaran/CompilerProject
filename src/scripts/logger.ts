module TSCompiler {
	export class Logger {

		public static write(logMessage: string): void {

			// Get the log textbox
			var logContents = <HTMLInputElement> document.getElementById("textboxLog");
			
			// Add new log message to start of the log
			logContents.value = logMessage + logContents.value;
		}
	}
}
