// let input = require("./input.json")

var babylon = require("@babel/parser")
var fs      = require("fs");

var filename = process.argv[2];
if (!filename) {
  console.error("no filename specified");
  process.exit(0);
}

var file = fs.readFileSync(filename, "utf8");
var ast  = babylon.parse(file);

let output = (value) => {
  if (value === undefined) {
    console.error("Undefined")
  } else {
    process.stdout.write(""+value)
  }
}

let indent = ""

let f = (node) => {
  if (!node) {
    console.error("Undefined node")
  }
  if (node.type == "File") {
      f(node.program)
  } else if (node.type == "Program") {
    for (let i = 0; i < node.body.length; i++) {
      f(node.body[i])
    }
  }
  else if (node.type == "ExpressionStatement") {
    f(node.expression)
    output(";\n" + indent)
  } else if (node.type == "BinaryExpression") {
    if (node.extra && node.extra.parenthesized) {
      output("( ")
    }
    f(node.left)
    output(" " + node.operator + " ")
    f(node.right)
    if (node.extra && node.extra.parenthesized) {
      output(" )")
    }
  } else if (node.type == "NumericLiteral") {
    output(node.value)
  } else if (node.type == "CommentLine") {
    output("// " + node.value)
  } else if (node.type == "VariableDeclaration") {
    output(node.kind + " ")
    let first = true;
    for (decl of node.declarations) {
      if (!first) {
        output(", ");
      }
      f(decl)
      first = false;
    }
    output(";")
    if (node.trailingComments) for (e of node.trailingComments) {
      output(" ")
      f(e)
    }
    output("\n" + indent)
  } else if (node.type == "VariableDeclarator") {
    f(node.id)
    if (node.init) {
      output(" = ")
      f(node.init)
    }
  } else if (node.type == "Identifier") {
    output(node.name)
  } else if (node.type == "StringLiteral") {
    output("\"")
    output(node.value)
    output("\"")
  } else if (node.type == "NullLiteral") {
    output("null")
  } else if (node.type == "WhileStatement") {
    output("while (")
    f(node.test)
    output(")\n")
    f(node.body)
  } else if (node.type == "UpdateExpression") {
    if (node.prefix) {
      output(node.operator)
      f(node.argument)
    } else {
      f(node.argument)
      output(node.operator)
    }
  } else if (node.type == "CallExpression") {
    f(node.callee)
    output("(")
    let first = true
    if (node.arguments) for (e of node.arguments) {
      if (!first) output(", ")
      f(e)
      first = false
    }
    output(")")
  } else if (node.type == "NewExpression") {
    output("new ")
    f(node.callee)
    output("(")
    let first = true
    if (node.arguments) for (e of node.arguments) {
      if (!first) output(", ")
      f(e)
      first = false
    }
    output(")")
  } else if (node.type == "IfStatement") {
    output("if (")
    f(node.test)
    output(")\n" + indent)
    f(node.consequent)
  } else if (node.type == "BlockStatement") {
    if (node.body) {
      indent += "  ";
      output("{\n" + indent)
      for (e of node.body) { f(e) }
      indent = indent.slice(0, -2);
      output("}\n"  + indent)
    }
  } else if (node.type == "AssignmentExpression") {
    f(node.left)
    output(node.operator)
    f(node.right)
  } else if (node.type == "ForStatement") {
    output("for (")
    if (node.init) f(node.init)
    output("; ")
    if (node.test) f(node.test)
    output("; ")
    if (node.update) f(node.update)
    output(")\n")
    f(node.body)
  } else if (node.type == "EmptyStatement") {
    output(";\n")
  } else if (node.type == "FunctionDeclaration") {
    output("function ");
    f(node.id)
    output("(");
    let first = true
    if (node.params) for (e of node.params) {
      if (!first) output(", ");
      f(e)
      first = false
    }
    output(")");
    f(node.body)
  } else if (node.type == "BreakStatement") {
    output("break;\n" +indent);
  } else if (node.type == "ContinueStatement") {
    output("continue;\n" +indent);
  } else if (node.type == "MemberExpression") {
    f(node.object)
    output(".")
    f(node.property)
  } else if (node.type == "LogicalExpression") {
    f(node.left)
    output(" " + node.operator + " ")
    f(node.right)
  } else if (node.type == "BooleanLiteral") {
    if (node.value === true) {
      output("true")
    } else if (node.value === false) {
      output("false")
    } else {
      console.error("Invalid BooleanLiteral")
    }
  } else if (node.type == "UnaryExpression") {
    if (node.prefix == true) {
      output(node.operator)
      f(node.argument)
    } else {
      f(node.argument)
      output(node.operator)
    }
  } else if (node.type == "ReturnStatement") {
    output("return ");
    f(node.argument)
    output(";\n" + indent);
  } else if (node.type == "SwitchStatement") {
    output("switch (");
    f(node.discriminant)
    indent += "  "
    output(") {\n" + indent);
    if (node.cases) for (e of node.cases) {
      //if (!first) output(", ");
      f(e)
      //first = false
    }
    indent = indent.slice(0, -2);
    output("}\n" + indent)
  } else if (node.type == "SwitchCase") {
    indent += "  "
    if (node.test === null) {
      output("default:\n" + indent)
    } else {
      output("case ")
      f(node.test)
      output(":\n" + indent)
    }
    if (node.consequent) for (e of node.consequent) {
      f(e)
    }
    indent = indent.slice(0, -2);
  } else if (node.type == "ObjectExpression") {
    let first = true
    output("{ ")
    if (node.properties) for (e of node.properties) {
      if (!first) output(", ")
      f(e)
      first = false
    }
    output(" }")
  } else if (node.type == "ObjectProperty") {
    output(node.key.extra.raw + ": " + node.value.extra.raw)
  } else if (node.type == "ThisExpression") {
    output("this")
  } else {
    console.error("Unhandled node", node)
  }
}

f(ast)
