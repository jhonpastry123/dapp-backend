const UserControllers = require("../controllers/userControllers");
const ProfileControllers = require("../controllers/profileControllers");
const passport = require("passport");

const authRoutes = (app) => {
  app.post("/login", UserControllers.login);
  app.post("/register", UserControllers.register);
  app.post("/delete", UserControllers.deleteUser);
  app.post("/update", UserControllers.updateUser);
  app.get("/getUserList", UserControllers.getUserList);
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
};
module.exports = authRoutes;
