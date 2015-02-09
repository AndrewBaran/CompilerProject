var Compiler;
(function (Compiler) {
    var Token = (function () {
        function Token() {
            this.type = 1 /* T_DEFAULT */;
            this.value = "";
        }
        return Token;
    })();
    Compiler.Token = Token;
})(Compiler || (Compiler = {}));
