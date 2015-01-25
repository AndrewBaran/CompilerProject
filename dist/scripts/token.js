var TSCompiler;
(function (TSCompiler) {
    var Token = (function () {
        function Token() {
            this.type = "";
            this.value = "";
        }
        return Token;
    })();
    TSCompiler.Token = Token;
})(TSCompiler || (TSCompiler = {}));
