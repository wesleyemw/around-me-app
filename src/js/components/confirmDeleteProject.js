export default class confirmDeleteProject extends HTMLElement {
  connectedCallback() {
    const template = document.querySelector("#delete-project-template");
    const content = template.content.cloneNode(true);
    this.appendChild(content);
  }
}

customElements.define("confirm-delete-project", confirmDeleteProject);
