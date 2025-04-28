let count = 0;
const createTree = (array, parentId = null) => {
  const newArray = [];
  for (const item of array) {
    if (item.parent_id?.toString() == parentId?.toString()) {
      const newItem = item;
      newItem.index = count++;
      const children = createTree(array, item._id);
      if (children.length > 0) {
        newItem.children = children;
      }
      newArray.push(newItem);
    }
  }
  return newArray;
};

module.exports = (array, parentId = null) => {
  count = 0;
  return createTree(array, parentId);
};
