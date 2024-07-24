const Parser = require('tree-sitter');
const JavaScript = require('tree-sitter-javascript');
const fs = require('fs');

const parser = new Parser();
parser.setLanguage(JavaScript);

const code = `
function exampleFunction(x) {
    if (x > 10) {
        return x * 2;
    } else {
        return x + 2;
    }
}

class ExampleClass {
    constructor(value) {
        this.value = value;
    }

    display() {
        console.log(\`The value is \${this.value}\`);
    }
}

const exampleInstance = new ExampleClass(42);
exampleInstance.display();
`;

const tree = parser.parse(code);

function serializeNode(node) {
    return {
        type: node.type,
        startIndex: node.startIndex,
        endIndex: node.endIndex,
        children: node.namedChildren.map(serializeNode)
    };
}

const astJson = serializeNode(tree.rootNode);

fs.writeFileSync('tree-sitter-ast.json', JSON.stringify(astJson, null, 2));
console.log('AST has been serialized to tree-sitter-ast.json');
