const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");

admin.initializeApp();

exports.helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", { structuredData: true });
  response.status(200).send("Hello from Firebase!");
});

exports.api = onRequest((request, response) => {
  const ref = admin.database().ref(request.query.id);
  ref.on("value", (snapshot) => {
    logger.info(snapshot, { structuredData: true });
    response.status(200).send(snapshot);
  });
});
