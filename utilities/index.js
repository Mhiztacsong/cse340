const invModel = require("../models/inventory-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  console.log(data)
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}



/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}


/* **************************************
* Build the vehicle HTML detail view
* ************************************ */

Util.buildVehicleDetailHTML = function(vehicle) {
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(vehicle.inv_price);

  const miles = vehicle.inv_miles.toLocaleString()

  return `
    <div class="vehicle-detail">
      <div>
        <img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}">
      </div>
      <div>
        <h2>${vehicle.inv_make} ${vehicle.inv_model} Details</h2>
        <p><strong>Price: ${formattedPrice}</strong></p>
        <p><strong>Description:</strong> ${vehicle.inv_description}</p>
        <p><strong>Color:</strong> ${vehicle.inv_color}</p>
        <strong>Mileage:</strong> ${miles} miles
      </div>
    </div>
  `;
}


Util.buildClassificationList = async function (classification_id = null) {
    let data = await invModel.getClassifications()
    let classificationList =
      '<select name="classification_id" id="classificationList" required>'
    classificationList += "<option value=''>Choose a Classification</option>"
    data.rows.forEach((row) => {
      classificationList += '<option value="' + row.classification_id + '"'
      if (
        classification_id != null &&
        row.classification_id == classification_id
      ) {
        classificationList += " selected "
      }
      classificationList += ">" + row.classification_name + "</option>"
    })
    classificationList += "</select>"
    return classificationList
  }


/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
 if (req.cookies.jwt) {
  jwt.verify(
   req.cookies.jwt,
   process.env.ACCESS_TOKEN_SECRET,
   function (err, accountData) {
    if (err) {
     req.flash("Please log in")
     res.clearCookie("jwt")
     return res.redirect("/account/login")
    }
    res.locals.accountData = accountData
    res.locals.loggedin = 1
    next()
   })
 } else {
  next()
 }
}

/* ****************************************
 *  Check Login
 * ************************************ */

Util.checkLogin = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {  // Also use ACCESS_TOKEN_SECRET here
      if (!err && decoded) {
        res.locals.loggedin = true;
        res.locals.firstname = decoded.firstname;
        res.locals.account_type = decoded.account_type;
      } else {
        res.locals.loggedin = false;
      }
      return next();
    });
  } else {
    res.locals.loggedin = false;
    return next();
  }
};

Util.requireEmployeeOrAdmin = (req, res, next) => {
  const token = req.cookies.jwt
  if (!token) {
    req.flash("notice", "You must be logged in to access this page.")
    return res.redirect("/account/login")
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      req.flash("notice", "Invalid token. Please log in again.")
      return res.redirect("/account/login")
    }

    if (decoded.account_type === "Employee" || decoded.account_type === "Admin") {
      next()
    } else {
      req.flash("notice", "You are not authorized to access this page.")
      return res.redirect("/account/login")
    }
  })
}

  
/* **************************************
* Middleware for handling Errors
* Wrap other function in this for
* General Error handling
* ************************************ */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util