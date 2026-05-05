export const toFeature = (obj) => {
  if (obj.type === "node") {
    const newFeature = {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [parseFloat(obj.lon), parseFloat(obj.lat)],
      },
      properties: {
        id: obj.id,
        type: obj.type,
        ...obj.tags,
      },
    };

    return newFeature;
  } else if (obj.type === "way") {
    const newFeature = {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [parseFloat(obj.center.lon), parseFloat(obj.center.lat)],
      },
      properties: {
        id: obj.id,
        type: obj.type,
        ...obj.tags,
      },
    };
    return newFeature;
  }
};

export const slugify = (sentence, lowercase) => {
  const slug = sentence.replace(/\s/g, "-");
  if (lowercase) {
    return slug.toLowerCase();
  }
  return slug;
};

// export const renderDialog = async () => {
//   const data = await window.app.clickedCity;
//   const dialogEl = this.querySelector("dialog");

//   const title = dialogEl.querySelector("h3");
//   const countryName = dialogEl.querySelector(".country-name");
//   const population = dialogEl.querySelector(".population");
// };

export default { toFeature, slugify };
