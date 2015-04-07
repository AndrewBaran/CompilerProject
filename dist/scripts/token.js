var Compiler;
(function (Compiler) {
    var Token = (function () {
        function Token() {
            this.type = 1 /* T_DEFAULT */;
            this.value = "";
        }
        Token.prototype.getType = function () {
            return this.type;
        };

        Token.prototype.setType = function (type) {
            this.type = type;
        };

        Token.prototype.setValue = function (value) {
            this.value = value;
        };

        Token.prototype.getValue = function () {
            return this.value;
        };

        Token.prototype.getTokenName = function () {
            return TokenType[this.type];
        };
        return Token;
    })();
    Compiler.Token = Token;
})(Compiler || (Compiler = {}));
