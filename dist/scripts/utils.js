var Compiler;
(function (Compiler) {
    var Utils = (function () {
        function Utils() {
        }
        Utils.isIgnoredLeaf = function (nodeValue) {
            var ignoredLeafValues = ["=", "\"", "+", "(", ")", "print", "==", "!=", "if", "{", "}", "while"];
            var leafMatched = false;

            for (var i = 0; i < ignoredLeafValues.length; i++) {
                if (ignoredLeafValues[i] === nodeValue) {
                    leafMatched = true;
                    break;
                }
            }

            return leafMatched;
        };

        Utils.decimalToHex = function (decimalInput) {
            var hexResult = decimalInput.toString(16);

            // Pad if necessary
            if (hexResult.length === 1) {
                hexResult = "0" + hexResult;
            }

            return hexResult.toUpperCase();
        };
        return Utils;
    })();
    Compiler.Utils = Utils;
})(Compiler || (Compiler = {}));
