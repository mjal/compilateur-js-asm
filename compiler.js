var babylon = require("@babel/parser")
var fs      = require("fs");

var program = {
  text: [],
  data: [],
  vars: []
}

let output = (cmd) => {
  program.text.push(cmd)
}

var filename = process.argv[2];
if (!filename) {
  console.error("no filename specified");
  process.exit(0);
}

var file = fs.readFileSync(filename, "utf8");
var ast  = babylon.parse(file);

let run = (node) => {
  if (!node) {
    console.error("undefined node :/")
    return null
  }
  if (node.type == "File") {
      run(node.program)
  } else if (node.type == "Program") {
    for (let i = 0; i < node.body.length; i++) {
      run(node.body[i])
    }
  } else if (node.type == "NumericLiteral") {
    output("pushq $" + node.value)
  } else if (node.type == "ExpressionStatement") {
    run(node.expression)
    output("popq %rax");
    output("movq %rax, %rdi");
  } else if (node.type == "BinaryExpression") {
    // Push operands
    run(node.left)
    run(node.right)
    output("popq %rbx");
    output("popq %rax");
    if (node.operator == "+") {
      output("addq %rbx, %rax");
    } else if (node.operator == "-") {
      output("subq %rbx, %rax");
    } else if (node.operator == "*") {
      output("imulq %rbx, %rax");
    } else {
      console.log("unhandled BinaryExpression", node)
      output("addq %rbx, %rax");
    }
    output("pushq %rax");
  } else if (node.type == "VariableDeclaration") {
	  for (let i = 0; i < node.declarations.length; i++) {
      let decl = node.declarations[i]
      program.data.push("var__"+decl.id.name+":")
      program.vars.push(decl.id.name)
      if (!decl.init) {
        program.data.push("    .long 0")
      } else if (decl.init.type == "NumericLiteral") {
        program.data.push("    .long " + decl.init.value)
      } else if (decl.init.type == "NullLiteral") {
        program.data.push("    .long 0")
      } else if (decl.init.type == "StringLiteral") {
			  program.data.push("    .string "+ "\"" + decl.init.value + "\"")
      } else if (decl.init.type == "ObjectExpression") {
        for (let j = 0; j < decl.init.properties.length; j++) {
          let attr = decl.init.properties[j]
          program.data.push("      .long var__" + decl.id.name + "_" + attr.key.value + ":")
          if (attr.value.type == "NumericLiteral") {
            program.data.push("      .long " + attr.value.value)
          } else if (attr.value.type == "NullLiteral") {
            program.data.push("      .long 0")
          } else if (attr.value.type == "StringLiteral") {
			      program.data.push("      .string "+ "\"" + attr.value.value + "\"")
          } else {
            console.log("unhandled ObjectExpression", decl)
          }
        }
      } else {
        console.log("unhandled VariableDeclaration", decl)
      }
    }
  } else {
    console.log("unhandled ", node)
  }
}

run(ast)

console.log(".section .data")
for (let i = 0; i < program.data.length; i++)
  console.log(program.data[i])
console.log("")
console.log(".section .text")
console.log(".global main")
console.log("")
console.log("main:")
for (let i = 0; i < program.text.length; i++)
  console.log("    " + program.text[i])
