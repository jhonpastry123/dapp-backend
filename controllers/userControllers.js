const firebaseAdmin = require("../firebase-admin");
const firebaseClient = require("../firebase-client");

const Users = require("../models/users");
const bcrypt = require("bcryptjs");
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
      const { username, useremail, password } = req.body;
      await firebaseAdmin.auth().createUser({
        email: useremail,
        emailVerified: false,
        password: password,
        displayName: username,
      });
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
              password: password,
            });
            //   Hash password before saving in database
            bcrypt.genSalt(10, (err, salt) => {
              bcrypt.hash(newUser.password, salt, (err, hash) => {
                if (err) throw err;
                newUser.password = hash;
                newUser
                  .save()
                  .then((user) => {
                    return res.status(200).json({ success: true });
                  })
                  .catch((err) =>
                    res.status(400).json({ success: false, err: err })
                  );
              });
            });
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
    const { useremail, password } = req.body;
    // Find user by email

    // return res.send(firebaseClient);

    firebaseClient
      .auth()
      .signInWithEmailAndPassword(useremail, password)
      .then((userCredential) => {
        // Signed in
        Users.findOne({ email: useremail }).then((user) => {
          // Check if user exists
          if (!user) {
            return res
              .status(404)
              .send({ success: false, message: "Account not found." });
          } else {
            user.lastLogin = Date.now();
            user
              .save()
              .then((user) => {
                const payload = {
                  username: user.email,
                };
                jwt.sign(
                  payload,
                  keys.secretOrKey,
                  {
                    expiresIn: 3600,
                  },
                  (err, token) => {
                    res.json({
                      success: true,
                      token: token,
                    });
                  }
                );
              })
              .catch((err) =>
                res.status(400).json({ success: false, err: err })
              );
          }
        });
      })
      .catch((error) => {
        return res.status(400).json({ success: false, message: error.message });
        // ..
      });
    return;
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
    const { verEmail, verKyc, role, status, userEmail } = req.body;
    Users.findOne({ email: userEmail })
      .then((user) => {
        if (!user) {
          return res
            .status(400)
            .send({ success: false, message: "Email not found." });
        } else {
          if (verEmail) {
            if (isEmpty(user.email_verified_at)) {
              user.email_verified_at = Date.now();
            }
          } else {
            user.email_verified_at = "";
          }
          if (verKyc) {
            if (isEmpty(user.kyc_verified_at)) {
              user.kyc_verified_at = Date.now();
            }
          } else {
            user.kyc_verified_at = "";
          }
          user.role = role ? "admin" : "user";
          user.status = status;
          user
            .save()
            .then((user) => res.status(400).json({ success: true }))
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
