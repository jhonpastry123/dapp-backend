const firebaseAdmin = require("../firebase-admin");

module.exports = async (req, res, next) => {
  await firebaseAdmin
    .auth()
    .getUserByEmail(req.user.email)
    .then(({ customClaims }) => {
      if (customClaims.admin) {
        return next();
      } else {
        return res
          .status(400)
          .json({ success: false, message: "Sorry you are not admin" });
      }
    })
    .catch((err) => {
      console.log(err);
      return res
        .status(400)
        .json({ success: false, message: "Sorry you are not admin." });
    });
};
