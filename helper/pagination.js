module.exports = async (objectPagination, query, Model, find) => {
  //objectPagination gồm có
  // {
  //   currentPage: 1, //mặc định mới vào là page 1
  //   limitPage: 5,
  // },
  const countItem = await Model.countDocuments(find);
  objectPagination.totalRecord = countItem;
  objectPagination.pageTotal = Math.ceil(
    countItem / objectPagination.limitPage,
  );

  if (query.page) {
    objectPagination.currentPage = parseInt(query.page);
    objectPagination.skipPage =
      (objectPagination.currentPage - 1) * objectPagination.limitPage;
  }
  return objectPagination;
};
