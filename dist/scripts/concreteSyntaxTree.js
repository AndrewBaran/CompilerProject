var Compiler;
(function (Compiler) {
    var ConcreteSyntaxTree = (function () {
        function ConcreteSyntaxTree() {
            this.root = null;
            this.currentNode = null;
        }
        ConcreteSyntaxTree.prototype.insertInteriorNode = function (value) {
            var node = new CSTNode();
            node.setValue(value);

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

        ConcreteSyntaxTree.prototype.insertLeafNode = function (token) {
            var node = new CSTNode();
            node.setType(token.getTokenName());
            node.setValue(token.getValue());

            if (this.root === null) {
                var errorMessage = "Error! Cannot insert leaf node [ " + node.getValue() + " ] as the root node.";

                Compiler.Logger.log(errorMessage);
                throw errorMessage;
            } else {
                var nextLevel = this.currentNode.getTreeLevel() + 1;
                node.setTreeLevel(nextLevel);

                this.currentNode.addChild(node);
            }
        };

        ConcreteSyntaxTree.prototype.printPreOrder = function () {
            this.root.printPreOrder(this.root);
        };

        ConcreteSyntaxTree.prototype.moveToParent = function () {
            var parent = this.currentNode.getParent();

            if (parent !== null) {
                this.currentNode = parent;
            } else {
                var errorMessage = "Error! Current CST node (" + this.currentNode.getValue() + ") does not have a parent to move to.";

                Compiler.Logger.log(errorMessage);
                throw errorMessage;
            }
        };

        ConcreteSyntaxTree.prototype.buildAST = function () {
            var ast = new Compiler.AbstractSyntaxTree();

            this.root.buildPreOrder(this.root, ast);
            return ast;
        };
        return ConcreteSyntaxTree;
    })();
    Compiler.ConcreteSyntaxTree = ConcreteSyntaxTree;

    var CSTNode = (function () {
        function CSTNode() {
            this.type = "";
            this.value = "";

            this.treeLevel = 0;

            this.parent = null;
            this.childList = [];
        }
        CSTNode.prototype.getValue = function () {
            return this.value;
        };

        CSTNode.prototype.setValue = function (value) {
            this.value = value;
        };

        CSTNode.prototype.getType = function () {
            return this.type;
        };

        CSTNode.prototype.setType = function (type) {
            this.type = type;
        };

        CSTNode.prototype.getParent = function () {
            return this.parent;
        };

        CSTNode.prototype.setParent = function (parent) {
            this.parent = parent;
        };

        CSTNode.prototype.getTreeLevel = function () {
            return this.treeLevel;
        };

        CSTNode.prototype.setTreeLevel = function (treeLevel) {
            this.treeLevel = treeLevel;
        };

        CSTNode.prototype.addChild = function (child) {
            child.setParent(this);
            this.childList.push(child);
        };

        CSTNode.prototype.printPreOrder = function (root) {
            if (root !== null) {
                var indentDashes = "";
                var treeLevel = root.getTreeLevel();

                for (var i = 0; i < treeLevel; i++) {
                    indentDashes += "-";
                }

                // Interior node
                if (root.childList.length > 0) {
                    Compiler.Logger.log(indentDashes + "< " + root.getValue() + " >", "cst");
                } else {
                    Compiler.Logger.log(indentDashes + "[ " + root.getValue() + " ]", "cst");
                }

                for (var i = 0; i < root.childList.length; i++) {
                    root.printPreOrder(root.childList[i]);
                }
            }
        };

        CSTNode.prototype.buildPreOrder = function (root, abstractSyntaxTree) {
            if (root !== null) {
                var wentDownALevel = true;

                switch (root.getValue()) {
                    case cstNodeTypes.BLOCK:
                        abstractSyntaxTree.insertInteriorNode(astNodeTypes.BLOCK);
                        break;

                    default:
                        wentDownALevel = false;
                        break;
                }

                for (var i = 0; i < root.childList.length; i++) {
                    root.buildPreOrder(root.childList[i], abstractSyntaxTree);
                }

                if (wentDownALevel) {
                    abstractSyntaxTree.moveToParent();
                }
            }
        };
        return CSTNode;
    })();
})(Compiler || (Compiler = {}));
