import { slugify } from "../js/modules/utils";
import CreateProject from "../js/components/CreateProject";
import { createMapProject } from "./modules/db";

(() => {
  window.app = {};
  app = {
    searchData: [],
    clickedCity: null,
    dialogId: null,
    db: null,
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
            let resultContainer = document.createElement("article");
            // TODO: Create a utility function for this
            const randomStr = Math.random().toString(36).slice(2, 10);
            const id =
              `${slugify(city.name, true)}-${city.countryCode}-${randomStr}`.toLowerCase();

            resultContainer.dataset.name = `${id}`;
            resultContainer.dataset.id = `${city.name}`;
            resultContainer.dataset.lat = `${city.latitude}`;
            resultContainer.dataset.lon = `${city.longitude}`;
            resultContainer.dataset.stats = `${JSON.stringify(city)}`;
            // resultContainer.dataset.population = `${city.population}`;
            // resultContainer.dataset.country = `${city.country}`;
            // resultContainer.dataset.region = `${city.region}`;
            const markup = `
                  <h3>${city.name}</h3>
                  <p>${city.country}</p>
                  <p>${city.region}</p>
                  <p><small>${city.population}</small></p>
                  <button data-toggle="dialog" command='show-modal' commandfor="${id}">Create map</button>
            `;
            resultContainer.innerHTML = markup;
            // console.log(resultContainer);

            resultList.insertAdjacentElement("beforeend", resultContainer);
          }
        };
        itemHTML();
      };
    },
  };
  app.getFormQuery();

  let dialogElement = null;
  const mainElement = document.querySelector("#home");
  dialogElement = document.createElement("create-project");

  mainElement.appendChild(dialogElement);

  document.addEventListener("click", (evt) => {
    if (evt.target.matches('[data-toggle="dialog"')) {
      const parentArticle = evt.target.closest("article");
      const id = parentArticle.dataset.name;
      app.dialogId = id;
      app.clickedCity = parentArticle.dataset.stats;

      // console.log("dialog id:", app.dialogId);
      // console.log("stats:", app.clickedCity);

      const dialogEl = document.querySelector('[data-dialog="project-dialog"]');
      const formEl = dialogEl.querySelector("form");

      if (typeof dialogEl !== "undefined" && dialogEl !== null) {
        // Exists.

        // setup dialog element
        dialogEl.setAttribute("id", app.dialogId);

        const title = dialogEl.querySelector("h3");
        const countryName = dialogEl.querySelector("p.country-name");
        const population = dialogEl.querySelector("p.population");

        const stats = JSON.parse(app.clickedCity);

        title.textContent = stats.name;
        countryName.textContent = stats.country;
        population.textContent = stats.population;

        // setup form additional fields
        // const hiddenInput = document.createElement("input");
        // constconst hiddenInput = document.createElement("input"); lonInput = hiddenInput
        //   .setAttribute("id", "lon")
        //   .setAttribute("name", "lon")
        //   .setAttribute("value", `${stats.longitude}`)
        //   .setAttribute("type", "hidden");

        formEl.setAttribute("id", app.dialogId);
        const lat = formEl.querySelector('input[name="lat"');
        const lon = formEl.querySelector('input[name="lon"');

        lat.value = `${stats.latitude}`;
        lon.value = `${stats.longitude}`;
      }
    }
  });
  const projectForm = document.querySelector('[name="create-project"]');
  projectForm.addEventListener("submit", () => {
    // ev.preventDefault();
    const id = projectForm.getAttribute("id");
    const projectName = projectForm
      .querySelector('[name="project-name"]')
      .value.trim();

    // console.log(ev.target);
    createMapProject(id, projectName, app.clickedCity);

    projectForm.action = "/pages/map/";
  });
})();
