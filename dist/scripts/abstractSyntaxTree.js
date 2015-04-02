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
VarDecl:
Interior node if VarDecl
Children:
Left: type
Right: variable
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
        AbstractSyntaxTree.prototype.insertInteriorNode = function (value) {
            Compiler.Logger.log("Inserting interior node: " + value);

            var node = new ASTNode();
            node.setValue(value);
            node.setNodeType(treeNodeTypes.INTERIOR);

            if (this.root === null) {
                node.setTreeLevel(0);

                this.root = node;
                this.currentNode = node;
            } else {
                var nextLevel = this.currentNode.getTreeLevel() + 1;
                node.setTreeLevel(nextLevel);

                this.currentNode.addChild(node);
                this.currentNode = node;
            }
        };

        AbstractSyntaxTree.prototype.addLeafNode = function () {
        };

        AbstractSyntaxTree.prototype.moveToParent = function () {
            if (this.currentNode !== this.root) {
                var parent = this.currentNode.getParent();

                if (parent !== null) {
                    Compiler.Logger.log("Moving to parent");
                    this.currentNode = parent;
                } else {
                    var errorMessage = "Error! Current AST node (" + this.currentNode.getValue() + ") does not have a parent to move to.";

                    Compiler.Logger.log(errorMessage);
                    throw errorMessage;
                }
            }
        };

        AbstractSyntaxTree.prototype.printPreOrder = function () {
            this.root.printPreOrder(this.root);
        };
        return AbstractSyntaxTree;
    })();
    Compiler.AbstractSyntaxTree = AbstractSyntaxTree;

    var ASTNode = (function () {
        function ASTNode() {
            this.value = "";
            this.typeInfo = "";

            this.treeLevel = 0;

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

        ASTNode.prototype.getTypeInfo = function () {
            return this.typeInfo;
        };

        ASTNode.prototype.setTypeInfo = function (typeInfo) {
            this.typeInfo = typeInfo;
        };

        ASTNode.prototype.getNodeType = function () {
            return this.nodeType;
        };

        ASTNode.prototype.setNodeType = function (nodeType) {
            this.nodeType = nodeType;
        };

        ASTNode.prototype.getTreeLevel = function () {
            return this.treeLevel;
        };

        ASTNode.prototype.setTreeLevel = function (treeLevel) {
            this.treeLevel = treeLevel;
        };

        ASTNode.prototype.getLeftmostSibling = function () {
            return this.leftmostSibling;
        };

        ASTNode.prototype.setLeftmostSibling = function (leftmostSibling) {
            this.leftmostSibling = leftmostSibling;
        };

        ASTNode.prototype.getRightSibling = function () {
            return this.rightSibling;
        };

        ASTNode.prototype.setRightSibling = function (rightSibling) {
            this.rightSibling = rightSibling;
        };

        ASTNode.prototype.getParent = function () {
            return this.parent;
        };

        ASTNode.prototype.setParent = function (parent) {
            this.parent = parent;
        };

        ASTNode.prototype.addChild = function (child) {
            child.setParent(this);
            this.childList.push(child);
        };

        ASTNode.prototype.printPreOrder = function (root) {
            if (root !== null) {
                var indentDashes = "";
                var treeLevel = root.getTreeLevel();

                for (var i = 0; i < treeLevel; i++) {
                    indentDashes += "-";
                }

                // Interior node
                if (root.getNodeType() === treeNodeTypes.INTERIOR) {
                    Compiler.Logger.log(indentDashes + "< " + root.getValue() + " >", "ast");
                } else {
                    Compiler.Logger.log(indentDashes + "[ " + root.getValue() + " ]", "ast");
                }

                for (var i = 0; i < root.childList.length; i++) {
                    root.printPreOrder(root.childList[i]);
                }
            }
        };
        return ASTNode;
    })();
})(Compiler || (Compiler = {}));
