export default class editProject extends HTMLElement {
  connectedCallback() {
    const template = document.querySelector("#edit-project-template");
    const content = template.content.cloneNode(true);
    this.appendChild(content);
  }
}

customElements.define("edit-project", editProject);
