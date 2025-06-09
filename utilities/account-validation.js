const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}
const accountModel = require("../models/account-model")


/*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
validate.registationRules = () => {
    return [
      // firstname is required and must be string
      body("account_firstname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a first name."), // on error this message is sent.
  
      // lastname is required and must be string
      body("account_lastname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 2 })
        .withMessage("Please provide a last name."), // on error this message is sent.
  
      // valid email is required and cannot already exist in the DB
      body("account_email")
        .trim()
        .escape()
        .notEmpty()
        .isEmail()
        .normalizeEmail() // refer to validator.js docs
        .withMessage("A valid email is required.")
        .custom(async (account_email) => {
          const emailExists = await accountModel.checkExistingEmail(account_email)
          if (emailExists){
            throw new Error("Email exists. Please log in or use different email")
          }
        }),
    
      // password is required and must be strong password
      body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ]
}


/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/Register", {
      errors: errors.array(),
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
      message: null
    })
    return
  }
  next()
}


/*  **********************************
  *  Login Data Validation Rules
  * ********************************* */

validate.loginRules = () => {
  return [
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required."),



    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password is required.")
  ]
}

/* ******************************
 * Check login data and return errors or continue to login process
 * ***************************** */
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/login", {
      errors: errors.array(),
      title: "Login",
      nav,
      account_email,
      message: null
    })
    return
  }
  next()
}

validate.updateAccountRules = () => {
  return [
    body("account_firstname").trim().notEmpty().withMessage("First name is required."),
    body("account_lastname").trim().notEmpty().withMessage("Last name is required."),
    body("account_email")
      .trim()
      .isEmail()
      .withMessage("Valid email is required.")
  ]
} 

validate.changePasswordRules = () =>  {
  return [
    body("account_password")
      .trim()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
      })
      .withMessage("Password must be at least 12 characters and include uppercase, lowercase, number, and special character.")
  ]
}

validate.checkUpdateData = (req, res, next) => {
  // Validation rules
  body('account_firstname')
    .trim()
    .isLength({ min: 1 })
    .withMessage('First name is required')
    .run(req);

  body('account_lastname')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Last name is required')
    .run(req);

  body('account_email')
    .trim()
    .isEmail()
    .withMessage('Valid email is required')
    .run(req);

  validationResult(req).then((result) => {
    if (!result.isEmpty()) {
      // There are validation errors
      return res.status(400).render('account/update-account', {
        title: 'Update Account Information',
        nav: utilities.getNav(),
        account: req.body,
        errors: result.array(),
        message: null,
      });
    }
    next();
  });
}

validate.checkPasswordChangeData = async (req, res, next) => {
  await body('account_password')
    .trim()
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#\$%\^&\*])[\S]{12,}$/)
    .withMessage(
      'Password must be at least 12 characters and contain uppercase, lowercase, number, and special character.'
    )
    .run(req);

  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).render('account/update-account', {
      title: 'Update Account Information',
      nav: await utilities.getNav(),  // assuming this returns a Promise
      account: req.body,
      errors: result.array(),
      message: null,
    });
  }
  next();
};

module.exports = validate