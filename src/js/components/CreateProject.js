export default class CreateProject extends HTMLElement {
  async renderDialog() {
    const data = await window.app.clickedCity;
  }
  connectedCallback() {
    const template = document.querySelector("#create-project-template");
    const content = template.content.cloneNode(true);
    this.appendChild(content);
  }
}

customElements.define("create-project", CreateProject);
