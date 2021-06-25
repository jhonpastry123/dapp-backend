const UserControllers = require("../controllers/userControllers");
const ProfileControllers = require("../controllers/profileControllers");

const authRoutes = (app) => {
  app.post("/login", UserControllers.login);
  app.post("/register", UserControllers.register);
  app.post("/delete", UserControllers.deleteUser);
  app.post("/update", UserControllers.updateUser);
  app.get("/getUserList", UserControllers.getUserList);
  app.post("/getProfile", ProfileControllers.getProfile);
  app.post("/updateProfile", ProfileControllers.updateProfile);
};
module.exports = authRoutes;
