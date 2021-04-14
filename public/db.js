export function checkForIndexedDb() {
  if (!window.indexedDB) {
    console.log("Your browser doesn't support a stable version of IndexedDB.");
    return false;
  }
  return true;
}

export function useIndexedDb(databaseName, storeName, method, object) {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open("budget", 1);
    let db, tx, store, getAll;

    request.onupgradeneeded = function (e) {
      const db = request.result;
      db.createObjectStore("pending", { autoIncrement: true });
    };

    request.onerror = function (e) {
      console.log("There was an error: " + request.error);
    };

    request.onsuccess = function (e) {
      db = request.result;
      tx = db.transaction(["pending"], "readwrite");
      store = tx.objectStore("pending");
      getAll = store.getAll();

      getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
          fetch("/api/transaction/bulk", {
            method: "POST",
            body: JSON.stringify(getAll.result),
            headers: {
              Accept: "application/json, text/plain, */*",
              "Content-Type": "application/json",
            },
          })
            .then((response) => response.json())
            .then(() => {
              const transaction = db.transaction(["pending"], "readwrite");
              const store = transaction.objectStore("pending");
              store.clear();
            });
        }
      };

      ////not needed
      // db.onerror = function (e) {
      //   console.log("error");
      // };
      // if (method === "put") {
      //   store.put(object);
      // } else if (method === "get") {
      //   const all = store.getAll();
      //   all.onsuccess = function () {
      //     resolve(all.result);
      //   };
      // } else if (method === "delete") {
      //   store.delete(object._id);
      // }
      // tx.oncomplete = function () {
      //   db.close();
      // };
    };
  });
}

window.addEventListener("online", useIndexedDb);