var babylon = require("@babel/parser")
var fs      = require("fs");

var program = {
  text: [],
  data: [],
  func: [],
  vars: []
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
    program.text.push("pushq $" + node.value)
  } else if (node.type == "ExpressionStatement") {
    run(node.expression)
    program.text.push("popq %rax");
    program.text.push("movq %rax, %rdi");
  } else if (node.type == "BinaryExpression") {
    // Push operands
    run(node.left)
    run(node.right)
    program.text.push("popq %rbx");
    program.text.push("popq %rax");
    if (node.operator == "+") {
      program.text.push("addq %rbx, %rax");
    } else if (node.operator == "-") {
      program.text.push("subq %rbx, %rax");
    } else if (node.operator == "*") {
      program.text.push("imulq %rbx, %rax");
    } else {
      console.log("unhandled BinaryExpression", node)
    }
    program.text.push("pushq %rax");
  } else if (node.type == "VariableDeclaration") {
	  for (let i = 0; i < node.declarations.length; i++) {
      let decl = node.declarations[i]
      program.data.push("__var__"+decl.id.name+":")
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

        program.text.push("call obj_new")
        program.text.push("movq %rax, %rbx")

        for (let j = 0; j < decl.init.properties.length; j++) {
          let attr = decl.init.properties[j]

          //console.log(attr)
          attr_name = "__attr__" + decl.id.name + "_" + attr.key.name
          program.data.push(attr_name + ":")
          program.data.push("    .string \""+attr.key.name+"\"")

          program.text.push("movq %rbx, %rdi") // TODO use movq
          program.text.push("lea "+attr_name+", %rsi") // TODO use movq
          program.text.push("movq $"+attr.value.value+", %rdx")
          program.text.push("call obj_set")

          //program.data.push("    .string" + decl.id.name + "_" + attr.key.value + ":")
          //console.log(attr)

          //if (attr.value.type == "NumericLiteral") {
          //  program.data.push("      .long " + attr.value.value)
          //} else if (attr.value.type == "NullLiteral") {
          //  program.data.push("      .long 0")
          //} else if (attr.value.type == "StringLiteral") {
			    //  program.data.push("      .string "+ "\"" + attr.value.value + "\"")
          //} else {
          //  console.log("unhandled ObjectExpression", decl)
          //}
        }
      } else {
        console.log("unhandled VariableDeclaration", decl)
      }
    }
  } else if (node.type == "Identifier") {
    console.log("unhandled ", node)
	  program.text.push("    movl __var__"+node.name+", %eax")
		program.text.push("    pushq %rax")
  } else if (node.type == "Identifier") {
    console.log("unhandled ", node)
  } else if (node.type == "AssignmentExpression") {
    if (node.left.type == "MemberExpression") {
      program.text.push("movl $"+node.right.value+", %edi")
      program.text.push("call obj_set")
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
