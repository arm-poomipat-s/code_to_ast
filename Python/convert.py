import ast

code = """
def example_function(x):
    if x > 10:
        return x * 2
    else:
        return x + 2

class ExampleClass:
    def __init__(self, value):
        self.value = value

    def display(self):
        print(f"The value is {self.value}")

example_instance = ExampleClass(42)
example_instance.display()
"""

# Parse the code into an AST
parsed_ast = ast.parse(code)

# Convert the AST to a formatted string with indentation
ast_str = ast.dump(parsed_ast, indent=4)


with open('result.txt', 'w') as file:
    file.write(ast_str)

print("Formatted AST has been written to result.txt")

