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

        ConcreteSyntaxTree.prototype.insertLeafNode = function (tokenInfo) {
            var token = tokenInfo.token;
            var lineNumber = tokenInfo.lineFoundOn;

            var node = new CSTNode();
            node.setType(token.getTokenName());
            node.setValue(token.getValue());
            node.setNodeType(treeNodeTypes.LEAF);
            node.setLineNumber(lineNumber);

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

            this.root.buildInOrder(this.root, ast);
            return ast;
        };
        return ConcreteSyntaxTree;
    })();
    Compiler.ConcreteSyntaxTree = ConcreteSyntaxTree;

    var CSTNode = (function () {
        function CSTNode() {
            this.type = "";
            this.value = "";

            this.nodeType = "";
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

        CSTNode.prototype.getLineNumber = function () {
            return this.lineNumber;
        };

        CSTNode.prototype.setLineNumber = function (lineNumber) {
            this.lineNumber = lineNumber;
        };

        CSTNode.prototype.getNodeType = function () {
            return this.nodeType;
        };

        CSTNode.prototype.setNodeType = function (nodeType) {
            this.nodeType = nodeType;
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
                if (root.getNodeType() === treeNodeTypes.INTERIOR) {
                    Compiler.Logger.log(indentDashes + "< " + root.getValue() + " >", "cst");
                } else {
                    Compiler.Logger.log(indentDashes + "[ " + root.getValue() + " ]", "cst");
                }

                for (var i = 0; i < root.childList.length; i++) {
                    root.printPreOrder(root.childList[i]);
                }
            }
        };

        CSTNode.prototype.buildInOrder = function (root, abstractSyntaxTree, interiorNodePath) {
            if (root !== null) {
                var wentDownALevel = true;

                switch (root.getValue()) {
                    case cstNodeTypes.BLOCK:
                        abstractSyntaxTree.insertInteriorNode(astNodeTypes.BLOCK);

                        break;

                    case cstNodeTypes.VAR_DECLARATION:
                        interiorNodePath = astNodeTypes.VAR_DECLARATION;
                        abstractSyntaxTree.insertInteriorNode(interiorNodePath);

                        break;

                    case cstNodeTypes.ASSIGNMENT_STATEMENT:
                        interiorNodePath = astNodeTypes.ASSIGNMENT_STATEMENT;
                        abstractSyntaxTree.insertInteriorNode(interiorNodePath);

                        break;

                    case cstNodeTypes.PRINT_STATEMENT:
                        interiorNodePath = astNodeTypes.PRINT_STATEMENT;
                        abstractSyntaxTree.insertInteriorNode(interiorNodePath);

                        break;

                    case cstNodeTypes.IF_STATEMENT:
                        interiorNodePath = astNodeTypes.IF_STATEMENT;
                        abstractSyntaxTree.insertInteriorNode(interiorNodePath);

                        break;

                    case cstNodeTypes.WHILE_STATEMENT:
                        interiorNodePath = astNodeTypes.WHILE_STATEMENT;
                        abstractSyntaxTree.insertInteriorNode(interiorNodePath);

                        break;

                    case cstNodeTypes.INT_EXPRESSION:
                        // Add plus subtree
                        if (this.contains(this, "+")) {
                            interiorNodePath = astNodeTypes.ADD;
                            abstractSyntaxTree.insertInteriorNode(interiorNodePath);
                        } else {
                            interiorNodePath = astNodeTypes.DIGIT;
                        }

                        break;

                    case cstNodeTypes.STRING_EXPRESSION:
                        interiorNodePath = astNodeTypes.STRING_EXPRESSION;
                        abstractSyntaxTree.insertLeafNode(root, astNodeTypes.STRING_EXPRESSION);

                        break;

                    case cstNodeTypes.BOOLEAN_EXPRESSION:
                        if (this.contains(this, "==")) {
                            interiorNodePath = astNodeTypes.EQUAL;
                            abstractSyntaxTree.insertInteriorNode(interiorNodePath);
                        } else if (this.contains(this, "!=")) {
                            interiorNodePath = astNodeTypes.NOT_EQUAL;
                            abstractSyntaxTree.insertInteriorNode(interiorNodePath);
                        } else {
                            interiorNodePath = astNodeTypes.BOOLEAN_EXPRESSION;
                        }

                        break;

                    default:
                        wentDownALevel = false;
                        break;
                }

                switch (interiorNodePath) {
                    case astNodeTypes.VAR_DECLARATION:
                    case astNodeTypes.ASSIGNMENT_STATEMENT:
                    case astNodeTypes.PRINT_STATEMENT:
                    case astNodeTypes.ADD:
                    case astNodeTypes.IF_STATEMENT:
                    case astNodeTypes.WHILE_STATEMENT:
                    case astNodeTypes.EQUAL:
                    case astNodeTypes.NOT_EQUAL:
                        if (root.getNodeType() === treeNodeTypes.LEAF && !Compiler.Utils.isIgnoredLeaf(root.getValue())) {
                            abstractSyntaxTree.insertLeafNode(root);
                        }

                        break;

                    case astNodeTypes.DIGIT:
                        if (root.getNodeType() === treeNodeTypes.LEAF && !Compiler.Utils.isIgnoredLeaf(root.getValue())) {
                            abstractSyntaxTree.insertLeafNode(root);
                        }

                        wentDownALevel = false;

                        break;

                    case astNodeTypes.BOOLEAN_EXPRESSION:
                        if (root.getNodeType() === treeNodeTypes.LEAF && !Compiler.Utils.isIgnoredLeaf(root.getValue())) {
                            abstractSyntaxTree.insertLeafNode(root);
                        }

                        wentDownALevel = false;

                        break;

                    case astNodeTypes.STRING_EXPRESSION:
                        var currentASTNode = abstractSyntaxTree.getCurrentNode();
                        var childList = currentASTNode.getChildren();
                        var rightMostChild = childList[childList.length - 1];

                        // Clear out default value
                        if (rightMostChild.getValue() === astNodeTypes.STRING_EXPRESSION) {
                            rightMostChild.setValue("");
                        }

                        if (root.getNodeType() === treeNodeTypes.LEAF && !Compiler.Utils.isIgnoredLeaf(root.getValue())) {
                            // Add to existing string
                            if (rightMostChild !== null && rightMostChild.getTokenType() === astNodeTypes.STRING_EXPRESSION) {
                                // Update line number
                                if (rightMostChild.getLineNumber() === -1) {
                                    rightMostChild.setLineNumber(root.getLineNumber());
                                }

                                var currentString = rightMostChild.getValue();
                                var newString = currentString + root.getValue();

                                rightMostChild.setValue(newString);
                            }
                        }

                        wentDownALevel = false;

                        break;

                    default:
                        break;
                }

                for (var i = 0; i < root.childList.length; i++) {
                    root.buildInOrder(root.childList[i], abstractSyntaxTree, interiorNodePath);
                }

                if (wentDownALevel) {
                    abstractSyntaxTree.moveToParent();
                }
            }
        };

        // Searchs the root nodes subtree for the desired value in any of its descendent nodes
        CSTNode.prototype.contains = function (root, desiredValue) {
            if (root !== null) {
                if (root.getNodeType() === treeNodeTypes.LEAF && root.getValue() === desiredValue) {
                    return true;
                }

                var result = false;
                var childResult = false;

                for (var i = 0; i < root.childList.length; i++) {
                    childResult = root.contains(root.childList[i], desiredValue);
                    result = result || childResult;
                }

                return result;
            }
        };
        return CSTNode;
    })();
    Compiler.CSTNode = CSTNode;
})(Compiler || (Compiler = {}));
