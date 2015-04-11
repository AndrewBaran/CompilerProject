var Compiler;
(function (Compiler) {
    var Utils = (function () {
        function Utils() {
        }
        Utils.isIgnoredLeaf = function (nodeValue) {
            var ignoredLeafValues = ["=", "\""];
            var leafMatched = false;

            for (var i = 0; i < ignoredLeafValues.length; i++) {
                if (ignoredLeafValues[i] === nodeValue) {
                    leafMatched = true;
                    break;
                }
            }

            // TODO: Remove after testing
            if (leafMatched) {
                Compiler.Logger.log(nodeValue + " not being added as a leaf.", "ast");
            }

            return leafMatched;
        };
        return Utils;
    })();
    Compiler.Utils = Utils;
})(Compiler || (Compiler = {}));
