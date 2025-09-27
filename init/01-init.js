// 01-init.js
// This script runs once on first container startup.
// It creates the application database, user and a probe document.

(function() {
  const dbName = process.env.APP_DB || 'app_db';
  const appUser = process.env.APP_USER || 'app_user';
  const appPass = process.env.APP_PASSWORD || 'app_password';

  print(`>> Creating/ensuring DB '${dbName}' and user '${appUser}' ...`);

  const db = db.getSiblingDB(dbName);

  // Create user if missing
  const existing = db.getUser(appUser);
  if (!existing) {
    db.createUser({
      user: appUser,
      pwd: appPass,
      roles: [{ role: "readWrite", db: dbName }]
    });
    print(`>> Created user ${appUser} on DB ${dbName}`);
  } else {
    print(`>> User ${appUser} already exists`);
  }

  // Create a simple probe collection
  db.createCollection("_probe");
  db._probe.insertOne({ created_at: new Date() });

  print(">> Initialization complete.");
})();
