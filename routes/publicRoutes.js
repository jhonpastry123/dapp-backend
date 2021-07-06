const UserControllers = require("../controllers/userControllers");
const ProfileControllers = require("../controllers/profileControllers");
const KYCControllers = require("../controllers/kycControllers");
const passport = require("passport");
const adminRole = require("../config/adminrole");
const authRoutes = (app) => {
  app.post("/login", UserControllers.login);
  app.post("/register", UserControllers.register);
  app.post(
    "/delete",
    passport.authenticate("jwt", { session: false }),
    adminRole,
    UserControllers.deleteUser
  );
  app.post(
    "/update",
    passport.authenticate("jwt", { session: false }),
    adminRole,
    UserControllers.updateUser
  );
  app.get(
    "/getUserList",
    passport.authenticate("jwt", { session: false }),
    adminRole,
    UserControllers.getUserList
  );
  app.get(
    "/getProfile",
    passport.authenticate("jwt", { session: false }),
    ProfileControllers.getProfile
  );
  app.post(
    "/updateProfile",
    passport.authenticate("jwt", { session: false }),
    ProfileControllers.updateProfile
  );
  app.post(
    "/saveKYC",
    // passport.authenticate("jwt", { session: false }),
    KYCControllers.saveKYC
  );
  app.post(
    "/upload",
    // passport.authenticate("jwt", { session: false }),
    KYCControllers.upload
  );
  app.post(
    "/getKYC",
    // passport.authenticate("jwt", { session: false }),
    KYCControllers.getKYC
  );
};
module.exports = authRoutes;
