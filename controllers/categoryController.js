const Category = require("../models/category");
const Item = require("../models/item");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

// Display list of all Categories.
exports.category_list = asyncHandler(async (req, res, next) => {
  const allCategories = await Category.find().sort({ name: 1 }).exec();
  res.render("index", {
    title: "Categories List",
    category_list: allCategories,
  });
});

// Display detail page for a specific Author.
exports.category_detail = asyncHandler(async (req, res, next) => {
  // Get details of Category and all their items (in parallel)
  const [category, allItemsInCategory] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ category: req.params.id }).exec(),
  ]);

  if (category === null) {
    // No results.
    const err = new Error("category not found");
    err.status = 404;
    return next(err);
  }

  res.render("category_detail", {
    title: "Category Details",
    category: category,
    items_In_Category: allItemsInCategory,
  });
});

// Display Author create form on GET.
exports.category_create_get = (req, res, next) => {
  res.render("category_form", { title: "Create Category" });
};

// Handle Category create on POST.
exports.category_create_post = [
  // Validate and sanitize fields.
  body("categoryName")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Category Name must be specified.")
    .matches(/^[a-zA-Z0-9\s]*$/)
    .withMessage(
      "Category Name must contain only letters, numbers, or spaces."
    ),
  body("description")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Description name must be specified.")
    .matches(/^[a-zA-Z0-9\s]*$/)
    .withMessage(
      "Description name must contain only letters, numbers, or spaces."
    ),

  // Check if category with the same name already exists.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Check if there are validation errors.
    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.render("category_form", {
        title: "Create Category",
        category: req.body,
        errors: errors.array(),
      });
      return;
    }

    // Check if a category with the same name already exists.
    const existingCategory = await Category.findOne({
      name: req.body.categoryName,
    });

    if (existingCategory) {
      // A category with the same name already exists.
      const customError = {
        value: req.body.categoryName,
        msg: "Category with the same name already exists.",
        param: "categoryName",
        location: "body",
      };
      const updatedErrors = [...errors.array(), customError]; // Combine existing errors with the custom error
      res.render("category_form", {
        title: "Create Category",
        category: req.body,
        errors: updatedErrors,
      });
      return;
    }
    // No existing category with the same name found. Proceed to save the category.
    const category = new Category({
      name: req.body.categoryName,
      description: req.body.description,
    });

    // Save category.
    await category.save();

    // Redirect to new category record.
    res.redirect(category.url);
  }),
];

// Display category update form on GET.
exports.category_update_get = asyncHandler(async (req, res, next) => {
  // Get category
  const category = await Category.findById(req.params.id).exec();

  if (category === null) {
    // No results.
    const err = new Error("Category not found");
    err.status = 404;
    return next(err);
  }

  res.render("category_form", {
    title: "Update Category",
    category: category,
  });
});

// Handle category update on POST.
exports.category_update_post = [
  // Validate and sanitize fields.
  body("categoryName")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Category Name must be specified.")
    .matches(/^[a-zA-Z0-9\s]*$/)
    .withMessage(
      "Category Name must contain only letters, numbers, or spaces."
    ),
  body("description")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Description name must be specified.")
    .matches(/^[a-zA-Z0-9\s]*$/)
    .withMessage(
      "Description name must contain only letters, numbers, or spaces."
    ),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a category object with escaped/trimmed data and old id.
    const category = new Category({
      name: req.body.categoryName,
      description: req.body.description,
      _id: req.params.id, // This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.
      res.render("category_form", {
        title: "Update Category",
        category: category,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid. Update the record.
      const updatedCategory = await Category.findByIdAndUpdate(
        req.params.id,
        category,
        { new: true }
      );
      // Redirect to category detail page.
      res.redirect(updatedCategory.url);
    }
  }),
];

// Display book delete form on GET.
exports.category_delete_get = asyncHandler(async (req, res, next) => {
  // Get details of book and all their instances (in parallel)
  const [category, items] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ category: req.params.id }).exec(),
  ]);
  if (category === null) {
    // No results.
    res.redirect("/category");
  }

  res.render("category_delete", {
    title: "Delete Category",
    category: category,
    items: items,
  });
});

// Handle category delete on POST.
exports.category_delete_post = asyncHandler(async (req, res, next) => {
  const [category, items] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ category: req.params.id }).exec(),
  ]);

  if (items.length > 0) {
    // category has items. Render in same way as for GET route.
    res.render("category_delete", {
      title: "Delete Category",
      category: category,
      items: items,
    });
    return;
  } else {
    // Category has no items. Delete object and redirect to the list of categories.
    await Category.findByIdAndDelete(req.body.categoryId);
    res.redirect("/");
  }
});
