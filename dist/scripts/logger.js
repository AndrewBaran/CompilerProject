var Compiler;
(function (Compiler) {
    var Logger = (function () {
        function Logger() {
        }
        // Writes out the user supplied input message to the specified log textbox
        Logger.log = function (logMessage, source) {
            var textboxName = "";

            switch (source) {
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

            var logContents = document.getElementById(textboxName);
            logContents.value = logContents.value + logMessage + "\n";
        };

        Logger.logVerbose = function (logMessage) {
            var textboxName = "textboxLog";

            if (Compiler.Control.verboseMode) {
                var logContents = document.getElementById(textboxName);
                logContents.value = logContents.value + logMessage + "\n";
            }
        };
        return Logger;
    })();
    Compiler.Logger = Logger;
})(Compiler || (Compiler = {}));
