/*
Game plan:
AST starts with { } / Block node as root node
Statements are children of a block node in the order that they are declared
Children have a link to the leftmost child
Children have a link to their right sibling (like a B-tree)
Children have a link to their parent
Block:
Interior node of { }
Move down to new level on tree
Assignment:
Interior node of assign
Children:
Left: variable
Right: expression
Print:
Interior node of print
Children:
Value to be printed / expression
If:
Interior node of if
Child nodes:
Left: Predicate / boolean expression
Right: Block node, containing statements
While:
Interior node of while
Child nodes:
Left: Predicate / boolean expression
Right: Block node, containing statements
*/
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
            this.type = "";

            this.leftmostSibling = null;
            this.rightSibling = null;
            this.parent = null;

            this.childList = [];
        }
        ASTNode.prototype.getValue = function () {
            return this.value;
        };

        ASTNode.prototype.setValue = function (value) {
            this.value = value;
        };

        ASTNode.prototype.getType = function () {
            return this.type;
        };

        ASTNode.prototype.setType = function (type) {
            this.type = type;
        };

        ASTNode.prototype.getLeftmostSibling = function () {
            return this.leftmostSibling;
        };

        ASTNode.prototype.setLeftmostSibling = function (leftmostSibling) {
            this.leftmostSibling = leftmostSibling;
        };
        return ASTNode;
    })();
})(Compiler || (Compiler = {}));
