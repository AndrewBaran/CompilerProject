var Compiler;
(function (Compiler) {
    var AbstractSyntaxTree = (function () {
        function AbstractSyntaxTree() {
            this.root = null;
            this.currentNode = null;
        }
        AbstractSyntaxTree.prototype.addInteriorNode = function () {
        };

        AbstractSyntaxTree.prototype.addLeafNode = function () {
        };

        AbstractSyntaxTree.prototype.moveToParent = function () {
        };
        return AbstractSyntaxTree;
    })();
    Compiler.AbstractSyntaxTree = AbstractSyntaxTree;

    var ASTNode = (function () {
        function ASTNode() {
            this.value = "";
        }
        return ASTNode;
    })();
})(Compiler || (Compiler = {}));
