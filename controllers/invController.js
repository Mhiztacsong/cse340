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


/* ***************************
 *  Trigger intentional error
 * ************************** */

invCont.triggerIntentionalError = async function (req, res, next) {
  throw new Error("This is an intentional server error for testing.")
}

module.exports = invCont