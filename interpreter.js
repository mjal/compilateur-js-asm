var babylon = require("@babel/parser")
var fs      = require("fs");

var filename = process.argv[2];
if (!filename) {
  console.error("no filename specified");
  process.exit(0);
}

var file = fs.readFileSync(filename, "utf8");
var ast  = babylon.parse(file);

let state = {}

var gShouldBreak = false
var gShouldContinue = false

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
    return node.value
  } else if (node.type == "StringLiteral") {
    return node.value
  } else if (node.type == "NullLiteral") {
    return null
  } else if (node.type == "BinaryExpression") {
    if (node.operator == "+") {
      return run(node.left) + run(node.right)
    } else if (node.operator == "*") {
      return run(node.left) * run(node.right)
    } else if (node.operator == "<") {
      return run(node.left) < run(node.right)
    } else if (node.operator == "==") {
      return run(node.left) == run(node.right)
    } else if (node.operator == "!=") {
      return run(node.left) != run(node.right)
    } else if (node.operator == "/") {
      return run(node.left) / run(node.right)
    } else {
      console.log(node)
      return null
    }
  } else if (node.type == "LogicalExpression") {
    if (node.operator == "&&") {
      return run(node.left) && run(node.right)
    }
  } else if (node.type == "BooleanLiteral") {
    return node.value
  } else if (node.type == "Identifier") {
    return state[node.name]
  } else if (node.type == "MemberExpression") {
    try {
      return state[node.object][node.property]
    } catch (e) {
      return undefined
    }
  } else if (node.type == "ExpressionStatement") {
    //console.log("Debug ExpressionStatement", node.expression)
    console.log("ExpressionStatement", run(node.expression))
  } else if (node.type == "VariableDeclaration") {
    for (decl of node.declarations) {
      let name  = decl.id.name
      let value = run(decl.init)
      state[name] = value
      console.log("VariableDeclaration", name, value)
    }
  } else if (node.type == "UpdateExpression") {
    if (node.operator == "++") {
      state[node.argument.name] = state[node.argument.name] + 1;
      if (node.prefix) {
        return state[node.argument.name] + 1
      } else {
        return state[node.argument.name]
      }
    } else if (node.operator == "--") {
      state[node.argument.name] = state[node.argument.name] - 1;
      if (node.prefix) {
        return state[node.argument.name] - 1
      } else {
        return state[node.argument.name]
      }
    } else {
      console.error("run / UpdateExpression / ", node)
    }
  } else if (node.type == "AssignmentExpression") {
    if (node.left.type == "Identifier") {
      if (node.operator == "=") {
        state[node.left.name] = run(node.right)
      } else if (node.operator == "+=") {
        state[node.left.name] += run(node.right)
      } else if (node.operator == "-=") {
        state[node.left.name] -= run(node.right)
      } else {
        console.error("run / AssignmentExpression / ", node)
      }
    } else {
      console.error("run / AssignmentExpression / ", node)
    }

  // Boucles
  } else if (node.type == "WhileStatement") {
    while (run(node.test)) {
      if (gShouldBreak) {
        gShouldBreak = false
        break
      }
      run(node.body)
    }
  } else if (node.type == "ForStatement") {
    if (node.init) { run(node.init) }
    while (run(node.test)) {
      if (gShouldBreak) {
        gShouldBreak = false
        break
      }
      run(node.body)
      run(node.update)
    }

  } else if (node.type == "BlockStatement") {
    for (e of node.body) {
      if (gShouldContinue) {
        gShouldContinue = false
        break
      }
      run(e)
    }

  } else if (node.type == "CallExpression") {
    if (node.callee.name == "print") {
      for (e of node.arguments) {
        let returnValue = run(e)
        console.log("Print", returnValue)
      }
      return null
    } else {
      console.error("run / CallExpression / ", node)
    }
  } else if (node.type == "IfStatement") {
    if (run(node.test)) {
      run(node.consequent)
    }
  } else if (node.type == "EmptyStatement") {
    return null
  } else if (node.type == "FunctionDeclaration") {
    return null
  } else if (node.type == "BreakStatement") {
    gShouldBreak = true
    return null
  } else if (node.type == "ContinueStatement") {
    gShouldContinue = true
    return null
  } else {
    console.error("run / else / ", node)
  }

  return null;
}

run(ast)
