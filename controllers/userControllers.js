const firebaseAdmin = require("../firebase-admin");
const Users = require("../models/users");
const Activity = require("../models/activity");
const jwt = require("jsonwebtoken");
const validateRegisterInput = require("../validation/register");
const validateLoginInput = require("../validation/login");
const keys = require("../config/keys");
const isEmpty = require("../utils/is-Empty");
const UserController = (function () {
  const getUserList = async (req, res) => {
    Users.find()
      .then((users) => {
        return res.status(200).json({ success: true, data: users });
      })
      .catch((error) => {
        return res.status(400).json({ success: false, message: error.message });
      });
  };

  const register = async (req, res) => {
    const { errors, isValid } = validateRegisterInput(req.body);

    if (!isValid) {
      return res.status(400).send(errors);
    }
    try {
      const { username, useremail } = req.body;
      let role = "user";
      if (useremail && useremail == "hotgold0905@gmail.com") {
        await firebaseAdmin
          .auth()
          .getUserByEmail(useremail)
          .then((user) => {
            const customClaims = {
              admin: true,
              accessLevel: 9,
            };
            role = "admin";

            firebaseAdmin
              .auth()
              .setCustomUserClaims(user.uid, customClaims)
              .then((result) => {});
          })
          .catch((error) => {
            console.log(error);
          });
      }

      Users.findOne({ email: useremail })
        .then((user) => {
          if (user) {
            return res
              .status(400)
              .send({ success: false, message: "Email already exists." });
          } else {
            const newUser = new Users({
              name: username,
              email: useremail,
              role,
            });
            newUser
              .save()
              .then(() => {
                return res.status(200).json({ success: true });
              })
              .catch((err) =>
                res.status(400).json({ success: false, err: err })
              );
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  };

  const login = async (req, res) => {
    const { errors, isValid } = validateLoginInput(req.body);

    // Check validation
    if (!isValid) {
      return res.status(400).send(errors);
    }
    const { useremail, ip, browser, os, emailVerified } = req.body;

    // Find user by email

    // return res.send(firebaseClient);

    // if (!emailVerified) {
    //   return res
    //     .status(400)
    //     .send({ success: false, message: "Please verify your email." });
    // }
    // Signed in
    Users.findOne({ email: useremail }).then((user) => {
      // Check if user exists
      if (!user) {
        return res
          .status(404)
          .send({ success: false, message: "Account not found." });
      } else {
        const newActivity = new Activity({
          user_id: user._id,
          device: os,
          browser: browser,
          ip: ip,
        });
        newActivity
          .save()
          .then()
          .catch((err) => {
            return res.status(400).send({
              success: false,
              message: "Thereis Some Issue",
            });
          });
        user.email_verified_at = emailVerified;
        user.lastLogin = Date.now();
        user
          .save()
          .then((user) => {
            if (!user.status) {
              return res.status(400).send({
                success: false,
                message: "Account was not actived.",
              });
            }
            const payload = {
              id: user._id,
              useremail: user.email,
              userrole: user.role,
            };
            jwt.sign(payload, keys.secretOrKey, (err, token) => {
              res.json({
                success: true,
                token: token,
              });
            });
          })
          .catch((err) => res.status(400).json({ success: false, err: err }));
      }
    });
  };
  const deleteUser = async (req, res) => {
    const { email } = req.body;
    await firebaseAdmin
      .auth()
      .getUserByEmail(email)
      .then((userRecord) => {
        // See the UserRecord reference doc for the contents of userRecord.
        const { uid } = userRecord;
        firebaseAdmin
          .auth()
          .deleteUser(uid)
          .then(() => {
            Users.findOneAndDelete({ email }).then(() => {
              return res.json({ success: true });
            });
          });
      })
      .catch((error) => {
        return res.status(400).json({ success: false, error });
      });
  };
  const updateUser = async (req, res) => {
    const { verKyc, role, status, userEmail } = req.body;
    Users.findOne({ email: userEmail })
      .then(async (user) => {
        if (!user) {
          return res
            .status(400)
            .send({ success: false, message: "Email not found." });
        } else {
          user.kyc_verified_at = verKyc;
          user.role = role ? "admin" : "user";
          if ((user.role == "admin") != role) {
            await firebaseAdmin
              .auth()
              .getUserByEmail(userEmail)
              .then((user) => {
                const customClaims = role
                  ? {
                      admin: true,
                      accessLevel: 9,
                    }
                  : { admin: false };
                return firebaseAdmin
                  .auth()
                  .setCustomUserClaims(user.uid, customClaims);
              })
              .catch((error) => {
                console.log(error);
              });
          }
          user.status = status;
          user
            .save()
            .then((user) => res.json({ success: true }))
            .catch((err) => res.status(400).json({ success: false, err: err }));
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return {
    register,
    login,
    getUserList,
    deleteUser,
    updateUser,
  };
})();
module.exports = UserController;
