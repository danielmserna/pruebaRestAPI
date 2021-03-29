const router = require("express-promise-router")();
const passport = require("passport");
require("../passport");
const { validateBody, schemas } = require("../helpers/routeHelpers");
const UserController = require("../controllers/users.js");

router
  .route("/signup")
  .post(
    validateBody(schemas.signup, ["body"]),
    UserController.signUp
  );

router
  .route("/signin")
  .post(
    validateBody(schemas.signin, ["body"]),
    UserController.signIn
  );

router
  .route("/fetchRestaurant")
  .post(
    UserController.fetchRestaurant
  );

router
  .route("/contact/list")
  .get(
    passport.authenticate("jwt", { session: false }),
    UserController.contactList
  );   
router
  .route("/historyList")
  .get(
    passport.authenticate("jwt", { session: false }),
    UserController.historyList
  ); 
module.exports = router;
