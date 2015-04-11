/*
Game plan:
AST starts with { } / Block node as root node
Statements are children of a block node in the order that they are declared
Children have a link to the leftmost child
Children have a link to their right sibling (like a B-tree)
Children have a link to their parent
VarDecl:
Interior node of VarDecl
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
            // TODO: Remove after testing
            Compiler.Logger.log("Inserting interior node: " + value, "ast");

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

        AbstractSyntaxTree.prototype.insertLeafNode = function (type, value, lineNumber) {
            // TODO: Remove after testing
            Compiler.Logger.log("Type: " + type + " | Value: " + value + " | Line #: " + lineNumber, "ast");

            if (this.root === null) {
                var errorMessage = "Error! Cannot insert leaf node [ " + node.getValue() + " ] as the root node.";

                Compiler.Logger.log(errorMessage);
                throw errorMessage;
            } else {
                var node = new ASTNode();

                node.setTokenType(type);
                node.setValue(value);
                node.setLineNumber(lineNumber);
                node.setParent(this.currentNode);
                node.setNodeType(treeNodeTypes.LEAF);

                var nextTreeLevel = this.currentNode.getTreeLevel() + 1;
                node.setTreeLevel(nextTreeLevel);

                this.currentNode.addChild(node);
            }
        };

        AbstractSyntaxTree.prototype.moveToParent = function () {
            if (this.currentNode !== this.root) {
                var parent = this.currentNode.getParent();

                if (parent !== null) {
                    // TODO: Remove after testing
                    Compiler.Logger.log("Moving from " + this.currentNode.getValue() + " to parent: " + parent.getValue(), "ast");
                    this.currentNode = parent;
                } else {
                    var errorMessage = "Error! Current AST node (" + this.currentNode.getValue() + ") does not have a parent to move to.";

                    Compiler.Logger.log(errorMessage);
                    throw errorMessage;
                }
            }
        };

        AbstractSyntaxTree.prototype.printPreOrder = function () {
            // TODO: Remove after testing
            Compiler.Logger.log("", "ast");
            Compiler.Logger.log("Displaying AST", "ast");
            Compiler.Logger.log("----------------------", "ast");

            this.root.printPreOrder(this.root);
        };
        return AbstractSyntaxTree;
    })();
    Compiler.AbstractSyntaxTree = AbstractSyntaxTree;

    var ASTNode = (function () {
        function ASTNode() {
            this.value = "";

            this.typeInfo = "";
            this.leftTreeType = "";
            this.rightTreeType = "";

            this.nodeType = "";
            this.tokenType = "";

            this.treeLevel = 0;
            this.lineNumber = -1;

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

        ASTNode.prototype.getLeftTreeType = function () {
            return this.leftTreeType;
        };

        ASTNode.prototype.setLeftTreeType = function (leftTreeType) {
            this.leftTreeType = leftTreeType;
        };

        ASTNode.prototype.getRightTreeType = function () {
            return this.rightTreeType;
        };

        ASTNode.prototype.setRightTreeType = function (rightTreeType) {
            this.rightTreeType = rightTreeType;
        };

        ASTNode.prototype.getNodeType = function () {
            return this.nodeType;
        };

        ASTNode.prototype.setNodeType = function (nodeType) {
            this.nodeType = nodeType;
        };

        ASTNode.prototype.getTokenType = function () {
            return this.tokenType;
        };

        ASTNode.prototype.setTokenType = function (tokenType) {
            this.tokenType = tokenType;
        };

        ASTNode.prototype.getTreeLevel = function () {
            return this.treeLevel;
        };

        ASTNode.prototype.setTreeLevel = function (treeLevel) {
            this.treeLevel = treeLevel;
        };

        ASTNode.prototype.getLineNumber = function () {
            return this.lineNumber;
        };

        ASTNode.prototype.setLineNumber = function (lineNumber) {
            this.lineNumber = lineNumber;
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
