var Compiler;
(function (Compiler) {
    var Token = (function () {
        function Token(type, value) {
            this.type = type;
            this.value = value;
        }
        return Token;
    })();
    Compiler.Token = Token;
})(Compiler || (Compiler = {}));
