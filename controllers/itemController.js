const Category = require("../models/category");
const Item = require("../models/item");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

// Display detail page for a specific Author.
exports.item_detail = asyncHandler(async (req, res, next) => {
  // Get details of the item by its ID
  const item = await Item.findById(req.params.id).exec();
  if (!item) {
    // Handle the case where the item is not found
    return res.status(404).send("Item not found");
  }

  // Now that we have the item, we can get its category
  const category = await Category.findById(item.category).exec();
  if (!category) {
    // Handle the case where the category is not found
    return res.status(404).send("Category not found");
  }

  // Render the item detail page
  res.render("item_detail", {
    title: "Item Details",
    item: item,
    category: category,
  });
});

// Display Item create form on GET.
exports.item_create_get = (req, res, next) => {
  res.render("item_form", { title: "Create Item" });
};

// Handle Item create on POST.
exports.item_create_post = [
  // Validate and sanitize fields.
  body("itemName")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Item Name must be specified.")
    .matches(/^[a-zA-Z0-9\s]*$/)
    .withMessage("Item Name must contain only letters, numbers, or spaces."),
  body("description")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Description must be specified.")
    .matches(/^[a-zA-Z0-9\s]*$/)
    .withMessage("Description must contain only letters, numbers, or spaces."),
  body("price")
    .trim()
    .isNumeric()
    .withMessage("Price must be a numeric value."),
  body("quantity")
    .trim()
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer."),

  // Check if Item with the same name already exists.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Check if there are validation errors.
    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.render("item_form", {
        title: "Create Item",
        item: req.body,
        errors: errors.array(),
      });
      return;
    }

    // Check if a Item with the same name already exists.
    const existingItem = await Item.findOne({ name: req.body.itemName });

    if (existingItem) {
      // A Item with the same name already exists.
      const customError = {
        value: req.body.itemName,
        msg: "Item with the same name already exists.",
        param: "itemName",
        location: "body",
      };
      const updatedErrors = [...errors.array(), customError]; // Combine existing errors with the custom error
      res.render("item_form", {
        title: "Create Item",
        item: req.body,
        errors: updatedErrors,
      });
      return;
    }
    // No existing Item with the same name found. Proceed to save the Item.
    const item = new Item({
      name: req.body.itemName,
      description: req.body.description,
      category: req.params.id, // Assuming category ID is sent in the request body
      price: req.body.price,
      quantity: req.body.quantity,
    });

    // Save Item.
    await item.save();

    // Redirect to new Item record.
    res.redirect(item.url);
  }),
];

// Display item update form on GET.
exports.item_update_get = asyncHandler(async (req, res, next) => {
  // Get item
  const item = await Item.findById(req.params.id).exec();

  if (item === null) {
    // No results.
    const err = new Error("Item not found");
    err.status = 404;
    return next(err);
  }

  res.render("item_form", {
    title: "Update Item",
    item: item,
    categoryID: item.category,
  });
});

// Handle item update on POST.
exports.item_update_post = [
  // Validate and sanitize fields.
  body("itemName")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Item Name must be specified.")
    .matches(/^[a-zA-Z0-9\s]*$/)
    .withMessage("Item Name must contain only letters, numbers, or spaces."),
  body("description")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Description must be specified.")
    .matches(/^[a-zA-Z0-9\s]*$/)
    .withMessage("Description must contain only letters, numbers, or spaces."),
  body("price")
    .trim()
    .isNumeric()
    .withMessage("Price must be a numeric value."),
  body("quantity")
    .trim()
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer."),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a item object with escaped/trimmed data and old id.
    const item = new Item({
      name: req.body.itemName,
      description: req.body.description,
      category: req.body.categoryID, // Assuming category ID is sent in the request body
      price: req.body.price,
      quantity: req.body.quantity,
      _id: req.params.id, // This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.
      res.render("item_form", {
        title: "Update Item",
        item: item,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid. Update the record.
      const updatedItem = await Item.findByIdAndUpdate(req.params.id, item, {
        new: true,
      });
      // Redirect to item detail page.
      res.redirect(updatedItem.url);
    }
  }),
];

// Display book delete form on GET.
exports.item_delete_get = asyncHandler(async (req, res, next) => {
  // Get details of book and all their instances (in parallel)
  const item = await Item.findById(req.params.id).exec();
  if (item === null) {
    // No results.
    res.redirect("/");
  }
  res.render("item_delete", {
    title: "Delete Item",
    item: item,
  });
});

// Handle category delete on POST.
exports.item_delete_post = asyncHandler(async (req, res, next) => {
  // Find the item to be deleted
  const item = await Item.findById(req.params.id).exec();
  if (!item) {
    // If the item is not found, redirect to the home page or another appropriate page
    return res.redirect("/");
  }
  // Retrieve the category ID of the item
  const categoryId = item.category;
  // Delete the item
  await Item.findByIdAndDelete(req.params.id);
  // Redirect to the category page
  const categoryUrl = `/category/${categoryId}`; // Replace this with the actual URL format
  res.redirect(categoryUrl);
});