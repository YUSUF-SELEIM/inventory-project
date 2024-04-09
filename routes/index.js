var express = require("express");
var router = express.Router();
var categoryController = require("../controllers/categoryController");
var itemController = require("../controllers/itemController");
/* GET home page. */
// GET request for list of all Categories.
router.get("/", categoryController.category_list);

// GET request for one Category.
router.get("/category/:id", categoryController.category_detail);

router.get("/create", categoryController.category_create_get);
router.post("/create", categoryController.category_create_post);

router.get("/category/:id/update", categoryController.category_update_get);
router.post("/category/:id/update", categoryController.category_update_post);

router.get("/category/:id/delete", categoryController.category_delete_get);
router.post("/category/:id/delete", categoryController.category_delete_post);

router.get("/category/item/:id", itemController.item_detail);

router.get("/category/:id/create", itemController.item_create_get);
router.post("/category/:id/create", itemController.item_create_post);

router.get("/category/item/:id/update", itemController.item_update_get);
router.post("/category/item/:id/update", itemController.item_update_post);

router.get("/category/item/:id/delete", itemController.item_delete_get);
router.post("/category/item/:id/delete", itemController.item_delete_post);
module.exports = router;
