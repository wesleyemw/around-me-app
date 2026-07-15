let db = null;
(() => {
  let DBOpenReq = window.indexedDB.open("PlacesDB", 1);
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
  DBOpenReq.addEventListener("upgradeneeded", (ev) => {
    db = ev.target.result;

    let oldVersion = ev.oldVersion;
    let newVersion = ev.newVersion || db.version;

    console.log("DB upgraded from version", oldVersion, "to", newVersion);

    // check if the store already exists - prevents errors with versioning later
    // if (!app.db.objectStoreNames.contains("placesStore")) {
    let objectStore = null;
    objectStore = db.createObjectStore("placesStore", {
      // unique values for the objects
      keyPath: "id",
    });
    // }
  });
})();

export function createMapProject(id, name, data) {
  let mapProject = {
    id,
    name,
    data,
    points: null,
  };
  // create a transaction
  let transaction = db.transaction("placesStore", "readwrite");
  // get store
  let store = transaction.objectStore("placesStore");
  // add data to store
  store.add(mapProject);

  transaction.onsucess = (ev) => {
    // do something on transaction success
    console.log("Transaction sucessful:", ev);
  };
  transaction.onerror = (err) => {
    // do something on error
    console.warn("Transaction resulted in error:", err);
  };
}
