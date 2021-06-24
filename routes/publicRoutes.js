const UserControllers = require("../controllers/userControllers");

const authRoutes = (app) => {
  app.post("/login", UserControllers.login);
  app.post("/register", UserControllers.register);
  app.post("/delete", UserControllers.deleteUser);
  app.get("/getUserList", UserControllers.getUserList);
};
module.exports = authRoutes;
