const admin = require("firebase-admin");

const serviceAccount = require("../cipn-app-firebase-adminsdk-fbsvc-ac3d819cb1.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const setAdminRole = async (uid) => {
  await admin.auth().setCustomUserClaims(uid, { role: "admin" });
  console.log(`User with UID ${uid} is now an admin!`);
};

const setModRole = async (uid) => {
  await admin.auth().setCustomUserClaims(uid, { role: "mod" });
  console.log(`User with UID ${uid} is now a mod!`);
};

const userId = "uLcTin55ihhYGNltH6sZFTbBQJj1";

setAdminRole(userId)
  .then(() => process.exit())
  .catch((error) => {
    console.error("Error setting admin:", error);
    process.exit(1);
});

setModRole(userId)
  .then(() => process.exit())
  .catch((error) => {
    console.error("Error setting mod:", error);
    process.exit(1);
});