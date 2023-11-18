const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");

admin.initializeApp();

exports.api = onRequest((request, response) => {
  const ref = admin.database().ref(request.query.id);
  ref.on("value", (snapshot) => {
    logger.info(snapshot, { structuredData: true });
    response.status(200).send(snapshot);
  });
});

exports.adsApi = onRequest((req, res) => {
  if (req.path === "/getCollectionsList") {
    if (req.query.id) {
      const ref = admin.database().ref(req.query.id);
      logger.debug(req.path);

      ref.on(
        "value",
        (snapshot) => {
          const list = [];

          for (const [key] of Object.entries(snapshot.toJSON())) {
            list.push(key);
          }
          logger.debug(list, { structuredData: true });

          res.status(200).send(list);
        },
        () => {
          res.status(404).send("Not found");
        }
      );
    } else {
      res.status(401).send("Wrong token");
    }
  } else if (req.path === "/getCollection") {
    if (req.query.id && req.query.name) {
      const ref = admin.database().ref(req.query.id);
      logger.debug(req.path);

      ref.on(
        "value",
        (snapshot) => {
          for (const [key, value] of Object.entries(snapshot.toJSON())) {
            if (key === req.query.name) {
              logger.debug(value, { structuredData: true });
              res.status(200).send(value);
            }
          }
        },
        () => {
          res.status(404).send("Not found");
        }
      );
    } else {
      res.status(401).send("Wrong token or collection name");
    }
  } else if (req.path === "/getCollections") {
    if (req.query.id) {
      const ref = admin.database().ref(req.query.id);
      logger.debug(req.path);

      ref.on(
        "value",
        (snapshot) => {
          res.status(200).send(snapshot);
        },
        () => {
          res.status(404).send("Not found");
        }
      );
    } else {
      res.status(401).send("Wrong token or collection name");
    }
  } else if (req.path === "/getLocations") {
    if (req.query.id) {
      const ref = admin.database().ref(req.query.id + "/locations");

      ref.on(
        "value",
        (snapshot) => {
          const list = [];

          for (const [key] of Object.entries(snapshot.toJSON())) {
            list.push(key);
          }
          logger.debug(list, { structuredData: true });

          res.status(200).send(list);
        },
        () => {
          res.status(404).send("Not found");
        }
      );
    } else {
      res.status(401).send("Wrong token");
    }
  } else if (req.path === "/getCollectionsWithLocations") {
    if (req.query.id) {
      const ref = admin.database().ref(req.query.id + "/locations");
      logger.debug(req.path);

      ref.on(
        "value",
        (snapshot) => {
          res.status(200).send(snapshot);
        },
        () => {
          res.status(404).send("Not found");
        }
      );
    } else {
      res.status(401).send("Wrong token or collection name");
    }
  } else if (req.path === "/getCollectionsWithoutLocations") {
    if (req.query.id) {
      const ref = admin.database().ref(req.query.id + "/withoutLocations");
      logger.debug(req.path);

      ref.on(
        "value",
        (snapshot) => {
          res.status(200).send(snapshot);
        },
        () => {
          res.status(404).send("Not found");
        }
      );
    } else {
      res.status(401).send("Wrong token or collection name");
    }
  } else if (req.path === "/getCollectionsFromLocation") {
    if (req.query.id && req.query.location) {
      const ref = admin.database().ref(req.query.id + "/locations");
      logger.debug(req.path);

      ref.on(
        "value",
        (snapshot) => {
          for (const [key, value] of Object.entries(snapshot.toJSON())) {
            if (key === req.query.location) {
              res.status(200).send(value);
            }
          }

          res.status(404).send("Not found");
        },
        () => {
          res.status(404).send("Not found");
        }
      );
    } else {
      res.status(401).send("Wrong token or collection name");
    }
  } else {
    res.status(404).send("Not found");
  }
});
