var TSCompiler;
(function (TSCompiler) {
    var Logger = (function () {
        function Logger() {
        }
        // Writes out the user supplied input message to the log textbox
        Logger.write = function (logMessage) {
            // Get the log textbox
            var logContents = document.getElementById("textboxLog");

            // Add new log message to start of the log
            logContents.value = logContents.value + "\n" + logMessage;
        };
        return Logger;
    })();
    TSCompiler.Logger = Logger;
})(TSCompiler || (TSCompiler = {}));
