Compiler
========

This is my Spring 2015 Compilers class project.
See [Alan's Website](http://www.labouseur.com/courses/compilers/) for details.

[Access the Compiler](http://andrewbaran.github.io/CompilerProject/)
===========================================================
Last updated: February 8, 2015


Purpose
=======

This is a compiler, written in TypeScript, that takes an input source file in the [following grammar](http://www.labouseur.com/courses/compilers/grammar.pdf) and generates 6502 Assembly OP codes.


Project 1 Checklist
===================

- [ ] Write a complete lexer
- [ ] Write a complete parser
	- [x] Include verbose output functionality that traces the stages of the parser
- [x] Create several test programs that cause as many different types of errors as you can
- [x] Provide both errors and warnings

Project 2 Checklist
===================

- [ ] Modify your parser to create a concrete syntax tree (CST) while parsing
	- [ ] Display the CST
- [ ] Write a semantic analyzer that scope-checks and type-checks the CST for our grammar
	- [ ] Create a display a symbol table with type and scope information
	- [ ] Create an display the abstract syntax tree (AST)
	- [ ] Issue warnings about declared but unused identifiers
	- [ ] Issue warnings about use of uninitialized variables but do not treat them as errors
	- [ ] Issue verbose output functionality that traces the semantic analysis stages
	- [ ] When you detect an error, report it in helpful detail including where it was found 

Final Project Checklist
=======================

- [ ] Write a code generator that takes your AST and generates 6502a machine code for our grammar 
