export default class CreateProject extends HTMLElement {
  async renderDialog() {
    const data = await window.app.clickedCity;
  }
  connectedCallback() {
    const template = document.querySelector("#create-project-template");
    const content = template.content.cloneNode(true);
    this.appendChild(content);

    // const dialogEl = this.querySelector("dialog");
    // dialogEl.setAttribute(this.id, window.app.dialogId);
  }
}

customElements.define("create-project", CreateProject);
