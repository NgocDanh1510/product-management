//[GET] /
module.exports.index = (req, res) => {
  res.render("client/pages/home/index", {
    titlePage: "home",
  });
};
