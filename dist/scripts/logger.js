var TSCompiler;
(function (TSCompiler) {
    var Logger = (function () {
        function Logger() {
        }
        Logger.write = function (logMessage) {
            // Get the log textbox
            var logContents = document.getElementById("textboxLog");

            // Add new log message to start of the log
            logContents.value = logMessage + logContents.value;
        };
        return Logger;
    })();
    TSCompiler.Logger = Logger;
})(TSCompiler || (TSCompiler = {}));
