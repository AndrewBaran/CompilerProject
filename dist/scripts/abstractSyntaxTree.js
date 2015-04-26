var Compiler;
(function (Compiler) {
    var AbstractSyntaxTree = (function () {
        function AbstractSyntaxTree() {
            this.root = null;
            this.currentNode = null;
        }
        AbstractSyntaxTree.prototype.insertInteriorNode = function (value) {
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

        AbstractSyntaxTree.prototype.insertLeafNode = function (cstNode, newType) {
            if (this.root === null) {
                var errorMessage = "Error! Cannot insert leaf node [ " + node.getValue() + " ] as the root node.";

                Compiler.Logger.log(errorMessage);
                throw errorMessage;
            } else {
                var node = new ASTNode();

                if (newType !== undefined) {
                    node.setTokenType(newType);
                } else {
                    node.setTokenType(cstNode.getType());
                }

                if (cstNode.getNodeType() === treeNodeTypes.LEAF) {
                    node.setLineNumber(cstNode.getLineNumber());
                }

                node.setValue(cstNode.getValue());
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
                    this.currentNode = parent;
                } else {
                    var errorMessage = "Error! Current AST node (" + this.currentNode.getValue() + ") does not have a parent to move to.";

                    Compiler.Logger.log(errorMessage);
                    throw errorMessage;
                }
            }
        };

        AbstractSyntaxTree.prototype.getCurrentNode = function () {
            return this.currentNode;
        };

        AbstractSyntaxTree.prototype.getRoot = function () {
            return this.root;
        };

        AbstractSyntaxTree.prototype.printPreOrder = function () {
            this.root.printPreOrder(this.root);
        };

        AbstractSyntaxTree.prototype.buildSymbolTable = function (symbolTable) {
            this.root.buildSymbolTablePreOrder(this.root, symbolTable);
        };

        AbstractSyntaxTree.prototype.typeCheck = function (symbolTable) {
            this.root.typeCheck(this.root, symbolTable);
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

            this.parent = null;

            this.symbolTableEntry = null;

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

        ASTNode.prototype.getSymbolTableEntry = function () {
            return this.symbolTableEntry;
        };

        ASTNode.prototype.setSymbolTableEntry = function (symbolTableEntry) {
            this.symbolTableEntry = symbolTableEntry;
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

        ASTNode.prototype.getChildren = function () {
            return this.childList;
        };

        ASTNode.prototype.printPreOrder = function (root) {
            if (root !== null) {
                var indentDashes = "";
                var treeLevel = root.getTreeLevel();

                for (var i = 0; i < treeLevel; i++) {
                    indentDashes += "-";
                }

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

        ASTNode.prototype.buildSymbolTablePreOrder = function (root, symbolTable) {
            if (root !== null) {
                var newScope = false;
                var optionalPath = "";

                switch (root.getValue()) {
                    case astNodeTypes.BLOCK:
                        symbolTable.openScope();
                        newScope = true;

                        break;

                    case astNodeTypes.VAR_DECLARATION:
                        var id = root.childList[1].getValue();
                        var lineNumber = root.childList[1].getLineNumber();
                        var type = root.childList[0].getValue();

                        var insertResult = symbolTable.insertEntry(id, type, lineNumber);

                        optionalPath = astNodeTypes.VAR_DECLARATION;

                        if (!insertResult) {
                            var errorMessage = "Error! Duplicate declaration of id " + id + " found on line " + lineNumber;

                            Compiler.Logger.log(errorMessage);
                            throw errorMessage;
                        }

                        break;

                    case astNodeTypes.ASSIGNMENT_STATEMENT:
                        var id = root.childList[0].getValue();
                        var result = symbolTable.hasEntry(id, root, astNodeTypes.ASSIGNMENT_STATEMENT);

                        if (!result) {
                            var errorMessage = "Error! The id " + id + " on line " + root.childList[0].getLineNumber() + " was used before being declared";

                            Compiler.Logger.log(errorMessage);
                            throw errorMessage;
                        }

                        break;
                }

                if (TokenType[root.getTokenType()] === 12 /* T_ID */) {
                    var id = root.getValue();
                    var result = symbolTable.hasEntry(id, root, optionalPath);

                    if (!result) {
                        var errorMessage = "Error! The id " + id + " on line " + root.getLineNumber() + " was used before being declared";

                        Compiler.Logger.log(errorMessage);
                        throw errorMessage;
                    }
                }

                for (var i = 0; i < root.childList.length; i++) {
                    this.buildSymbolTablePreOrder(root.childList[i], symbolTable);
                }

                if (newScope) {
                    symbolTable.closeScope();
                }
            }
        };

        ASTNode.prototype.typeCheck = function (root, symbolTable) {
            if (root.getNodeType() === treeNodeTypes.LEAF) {
                var tokenValue = TokenType[root.getTokenType()];

                if (root.getTokenType() === "String Expression") {
                    tokenValue = 27 /* T_STRING_EXPRESSION */;
                    root.setTokenType(TokenType[tokenValue]);
                }

                var parentNode = root.getParent();

                switch (tokenValue) {
                    case 17 /* T_INT */:
                    case 18 /* T_STRING */:
                    case 19 /* T_BOOLEAN */:
                        var type = root.getValue();

                        parentNode.setSynthesizedType(type);
                        root.setTypeInfo(type);

                        break;

                    case 12 /* T_ID */:
                        var type = root.getSymbolTableEntry().getIdType();

                        parentNode.setSynthesizedType(type);
                        root.setTypeInfo(type);

                        break;

                    case 11 /* T_DIGIT */:
                        var type = types.INT;

                        parentNode.setSynthesizedType(type);
                        root.setTypeInfo(type);

                        break;

                    case 27 /* T_STRING_EXPRESSION */:
                        var type = types.STRING;

                        parentNode.setSynthesizedType(type);
                        root.setTypeInfo(type);

                        break;

                    case 25 /* T_TRUE */:
                    case 24 /* T_FALSE */:
                        var type = types.BOOLEAN;

                        parentNode.setSynthesizedType(type);
                        root.setTypeInfo(type);

                        break;

                    default:
                        break;
                }
            }

            for (var i = 0; i < root.childList.length; i++) {
                root.typeCheck(root.childList[i], symbolTable);
            }

            // Propagate type info up the tree by combining type info from nodes children
            if (root.getNodeType() === treeNodeTypes.INTERIOR && root.getValue() !== astNodeTypes.BLOCK) {
                var leftType = root.getLeftTreeType();
                var rightType = root.getRightTreeType();

                var parentNode = root.getParent();

                if (leftType !== "" && rightType !== "") {
                    Compiler.Logger.logVerbose("Checking if " + leftType + " is type compatible with " + rightType + " on line " + root.childList[0].getLineNumber());

                    if (leftType === rightType) {
                        if (parentNode.getValue() !== astNodeTypes.BLOCK) {
                            // leftType == rightType, so either is fine
                            var typeToPropagate = leftType;

                            // Propagate boolean result from comparison
                            if (root.getValue() === astNodeTypes.EQUAL || root.getValue() === astNodeTypes.NOT_EQUAL) {
                                typeToPropagate = types.BOOLEAN;
                            }

                            Compiler.Logger.logVerbose("Propagating the type " + typeToPropagate + " on line " + root.childList[0].getLineNumber() + " up to the parent " + parentNode.getValue());

                            parentNode.setSynthesizedType(typeToPropagate);
                        }

                        root.setTypeInfo(leftType);
                    } else {
                        var errorMessage = "Error! Type mismatch on line " + root.childList[0].getLineNumber() + ": " + root.childList[0].getValue() + " with the type " + leftType + " on the LHS does not match the type " + rightType + " on the RHS of the expression";

                        Compiler.Logger.log(errorMessage);
                        throw errorMessage;
                    }
                } else if (leftType !== "" && rightType === "") {
                    Compiler.Logger.logVerbose("Setting type of " + root.getValue() + " on line " + root.childList[0].getLineNumber() + " to " + leftType);
                    root.setTypeInfo(leftType);
                } else if (leftType === "" && rightType !== "") {
                    Compiler.Logger.logVerbose("Setting type of " + root.getValue() + " on line " + root.childList[0].getLineNumber() + " to " + rightType);
                    root.setTypeInfo(rightType);
                }
            }
        };

        ASTNode.prototype.setSynthesizedType = function (typeFromChild) {
            if (this.getLeftTreeType() === "") {
                this.setLeftTreeType(typeFromChild);
            } else if (this.getRightTreeType() === "") {
                this.setRightTreeType(typeFromChild);
            } else {
                var errorMessage = "Error! Attempt was made to synthesize a type to a parent with its left and right types already set.";

                Compiler.Logger.log(errorMessage);
                throw errorMessage;
            }
        };
        return ASTNode;
    })();
    Compiler.ASTNode = ASTNode;
})(Compiler || (Compiler = {}));
