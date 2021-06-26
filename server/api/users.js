const router = require("express").Router();
const {
  models: { User },
} = require("../db");
const { client } = require("../app");
const _ = require("underscore");
const { default: axios } = require("axios");
module.exports = router;

router.get("/", async (req, res, next) => {
  try {
    const args = ["userLeaderboard", 0, -1, "withscores"];

    client.zrevrange(args, function (err, result) {
      if (err) {
        console.log("error in get /api/users", err);
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

router.get("/:username", async (req, res, next) => {
  try {
    const args = ["userLeaderboard", req.params.username];

    client.zrevrank(args, (err, result) => {
      if (!result || err) {
        res.status(404).send("oh no! that user does not exist");
      } else {
        res.json(result + 1);
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { username, score } = req.body;
    const args = ["userLeaderboard", score, username];

    client.zadd(args, async (err, result) => {
      if (err) {
        console.log("error in post /api/users", err);
      } else {
        const newArgs = ["userLeaderboard", username];
        client.zrevrank(newArgs, (err, result) => {
          if (err) console.log("error in post /api/users", err);
          else res.json(result);
        });
      }
    });
  } catch (error) {
    next(error);
  }
});

router.put("/:username", async (req, res, next) => {
  try {
    const { difference } = req.body;
    const args = ["userLeaderboard", difference, req.params.username];

    client.zincrby(args, (err, result) => {
      if (err) {
        console.log("error in put /api/users/:username", err);
      } else {
        // result will be the updated score of the user
        res.send(result);
      }
    });
  } catch (error) {
    next(error);
  }
});
