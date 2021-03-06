Compiler
========

This is my Spring 2015 Compilers class project.
See [Alan's Website](http://www.labouseur.com/courses/compilers/) for details.

[Access the Compiler](http://andrewbaran.github.io/CompilerProject/)
===========================================================
Last updated: May 15, 2015


Purpose
=======

This is a compiler, written in TypeScript, that takes an input source file in the [following grammar](http://www.labouseur.com/courses/compilers/grammar.pdf) and generates 6502a Assembly OP codes.


Project 1 Checklist
===================

- [x] Write a complete lexer
- [x] Write a complete parser
	- [x] Include verbose output functionality that traces the stages of the parser
- [x] Create several test programs that cause as many different types of errors as you can
- [x] Provide both errors and warnings

Project 2 Checklist
===================

- [x] Modify your parser to create a concrete syntax tree (CST) while parsing
	- [x] Display the CST
- [x] Write a semantic analyzer that scope-checks and type-checks the CST for our grammar
	- [x] Create and display a symbol table with type and scope information
	- [x] Create and display the abstract syntax tree (AST)
- [x] Type-check the source code using the AST to catch:
	- [x] Undeclared identifiers
	- [x] Redeclared identifiers in the same scope
	- [x] Type mismatches
- [x] Issue warnings about:
	- [x] Declared but unused identifiers
	- [x] Use of uninitialized variables, but do not treat them as errors
- [x] Issue verbose output functionality that traces the semantic analysis stages
	- [x] When you detect an error, report it in helpful detail, including where it was found 

Final Project Checklist
=======================

- [x] Write a code generator that takes your AST and generates 6502a machine code for our grammar 
	- [x] Variable Declarations
		- [x] Int
		- [x] Boolean
		- [x] String
	- [x] Assignment Statements
		- [x] Int Literal
		- [x] Int Id
		- [x] Int Addition
		- [x] Boolean Literal
		- [x] Boolean Id
		- [x] Boolean Comparisons
		- [x] String
		- [x] String Id
	- [x] Print Statements
		- [x] Int Literal
		- [x] Int Addition
		- [x] Int Id
		- [x] Boolean Literal
		- [x] Boolean Comparisons
		- [x] Boolean Id
		- [x] String Literal
		- [x] String Id
	- [x] While Statements
	- [x] If Statements
	- [x] Comparisons
		- [x] Int Literal to Int Literal
		- [x] Int Literal to Int Id
		- [x] Int Id to Int Id
		- [x] Boolean Literal to Boolean Literal
		- [x] Boolean Literal to Boolean Id
		- [x] Boolean Id to Boolean Id
		- [x] String Id to String Id
	- [x] Backpatching
		- [x] Temp Var Table
		- [x] Jump Table