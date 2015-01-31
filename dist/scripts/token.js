var Compiler;
(function (Compiler) {
    var Token = (function () {
        function Token(kind, value) {
            this.kind = kind;
            this.value = value;
        }
        return Token;
    })();
    Compiler.Token = Token;
})(Compiler || (Compiler = {}));
