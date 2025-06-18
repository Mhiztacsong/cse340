// Needed Resources
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const invValidate = require('../utilities/inventory-validation')


// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to build inventory item detail view
router.get("/detail/:inv_id", utilities.handleErrors(invController.buildByInventoryId));

router.get("/trigger-error", utilities.handleErrors(invController.triggerIntentionalError));

// Management View
router.get("/", utilities.requireEmployeeOrAdmin, utilities.handleErrors(invController.buildManagement))

// Add Classification View
router.get(
  "/add-classification",
  utilities.requireEmployeeOrAdmin,
  utilities.handleErrors(invController.buildAddClassification))

  router.post(
  "/add-classification",
  utilities.requireEmployeeOrAdmin,
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
)

// Add Inventory View
router.get(
  "/add-inventory",
  utilities.requireEmployeeOrAdmin,
  utilities.handleErrors(invController.buildAddInventory))

  router.post(
  "/add-inventory",
  utilities.requireEmployeeOrAdmin,
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
)

router.get(
  "/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
)

// Route to build edit-inventory view
router.get("/edit/:inv_id", utilities.requireEmployeeOrAdmin, utilities.handleErrors(invController.editInventoryView))

// Route to handle inventory update
router.post(
  "/update",
  utilities.requireEmployeeOrAdmin,
  invValidate.inventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
);

// GET - Show the delete confirmation view
router.get("/delete/:inv_id", utilities.requireEmployeeOrAdmin, invController.showDeleteConfirmation);

// POST - Handle the delete operation
router.post(
  "/delete",
  utilities.handleErrors(invController.deleteInventoryItem));

router.get("/search", utilities.handleErrors(invController.buildSearchView))


router.post(
  "/search",
  invController.searchInventory)

module.exports = router;