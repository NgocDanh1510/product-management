const express = require("express");
const router = express.Router();

const controller = require("../../controller/client/checkout.controller");

router.get("/", controller.index);
router.post("/order", controller.order);
router.get("/success/:orderId", controller.success);
router.get("/order/detail/:orderId", controller.success);

module.exports = router;
