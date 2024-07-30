const Parser = require('tree-sitter');
const Java = require('tree-sitter-java')
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
  parser.setLanguage(Java);
  const tree = parser.parse(inputCode);
  return cstToAst(tree.rootNode);
}

// Example usage
const code = `
// Person.java
public class Person {
    private String name;
    private int age;

    // Constructor
    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    // Getter for name
    public String getName() {
        return name;
    }

    // Setter for name
    public void setName(String name) {
        this.name = name;
    }

    // Getter for age
    public int getAge() {
        return age;
    }

    // Setter for age
    public void setAge(int age) {
        this.age = age;
    }

    // Method to display person details
    public void displayPerson() {
        System.out.println("Name: " + name);
        System.out.println("Age: " + age);
    }
}

// Main.java
public class Main {
    public static void main(String[] args) {
        // Create a new Person object
        Person person = new Person("John Doe", 30);

        // Display person details
        person.displayPerson();

        // Update person details
        person.setName("Jane Doe");
        person.setAge(25);

        // Display updated person details
        person.displayPerson();
    }
}

`;

const ast = parseCode(code);

function saveAstAsJson(ast, filename) {
  const jsonAst = JSON.stringify(ast, null, 2);
  fs.writeFileSync(filename, jsonAst, 'utf8');
}

const outputFilename = 'ast.json';
saveAstAsJson(ast, outputFilename);

console.log(`AST saved to ${outputFilename}`);
