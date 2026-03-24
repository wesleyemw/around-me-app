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

export default { toFeature, slugify };
