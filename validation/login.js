const Validator = require("validator");
const isEmpty = require("../utils/is-Empty");
module.exports = function validateLoginInput(data) {
  let errors = {};
  // Convert empty fields to an empty string so we can use validator functions
  data.useremail = !isEmpty(data.useremail) ? data.useremail : "";

  // Email checks
  if (Validator.isEmpty(data.useremail)) {
    errors.useremail = "Email field is required";
  } else if (!Validator.isEmail(data.useremail)) {
    errors.useremail = "Email is invalid";
  }
  // Password checks

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
