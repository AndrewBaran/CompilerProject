var Compiler;
(function (Compiler) {
    var Token = (function () {
        function Token() {
            this.type = "";
            this.value = "";
        }
        return Token;
    })();
    Compiler.Token = Token;
})(Compiler || (Compiler = {}));
