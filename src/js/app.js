(() => {
  window.app = {};
  app = {
    getData: async () => {
      const query = "São Paulo";
      const headers = {
        "X-RapidAPI-Key": import.meta.env.VITE_RAPIDAPI_KEY,
        "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com",
      };
      const url = `https://wft-geo-db.p.rapidapi.com/v1/geo/places?types=CITY&namePrefix=${query}`;

      const response = await fetch(url, { headers: headers });
      const result = await response.json();

      console.log(result);
    },
  };
  app.getData();
})();
