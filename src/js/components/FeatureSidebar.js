export default class FeatureSidebar extends HTMLElement {
  constructor() {
    super();
    this.root = this.attachShadow({ mode: "open" });

    const template = document.querySelector("#feature-sidebar-template");
    const content = template.content.cloneNode(true);
    this.root.appendChild(content);
  }

  async renderData() {
    const data = await window.utils.clickedMarker;
    // console.log(data.properties);
    if (data) {
      this.root.querySelector("h3").textContent = data.properties.name;
      const features = data.properties;
      // console.log(features);
      Object.keys(features).forEach((item) => {
        const listItem = document.createElement("li");
        //console.log("key:", item); // key
        //console.log("value", features[item]); // value
        listItem.dataset.key = item;
        listItem.textContent = `${item}: ${features[item]}`;
        this.root
          .querySelector(".features")
          .insertAdjacentElement("beforeend", listItem);
      });

      //   features.forEach((item) => {
      //     const listItem = document.createElement("li");
      //     listItem.textContent = item.value;
      //     this.root
      //       .querySelector("features")
      //       .insertAdjacentElement("beforeend", listItem);
      //   });
    }
  }

  connectedCallback() {
    this.renderData();
  }
}
customElements.define("feature-sidebar", FeatureSidebar);
