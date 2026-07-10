const DB = (function init() {
  let db = null;
  let objectStore = null;

  let DBOpenReq = indexedDB.open("PlacesDB", 1);

  // events
  // error
  DBOpenReq.addEventListener("error", (error) => {
    console.warn("Error:", error);
  });

  // success
  DBOpenReq.addEventListener("success", (ev) => {
    db = ev.target.result;
    console.log("success", db);
  });

  // upgrade needed event
  DBOpenReq.addEventListener("onupgradeneeded", (ev) => {
    db = ev.target.result;

    let oldVersion = ev.oldVersion;
    let newVersion = ev.newVersion || db.version;

    console.log("DB upgraded from version", oldVersion, "to", newVersion);

    // check if the store already exists - prevents errors with versioning later
    if (!db.objectStoreNames.contains("placesStore")) {
      objectStore = db.createObjectStore("placesStore", {
        // unique values for the objects
        keyPath: "id",
      });
    }
  });
})();
