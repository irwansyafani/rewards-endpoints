const fs = require("fs");
const { getWeekDates } = require("../utils");

class RewardsController {
  static async generate(req, res) {
    // parse the request
    const userId = req.params.id;
    const requestedDate = new Date(req.query.at.split("T")[0]);
    // validate format date
    if (requestedDate == "Invalid Date") {
      return res
        .status(400)
        .json({ error: { message: "date is not valid format" } });
    }
    // fetching latest update of database, in real case, it might be like calling database or use the instance
    const readableFile = await fs.readFileSync("./database.json", {
      encoding: "utf-8",
    });
    const fetchedDatabase = JSON.parse(readableFile);
    // check user data (dates) availability on database
    if (fetchedDatabase[userId]) {
      // if already exist, try to find based on requested on query
      // get index from the database (array)
      const targetDate = fetchedDatabase[userId].findIndex(
        (item) =>
          new Date(item.availableAt).getTime() == requestedDate.getTime()
      );
      // what day (of a week) is it? (in number)
      const dayOfWeek = new Date(requestedDate).getDay();
      // is index exist?
      if (targetDate >= 0) {
        // if yes, return whole dates in that week
        const startDateOfWeek = fetchedDatabase[userId].slice(
          targetDate - dayOfWeek,
          targetDate - dayOfWeek + 7
        );
        res.status(200).json(startDateOfWeek);
      } else {
        // if no, create new dates for the week of requested afterwards return whole dates in that week
        const additionalDates = getWeekDates(req.query.at);
        fetchedDatabase[userId] = [
          ...fetchedDatabase[userId],
          ...additionalDates,
        ].sort(
          // do not forget to sort, to make it easier to maintain :)
          (a, b) =>
            new Date(a.availableAt).getTime() -
            new Date(b.availableAt).getTime()
        );
        // save to database
        await fs.writeFileSync(
          "./database.json",
          JSON.stringify(fetchedDatabase, null, 2)
        );
        res.status(200).json(additionalDates);
      }
    } else {
      // if no, initiate the new one
      const initialDates = getWeekDates(req.query.at);
      fetchedDatabase[userId] = initialDates;
      // save to database
      await fs.writeFileSync(
        "./database.json",
        JSON.stringify(fetchedDatabase, null, 2)
      );
      res.status(200).json(initialDates);
    }
  }

  static async redeem(req, res) {
    // parse the request
    const userId = req.params.id;
    const requestedDate = req.params.date.split("T")[0];
    // validation first, so the system do not need to unused logical process at the beginning
    if (
      !userId ||
      !requestedDate ||
      new Date(requestedDate) == "Invalid Date"
    ) {
      return res
        .status(400)
        .json({ error: { message: "can't process your request" } });
    }
    // read latest update from database
    const fetchedDatabase = JSON.parse(
      await fs.readFileSync("./database.json", {
        encoding: "utf-8",
      })
    );
    // find data index
    const findDataPosition = fetchedDatabase[userId].findIndex(
      (item) => item.availableAt == new Date(requestedDate).toISOString()
    );
    // set current time to avoid redundance
    const currentTime = new Date(/* "2020-03-18T07:45:32.000Z" */); // change current date and variables (CURRENT_DATE, mockDate) on app.test.js
    // is already redeemed?
    if (fetchedDatabase[userId][findDataPosition]?.redeemedAt) {
      // if yes, return the error
      res
        .status(400)
        .json({ error: { message: "This reward is already expired" } });
    } else {
      // if no, check the available and expires date
      if (
        currentTime >
          new Date(fetchedDatabase[userId][findDataPosition]?.availableAt) &&
        currentTime <
          new Date(fetchedDatabase[userId][findDataPosition]?.expiresAt)
      ) {
        // if yes, update redeemedAt with value of current time
        const updated = {
          ...fetchedDatabase[userId][findDataPosition],
          redeemedAt: currentTime.toISOString(),
        };
        fetchedDatabase[userId][findDataPosition] = updated;
        // save to database
        await fs.writeFileSync(
          "./database.json",
          JSON.stringify(fetchedDatabase, null, 2)
        );
        res.status(200).json(updated);
      } else {
        // if no, return the error
        res
          .status(400)
          .json({ error: { message: "This reward is already expired" } });
      }
    }
  }
}

module.exports = RewardsController;
