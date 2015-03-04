var Compiler;
(function (Compiler) {
    var ConcreteSyntaxTree = (function () {
        function ConcreteSyntaxTree() {
            this.root = null;
            this.currentNode = null;
        }
        ConcreteSyntaxTree.prototype.insertInteriorNode = function (operator) {
            var node = new CSTNode();
            node.setOperator(operator);

            if (this.root === null) {
                this.root = node;
                this.currentNode = node;
            } else {
                this.currentNode.addChild(node);
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

        CSTNode.prototype.setOperator = function (operator) {
            this.operator = operator;
        };

        CSTNode.prototype.setParent = function (parent) {
            this.parent = parent;
        };

        CSTNode.prototype.preOrderTraversal = function (root) {
        };
        return CSTNode;
    })();
})(Compiler || (Compiler = {}));
