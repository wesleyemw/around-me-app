(() => {
  window.app = {};
  app = {
    searchData: [],
    getData: async (query) => {
      // const query = "Menton";
      const headers = {
        "X-RapidAPI-Key": import.meta.env.VITE_RAPIDAPI_KEY,
        "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com",
      };
      const url = `https://wft-geo-db.p.rapidapi.com/v1/geo/places?limit=10&types=CITY&namePrefix=${query}&sort=-population`;
      try {
        const response = await fetch(url, { headers: headers });
        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
        }
        const result = await response.json();

        // this control is better to show later
        if (result.data.length === 0) {
          console.log(`There's no results`);
        } else {
          return result.data;
          // console.log(app.searchData);
        }
      } catch (error) {
        console.error(error.message);
      }
    },
    getFormQuery: () => {
      //
      // variables
      //
      let form = document.querySelector("#search-cities");
      let input = document.querySelector("#search-place");
      let resultList = document.querySelector("#search-results");

      // Make sure required content exists
      if (!form || !input || !resultList) return;

      const submitHandler = async (event) => {
        event.preventDefault();
        const result = input.value;
        const response = await app.getData(result);
        // console.log(response);
        populateSearchEl(response);
        resultList.togglePopover();
      };
      form.addEventListener("submit", submitHandler);

      const populateSearchEl = (data) => {
        let itemHTML = () => {
          // clean the result list element before inserting new content
          resultList.textContent = "";
          for (const city of data) {
            let listContainer = document.createElement("article");
            listContainer.dataset.id = `${city.name}`;
            listContainer.dataset.lat = `${city.latitude}`;
            listContainer.dataset.lon = `${city.longitude}`;
            listContainer.dataset.population = `${city.population}`;
            listContainer.dataset.country = `${city.country}`;
            listContainer.dataset.region = `${city.region}`;
            const markup = `
                <a href="/pages/map/?lat=${city.latitude}&lon=${city.longitude}">
                  <h3>${city.name}</h3>
                  <p>${city.country}</p>
                  <p>${city.region}</p>
                  <p><small>${city.population}</small></p>
                </a>
            `;
            listContainer.innerHTML = markup;
            // console.log(listContainer);

            resultList.insertAdjacentElement("beforeend", listContainer);
          }
        };
        itemHTML();
      };
    },
  };
  app.getFormQuery();
})();
