const Parser = require('tree-sitter');
const JavaScript = require('tree-sitter-javascript')
const fs = require('fs');

class ASTNode {
  constructor(type, children = []) {
    this.type = type;
    this.children = children;
  }
}

function cstToAst(cstNode) {
  const astNode = new ASTNode(cstNode.type);
  for (const child of cstNode.children) {
    if (child.children.length > 0) {
      astNode.children.push(cstToAst(child));
    } else {
      astNode.children.push(child.text);
    }
  }
  return astNode;
}

function parseCode(inputCode) {
  const parser = new Parser();
  parser.setLanguage(JavaScript);
  const tree = parser.parse(inputCode);
  return cstToAst(tree.rootNode);
}

// Example usage
const code = `
// Function to add two numbers
function add(a, b) {
    return a + b;
}

// Function to subtract two numbers
function subtract(a, b) {
    return a - b;
}

// Function to multiply two numbers
function multiply(a, b) {
    return a * b;
}

// Function to divide two numbers
function divide(a, b) {
    if (b === 0) {
        return "Error: Division by zero";
    }
    return a / b;
}

// Example usage
let num1 = 10;
let num2 = 5;

console.log("Addition: " + add(num1, num2));         // Addition: 15
console.log("Subtraction: " + subtract(num1, num2)); // Subtraction: 5
console.log("Multiplication: " + multiply(num1, num2)); // Multiplication: 50
console.log("Division: " + divide(num1, num2));      // Division: 2

`

const ast = parseCode(code);

function saveAstAsJson(ast, filename) {
  const jsonAst = JSON.stringify(ast, null, 2);
  fs.writeFileSync(filename, jsonAst, 'utf8');
}

const outputFilename = 'ast.json';
saveAstAsJson(ast, outputFilename);

console.log(`AST saved to ${outputFilename}`);
