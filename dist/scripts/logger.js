var Compiler;
(function (Compiler) {
    var Logger = (function () {
        function Logger() {
        }
        // Writes out the user supplied input message to the log textbox
        Logger.log = function (logMessage) {
            // Get the log textbox
            var logContents = document.getElementById("textboxLog");

            // Add new log message to the end of the log
            logContents.value = logContents.value + logMessage + "\n";
        };
        return Logger;
    })();
    Compiler.Logger = Logger;
})(Compiler || (Compiler = {}));
