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
export function renderAllRecords() {
  const txRead = db.transaction("placesStore", "readonly");

  const store = txRead.objectStore("placesStore");

  // make a request against the store
  const allRecordsReq = store.getAll();

  // request events
  allRecordsReq.addEventListener("success", (event) => {
    const container = document.querySelector("section.projects > .container");
    const div = container.querySelector("div.projects-results");
    div.innerHTML = "";
    // div.setAttribute("class", "projects-results");

    // add to element
    container.insertAdjacentElement("beforeend", div);

    // create request
    const req = event.target;

    // get result object
    const results = req.result;

    if (results.length === 0) {
      const message = `You don't have any map saved yet.`;
      const p = document.createElement("p");
      p.textContent = message;

      div.insertAdjacentElement("beforeend", p);
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
        <a href="pages/map/?id=${record.id}&project-name=${record.name}&lon=${data.longitude}&lat=${data.latitude}">
          <h1>${record.name}</h1>
        </a>
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
  });
  allRecordsReq.addEventListener("error", (err) => {
    console.warn(err);
  });
}

export function writeRecord(key, action, newTitle = "") {
  const transaction = db.transaction("placesStore", "readwrite");
  const store = transaction.objectStore("placesStore");

  const getRequest = store.get(key);

  getRequest.onerror = (err) => {
    console.warn("Request resulted in error:", err);
  };
  getRequest.onsuccess = (event) => {
    if (action === "delete") {
      const result = event.target.result;
      // get an confirmation and then delete the record
      store.delete(key);

      transaction.oncomplete = () => {
        // remove the element from html and show a message
        console.log(`The record ${result.name} was deleted.`);
      };
    }
    if (action === "edit") {
      // console.log(newTitle);
      const result = event.target.result;

      result.name = newTitle;
      const requestUpdate = store.put(result);

      requestUpdate.onerror = (event) => {
        // Do something with the error
      };
      requestUpdate.onsuccess = (event) => {
        // Success - the data is updated!
        console.log("Success - the data is updated!");
      };

      transaction.oncomplete = () => {
        // refresh the records on display
        console.log(`The record ${result.name} was changed.`);
      };
    }
  };
}
