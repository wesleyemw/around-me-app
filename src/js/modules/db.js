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

    // render the records
    renderAllRecords();
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

function renderAllRecords() {
  const txRead = db.transaction("placesStore", "readonly");

  const store = txRead.objectStore("placesStore");

  // make a request against the store
  const allRecordsReq = store.getAll();

  // request events
  allRecordsReq.addEventListener("success", (event) => {
    const container = document.querySelector("section.projects > .container");
    const div = document.createElement("div");
    div.setAttribute("class", "projects-results");

    // create request
    const req = event.target;

    // get result object
    const results = req.result;

    if (results.length === 0) {
      console.log("There's no records!");
      return;
    }

    results.forEach((record) => {
      // console.log(record);
      const data = JSON.parse(record.data);
      const item = document.createElement("section");
      item.setAttribute("id", record.id);
      item.setAttribute("class", "project-item");
      item.innerHTML = `
        <h1>${record.name}</h1>
        <p>
          <span>${data.name}</span>
          <span>${data.region}</span>
          <span>${data.country}</span> 
          <span>${data.countryCode}</span>
        </p>
        <button data-action='edit'>Edit</button>
        <button data-action='delete'>Delete</button>
      `;
      div.insertAdjacentElement("beforeend", item);
    });

    // add to element
    container.insertAdjacentElement("beforeend", div);
  });
  allRecordsReq.addEventListener("error", (err) => {
    console.warn(err);
  });
}
