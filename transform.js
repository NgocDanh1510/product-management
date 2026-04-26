module.exports = function (fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  // Helper to check if a CallExpression chain contains a specific method
  function hasMethodInChain(node, methodNames) {
    if (!node) return false;
    if (node.type === "CallExpression") {
      if (node.callee.type === "MemberExpression") {
        if (
          node.callee.property &&
          methodNames.includes(node.callee.property.name)
        ) {
          return true;
        }
        return hasMethodInChain(node.callee.object, methodNames);
      }
    }
    return false;
  }

  root.find(j.AwaitExpression).forEach((path) => {
    let callExpr = path.node.argument;
    if (!callExpr || callExpr.type !== "CallExpression") return;

    const isMongooseQuery = hasMethodInChain(callExpr, [
      "find",
      "findOne",
      "findById",
    ]);
    if (!isMongooseQuery) return;

    const hasLean = hasMethodInChain(callExpr, ["lean"]);
    if (hasLean) return;

    // Check if file is setting.controller.js and variable is settings
    // Since setting.controller.js updates settings and calls .save()
    if (fileInfo.path.includes("setting.controller.js")) {
      return; // skip setting controller completely to be safe
    }

    // Append .lean()
    const leanCall = j.callExpression(
      j.memberExpression(callExpr, j.identifier("lean")),
      [],
    );

    path.node.argument = leanCall;
  });

  return root.toSource();
};
