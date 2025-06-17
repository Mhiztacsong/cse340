const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}


validate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a classification name.")
      .matches(/^[A-Za-z0-9]+$/)
      .withMessage("No spaces or special characters allowed.")
  ]
}

validate.checkClassificationData =  async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: errors.array(),
      message: null
    })
    return
  }
  next()
}

validate.inventoryRules = () => {
  return [
    body("classification_id")
      .trim()
      .isInt({ min: 1 })
      .withMessage("Please choose a valid classification."),

    body("inv_make")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Make must be at least 2 characters long."),

    body("inv_model")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Model must be at least 3 characters long."),

    body("inv_year")
      .trim()
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
      .withMessage("Enter a valid year."),

    body("inv_description")
      .trim()
      .notEmpty()
      .withMessage("Description is required."),

    body("inv_image")
      .trim()
      .notEmpty()
      .withMessage("Image path is required."),

    body("inv_thumbnail")
      .trim()
      .notEmpty()
      .withMessage("Thumbnail path is required."),

    body("inv_price")
      .trim()
      .isFloat({ min: 0 })
      .withMessage("Price must be a valid number."),

    body("inv_miles")
      .trim()
      .isInt({ min: 0 })
      .withMessage("Miles must be a valid number."),

    body("inv_color")
      .trim()
      .notEmpty()
      .withMessage("Color is required."),
  ];
};

validate.checkInventoryData = async (req, res, next) => {
  const { classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    const classificationSelect = await utilities.buildClassificationList(classification_id);
    res.render("inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      classificationSelect,
      errors: errors.array(),
      message: null,
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
    });
    return;
  }
  next();
};


/* ***************************
 * Check update data and return errors or continue to edit view
 * ************************** */
validate.checkUpdateData = async (req, res, next) => {
  const {
    inv_id,
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
  } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    const classificationSelect = await utilities.buildClassificationList(classification_id);
    res.render("inventory/edit-inventory", {
      title: `Edit ${inv_make} ${inv_model}`,
      nav,
      classificationSelect,
      errors: errors.array(),
      message: null,
      inv_id,
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
    });
    return;
  }
  next();
};


module.exports = validate