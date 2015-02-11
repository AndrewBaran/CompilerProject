var Compiler;
(function (Compiler) {
    var Token = (function () {
        function Token() {
            this.type = 1 /* T_DEFAULT */;
            this.value = "";
        }
        Token.prototype.toString = function () {
            var result = TokenType[this.type] + ": " + this.value;
            return result;
        };

        Token.prototype.getTokenName = function () {
            return TokenType[this.type];
        };
        return Token;
    })();
    Compiler.Token = Token;
})(Compiler || (Compiler = {}));
