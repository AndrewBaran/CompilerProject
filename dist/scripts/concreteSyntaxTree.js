var Compiler;
(function (Compiler) {
    var ConcreteSyntaxTree = (function () {
        function ConcreteSyntaxTree() {
            this.root = null;
            this.currentNode = null;
        }
        ConcreteSyntaxTree.prototype.insertInteriorNode = function (operator) {
            Compiler.Logger.log("Adding interior node: " + operator, "cst");

            var node = new CSTNode();
            node.setOperator(operator);

            if (this.root === null) {
                this.root = node;
                this.currentNode = node;
            } else {
                this.currentNode.addChild(node);
                this.currentNode = node;
            }
        };

        ConcreteSyntaxTree.prototype.insertLeafNode = function (token) {
        };

        ConcreteSyntaxTree.prototype.preOrderTraversal = function () {
            this.root.preOrderTraversal(this.root);
        };
        return ConcreteSyntaxTree;
    })();
    Compiler.ConcreteSyntaxTree = ConcreteSyntaxTree;

    // Structs
    var CSTNode = (function () {
        function CSTNode() {
            this.operator = "";

            this.parent = null;
            this.childList = [];
        }
        CSTNode.prototype.addChild = function (newNode) {
            newNode.setParent(this);
            this.childList.push(newNode);
        };

        CSTNode.prototype.getOperator = function () {
            return this.operator;
        };

        CSTNode.prototype.setOperator = function (operator) {
            this.operator = operator;
        };

        CSTNode.prototype.setParent = function (parent) {
            this.parent = parent;
        };

        CSTNode.prototype.getNumChildren = function () {
            return this.childList.length;
        };

        CSTNode.prototype.preOrderTraversal = function (root) {
            if (root !== null) {
                Compiler.Logger.log("Op: " + root.getOperator(), "cst");

                for (var i = 0; i < root.getNumChildren(); i++) {
                    root.preOrderTraversal(root.childList[i]);
                }
            }
        };
        return CSTNode;
    })();
})(Compiler || (Compiler = {}));
