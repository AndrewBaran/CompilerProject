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
        return Utils;
    })();
    Compiler.Utils = Utils;
})(Compiler || (Compiler = {}));
