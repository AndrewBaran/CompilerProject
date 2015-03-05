var Compiler;
(function (Compiler) {
    var ConcreteSyntaxTree = (function () {
        function ConcreteSyntaxTree() {
            this.root = null;
            this.currentNode = null;
        }
        ConcreteSyntaxTree.prototype.insertInteriorNode = function (value) {
            // TODO: Remove after testing
            Compiler.Logger.log("Adding interior node: Value: " + value, "cst");

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
            // TODO: Remove after testing
            Compiler.Logger.log("Adding leaf node: Type: " + token.getTokenName() + " | Value = " + token.getValue(), "cst");

            var node = new CSTNode();
            node.setType(token.getTokenName());
            node.setValue(token.getValue());

            if (this.root === null) {
                node.setTreeLevel(0);

                this.root = node;
                this.currentNode = node;
            } else {
                var nextLevel = this.currentNode.getTreeLevel() + 1;
                node.setTreeLevel(nextLevel);

                this.currentNode.addChild(node);
            }
        };

        ConcreteSyntaxTree.prototype.preOrderTraversal = function () {
            this.root.preOrderTraversal(this.root);
        };

        ConcreteSyntaxTree.prototype.moveToParent = function () {
            var parent = this.currentNode.getParent();

            if (parent !== null) {
                // TODO: Remove after testing
                Compiler.Logger.log("Moving to Parent: Value: " + parent.getValue());

                this.currentNode = this.currentNode.getParent();
            } else {
                var errorMessage = "Error! Current CST node (" + this.currentNode.getValue() + ") does not have a parent to move to.";

                Compiler.Logger.log(errorMessage);
                throw errorMessage;
            }
        };
        return ConcreteSyntaxTree;
    })();
    Compiler.ConcreteSyntaxTree = ConcreteSyntaxTree;

    // Structs
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

        CSTNode.prototype.addChild = function (newNode) {
            newNode.setParent(this);
            this.childList.push(newNode);
        };

        CSTNode.prototype.preOrderTraversal = function (root) {
            if (root !== null) {
                Compiler.Logger.log(root.getTreeLevel() + ". Type: " + root.getType() + " | Value: " + root.getValue(), "cst");

                for (var i = 0; i < root.childList.length; i++) {
                    root.preOrderTraversal(root.childList[i]);
                }
            }
        };
        return CSTNode;
    })();
})(Compiler || (Compiler = {}));
