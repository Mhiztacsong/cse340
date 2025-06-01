const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build inventory by inventory Id
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
  const invId = req.params.inv_id
  const vehicle = await invModel.getInventoryById(invId)

  const html = await utilities.buildVehicleDetailHTML(vehicle)
  let nav = await utilities.getNav()
  
  res.render("./inventory/detail", {
    title: `${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}`,
    nav,
    html,
  })
}


// Management View
invCont.buildManagement = async function (req, res) {
  const nav = await utilities.getNav()
  let message = req.flash("notice")
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    errors: null,
    message
  })
}


// View to display add-classification form
invCont.buildAddClassification = async function (req, res) {
  const nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null,
    message: req.flash("notice")
  })
}

// Handle new classification submission
invCont.addClassification = async function (req, res) {
  const { classification_name } = req.body
  // const nav = await utilities.getNav()

  const result = await invModel.addClassification(classification_name)

  if (result) {
    req.flash("notice", "Classification successfully added.");
    res.redirect("/inv/");
  } else {
    req.flash("notice", "Error adding classification.");
    res.redirect("/inv/add-classification");
  }
}


invCont.buildAddInventory = async function (req, res) {
  const nav = await utilities.getNav();
  const classificationSelect = await utilities.buildClassificationList();

  res.render("inventory/add-inventory", {
    title: "Add New Inventory",
    nav,
    classificationSelect,
    errors: null,
    message: req.flash("message"),
    inv_make: "",
    inv_model: "",
    inv_year: "",
    inv_description: "",
    inv_image: "/images/vehicles/no-image.png",
    inv_thumbnail: "/images/vehicles/no-image-tn.png",
    inv_price: "",
    inv_miles: "",
    inv_color: "",
  });
}

invCont.addInventory = async function (req, res) {
  // const nav = await utilities.getNav();
  const {
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

  const result = await invModel.addInventory(
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color
  );

  if (result) {
    req.flash("notice", "New inventory item added successfully!");
    res.redirect("/inv/");
  } else {
    req.flash("notice", "Failed to add new inventory item.")
    res.redirect("inv/add-inventory");
  }
}

/* ***************************
 *  Trigger intentional error
 * ************************** */

invCont.triggerIntentionalError = async function (req, res, next) {
  throw new Error("This is an intentional server error for testing.")
}

module.exports = invCont