const fs = require('fs');
const { parse } = require('abstract-syntax-tree');


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

// Parse the code into an AST
const parsedAst = parse(code, { locations: true, range: true });

// Convert the AST to a formatted string
const formattedAst = JSON.stringify(parsedAst, null, 4);


fs.writeFile('result.json', formattedAst, (err) => {
    if (err) throw err;
    console.log('Formatted AST has been written to result.json');
});
