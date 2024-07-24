const acorn = require('acorn');
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

const ast = acorn.parse(code, { ecmaVersion: 2020 });
const formattedAST = prettyPrint(ast);

fs.writeFileSync('acornReadableAST.txt', formattedAST, 'utf8');
console.log('Readable AST has been written to acornReadableAST.txt');
