const router = require("express").Router();
const {
  models: { User },
} = require("../db");
const { client } = require("../app");
const _ = require("underscore");
module.exports = router;

router.get("/", async (req, res, next) => {
  try {
    const args = ["userLeaderboard", 0, -1, "withscores"];

    client.zrevrange(args, function (err, result) {
      if (err) {
        console.log("error in get /api/users:", err);
      } else {
        const lists = _.groupBy(result, function (a, b) {
          return Math.floor(b / 2);
        });
        res.json(lists);
      }
    });
  } catch (err) {
    next(err);
  }
});
