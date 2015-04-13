var Compiler;
(function (Compiler) {
    var AbstractSyntaxTree = (function () {
        function AbstractSyntaxTree() {
            this.root = null;
            this.currentNode = null;
        }
        AbstractSyntaxTree.prototype.insertInteriorNode = function (value) {
            // TODO: Remove after testing
            // Logger.log("Inserting interior node: " + value, "ast");
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
            // TODO: Remove after testing
            // Logger.log("Inserting leaf node: " + cstNode.getValue(), "ast");
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
                    // TODO: Remove after testing
                    // Logger.log("Moving from " + this.currentNode.getValue() + " to parent: " + parent.getValue(), "ast");
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

        ASTNode.prototype.buildSymbolTablePreOrder = function (root, symbolTable, pathTaken) {
            if (root !== null) {
                var newScope = false;

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

                        if (!insertResult) {
                            var errorMessage = "Error! Duplicate declaration of id " + id + " on line " + lineNumber;

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

                if (root.getTokenType() === "T_ID") {
                    var id = root.getValue();
                    var result = symbolTable.hasEntry(id, root);

                    if (!result) {
                        var errorMessage = "Error! The id " + id + " on line " + root.getLineNumber() + " was used before being declared";

                        Compiler.Logger.log(errorMessage);
                        throw errorMessage;
                    }
                }

                for (var i = 0; i < root.childList.length; i++) {
                    this.buildSymbolTablePreOrder(root.childList[i], symbolTable, pathTaken);
                }

                if (newScope) {
                    symbolTable.closeScope();
                }
            }
        };

        ASTNode.prototype.typeCheck = function (root, symbolTable) {
            Compiler.Logger.log("Type checking " + root.getValue());

            if (root.getNodeType() === treeNodeTypes.LEAF) {
                var tokenValue = TokenType[root.getTokenType()];

                if (root.getTokenType() === "String Expression") {
                    tokenValue = 27 /* T_STRING_EXPRESSION */;
                }

                var parentNode = root.getParent();

                switch (tokenValue) {
                    case 17 /* T_INT */:
                    case 18 /* T_STRING */:
                    case 19 /* T_BOOLEAN */:
                        Compiler.Logger.log("Type is " + root.getValue());
                        var type = root.getValue();

                        parentNode.setSynthesizedType(type);
                        root.setTypeInfo(type);

                        break;

                    case 12 /* T_ID */:
                        var type = root.getSymbolTableEntry().getIdType();
                        Compiler.Logger.log("Id of type " + type);

                        parentNode.setSynthesizedType(type);
                        root.setTypeInfo(type);

                        break;

                    case 11 /* T_DIGIT */:
                        var type = types.INT;
                        Compiler.Logger.log("Digit => Int");

                        parentNode.setSynthesizedType(type);
                        root.setTypeInfo(type);

                        break;

                    case 27 /* T_STRING_EXPRESSION */:
                        Compiler.Logger.log("String");
                        var type = types.STRING;

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

            Compiler.Logger.log("Node: " + root.getValue());
            Compiler.Logger.log("Left type: " + root.getLeftTreeType());
            Compiler.Logger.log("Right type: " + root.getRightTreeType());
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
