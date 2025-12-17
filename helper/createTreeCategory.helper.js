let count = 0;
const createTree = (array, parentId = "") => {
  const newArray = [];
  for (const item of array) {
    if (item.parent_id == parentId) {
      const newItem = item;
      newItem.index = count++;
      const children = createTree(array, item.id);
      if (children.length > 0) {
        newItem.children = children;
      }
      newArray.push(newItem);
    }
  }
  return newArray;
};

module.exports = (array, parentId = "") => {
  count = 0;
  return createTree(array, parentId);
};
