
const router = require("express").Router();
const RewardsController = require("../controllers/rewards");

router.get("/users/:id/rewards", RewardsController.generate);
router.patch("/users/:id/rewards/:date/redeem", RewardsController.redeem);

module.exports = router;
