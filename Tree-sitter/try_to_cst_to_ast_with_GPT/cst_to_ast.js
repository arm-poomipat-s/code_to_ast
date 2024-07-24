const fs = require('fs');
const Parser = require('tree-sitter');
const Python = require('tree-sitter-python');

const parser = new Parser();
parser.setLanguage(Python);

const code1 = `
def add(x, y):
    return x + y
`;

const code2 = `
def check_positive(x):
    if x > 0:
        return True
    else:
        return False
`;

const code3 = `
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def greet(self):
        print(f"Hello, my name is {self.name} and I am {self.age} years old.")
`;

const code4 = `
def count_to_n(n):
    for i in range(1, n+1):
        print(i)
`;

const code5 = `
def outer_function(x):
    def inner_function(y):
        return x + y
    return inner_function
`;

const testCases = [code1, code2, code3, code4, code5];

let output = '';

testCases.forEach((code, index) => {
    const tree = parser.parse(code);
    output += `Concrete Syntax Tree for Test Case ${index + 1}:\n`;
    output += printCST(tree.rootNode);
    
    const ast = transformCSTtoAST(tree.rootNode);
    output += `\nAbstract Syntax Tree for Test Case ${index + 1}:\n`;
    output += JSON.stringify(ast, null, 2);
    output += '\n----------------------------------------\n';
});

fs.writeFileSync('output.txt', output);

function printCST(node, indent = 0) {
    if (!node) return '';

    let result = ' '.repeat(indent) + node.type + (node.text ? ': ' + node.text : '') + '\n';
    node.namedChildren.forEach(child => result += printCST(child, indent + 2));
    return result;
}

function transformCSTtoAST(node) {
    if (!node) return null;

    // Helper functions for fetching child nodes
    const getChild = (fieldName) => node.childForFieldName(fieldName);
    const getNamedChild = (index) => node.namedChild(index);
    const getNamedChildren = () => node.namedChildren.map(transformCSTtoAST);

    switch (node.type) {
        case 'module':
            return {
                type: 'Program',
                body: getNamedChildren()  // Process all top-level statements.
            };
        case 'function_definition':
            return {
                type: 'FunctionDeclaration',
                name: getChild('name').text,
                params: transformCSTtoAST(getChild('parameters')),
                body: transformCSTtoAST(getChild('body'))
            };
        case 'parameters':
            return {
                type: 'Parameters',
                params: getNamedChildren()  // Process all parameter identifiers.
            };
        case 'identifier':
            return {
                type: 'Identifier',
                name: node.text
            };
        case 'return_statement':
            return {
                type: 'ReturnStatement',
                argument: transformCSTtoAST(getNamedChild(0))  // Transform the return argument.
            };
        case 'comparison_operator':
            return {
                type: 'BinaryExpression',
                operator: node.child(1).text,
                left: transformCSTtoAST(node.child(0)),
                right: transformCSTtoAST(node.child(2))
            };
        case 'assignment':
            return {
                type: 'Assignment',
                left: transformCSTtoAST(node.child(0)),
                right: transformCSTtoAST(node.child(2))
            };
        case 'call':
            return {
                type: 'CallExpression',
                callee: transformCSTtoAST(getNamedChild(0)),
                arguments: node.namedChildren.slice(1).map(transformCSTtoAST)  // Process all call arguments.
            };
        case 'argument_list':
            return getNamedChildren();  // Process all arguments.
        case 'f_string':
            return {
                type: 'TemplateLiteral',
                parts: getNamedChildren()  // Process all parts of the f-string.
            };
        case 'f_string_interpolation':
            return {
                type: 'TemplateElement',
                value: transformCSTtoAST(getNamedChild(0))  // Transform the interpolated value.
            };
        case 'string':
            return {
                type: 'StringLiteral',
                value: node.text
            };
        case 'expression_statement':
            return transformCSTtoAST(getNamedChild(0));  // Transform the expression inside the statement.
        case 'block':
            return getNamedChildren();  // Process all statements inside a block.
        case 'integer':
            return {
                type: 'IntegerLiteral',
                value: parseInt(node.text, 10)
            };
        case 'float':
            return {
                type: 'FloatLiteral',
                value: parseFloat(node.text)
            };
        case 'boolean':
            return {
                type: 'BooleanLiteral',
                value: node.text === 'True'
            };
        case 'none':
            return {
                type: 'NoneLiteral',
                value: null
            };
        case 'if_statement':
            return {
                type: 'IfStatement',
                test: transformCSTtoAST(node.child(1)),  // Transform the condition.
                consequent: transformCSTtoAST(node.child(3)),  // Transform the if block.
                alternate: node.namedChild(5) ? transformCSTtoAST(node.namedChild(5)) : null  // Transform the else block if it exists.
            };
        case 'else_clause':
            return {
                type: 'ElseClause',
                body: transformCSTtoAST(node.child(1))  // Transform the block in the else clause.
            };
        case 'while_statement':
            return {
                type: 'WhileStatement',
                test: transformCSTtoAST(node.child(1)),
                body: transformCSTtoAST(node.child(3))
            };
        case 'for_statement':
            return {
                type: 'ForStatement',
                left: transformCSTtoAST(node.child(1)),
                right: transformCSTtoAST(node.child(3)),
                body: transformCSTtoAST(node.child(5))
            };
        case 'break_statement':
            return {
                type: 'BreakStatement'
            };
        case 'continue_statement':
            return {
                type: 'ContinueStatement'
            };
        case 'pass_statement':
            return {
                type: 'PassStatement'
            };
        case 'class_definition':
            return {
                type: 'ClassDeclaration',
                name: getChild('name').text,
                body: transformCSTtoAST(getChild('body')),
                superClass: getChild('superclass') ? transformCSTtoAST(getChild('superclass')) : null
            };
        case 'attribute':
            return {
                type: 'MemberExpression',
                object: transformCSTtoAST(node.child(0)),
                property: transformCSTtoAST(node.child(2))
            };
        case 'subscript':
            return {
                type: 'SubscriptExpression',
                object: transformCSTtoAST(node.child(0)),
                index: transformCSTtoAST(node.child(2))
            };
        default:
            return null;
    }
}
