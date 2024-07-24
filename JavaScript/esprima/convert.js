const esprima = require('esprima');
const prettyPrint = require('ast-pretty-print');
const fs = require('fs');

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

const ast = esprima.parseScript(code, { range: true, tokens: true, comment: true, loc: true });
const formattedAST = prettyPrint(ast);

fs.writeFileSync('esprimaReadableAST.txt', formattedAST, 'utf8');
console.log('Readable AST has been written to esprimaReadableAST.txt');
