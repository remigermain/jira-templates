// ==UserScript==
// @name         jira-templates
// @namespace    http://tampermonkey.net/
// @version      2024-01-30
// @description  add some jira templates
// @author       https://github.com/remigermain
// @match        https://*.atlassian.net/*
// @grant        none
// ==/UserScript==


(function () {
  "use strict";

  const settings = `
<div id="template-settings">
  <style>
    #template-settings {
      position: fixed;
      background-color: rgba(64, 64, 64, 0.67);
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 99999;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .settings-project-title {
      width: 70%;
    }
    .settings-content {
      border-radius: 8px;
      max-height: 450px;
      width: 400px;
      overflow-y: scroll;
      background-color: white;
      border: 2px gray;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      padding: 1rem;
    }
    .settings-description {
      font-style: italic;
      color: rgba(0, 0, 0, 0.61);
    }
    .settings-content-choices {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      overflow-y: scroll;
      max-height: 400px;
      padding: 1rem;
      margin-bottom: 1rem;
      margin-top: 1rem;
      width: 90%;
      overflow-x: hidden;
    }
    .settings-content-choices-element {
      padding: 1rem;
      display: flex;
      align-items: center;
      gap: 2rem;
      width: 100%;
    }
    .settings-button {
      background-color: #0c66e4;
      padding: 0.5rem 2rem;
      align-self: end;
      border: none;
      border-radius: 5px;
      color: white;
      cursor: pointer;
    }
    /* The switch - the box around the slider */
    .switch {
      position: relative;
      display: inline-block;
      width: 60px;
      height: 34px;
    }
    
    /* Hide default HTML checkbox */
    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    
    /* The slider */
    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      -webkit-transition: .4s;
      transition: .4s;
    }
    
    .slider:before {
      position: absolute;
      content: "";
      height: 26px;
      width: 26px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      -webkit-transition: .4s;
      transition: .4s;
    }
    
    input:checked + .slider {
      background-color: #0c66e4;
    }
    
    input:focus + .slider {
      box-shadow: 0 0 1px #0c66e4;
    }
    
    input:checked + .slider:before {
      -webkit-transform: translateX(26px);
      -ms-transform: translateX(26px);
      transform: translateX(26px);
    }
    
    /* Rounded sliders */
    .slider.round {
      border-radius: 34px;
    }
    
    .slider.round:before {
      border-radius: 50%;
    } 
    </style>
    <div class="settings-content">
      <h2>
        Select your templates
      </h2>
      <div class="settings-content-choices">
        ---TEMPLATE---
      </div>
      <button class="settings-button" onclick="document.getElementById('template-settings').remove()" >
        OK
      </button>
    </div>
</div>
`
  // options are added in localstorage
  const STORAGE_KEY = "JIRA_TEMPLATE"
  function getJiraKey() {
    try {
      const res = JSON.parse(localStorage.getItem(STORAGE_KEY))
      if (typeof res !== "object" || Array.isArray(res) || !res) {
        return {}
      }
      return res
    } catch (e) {
      return {}
    }
  }

  window.toogleJira = (project) => {
    const k = getJiraKey()
    // reverse boolean
    k[project] = !!!k[project]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(k))
    refreshTemplate(true);
  }

  class Project {
    constructor (name, description) {
      this.name = name
      this.templates = {}
      this.description = description
    }
    addTemplate(name, value, dataType) {
      this.templates[name] = {
        value,
        dataType,
      }
      return this
    }
  }

  class Jira {
    constructor () {
      this.projects = {};
      this.actions = {};
    }
    addAction(name, description, func) {
      this.actions[name] = {
        action: func,
        description,
      }
    }
    addProject(name, description) {
      this.projects[name] = new Project(name, description);

      return this.projects[name]
    }
  }

  const jira = new Jira();

  // default action

  // erase
  jira.addAction(`{icon:trash}`, `Erase`, (root) => root.textContent = "")
  // copy
  jira.addAction(`{icon:copy}`, `Copy`, (root) => {
    navigator.clipboard.writeText(root.innerHTML);
  })

  // settings
  jira.addAction(`{icon:setting}`, `Config`, () => {
    const div = document.createElement("div")
    const settings = getJiraKey()
    const final = Object.keys(jira.projects).map((key) => {

      const project = jira.projects[key].name
      const description = jira.projects[key].description ?? ""
      const checked = settings[project] === true ? "checked" : "";

      return `
      <span class="settings-content-choices-element">
        <span class="settings-project-title">
          Template for <strong>${project.toUpperCase()}</strong>
          <br />
          <span class="settings-description">
            ${description}
          </span>
        </span>
        <label class="switch">
          <input type="checkbox" onclick="toogleJira('${project}')" ${checked}>
          <span class="slider round"></span>
        </label>
      </span>
      `
    })
    div.innerHTML = settings.replace("---TEMPLATE---", final.join(""));
    document.body.appendChild(div)
  })

  // ---PROJECT---
  function pasteContent(value, dataType) {
    const root = document.querySelector("#ak-editor-textarea");
    if (!root) {
      return
    }
    const data = new DataTransfer();
    data.setData(dataType || "text/plain", value);
    root.dispatchEvent(
      new ClipboardEvent('paste', {
        clipboardData: data,
        dataType: dataType || "text/plain",
        data: value,
      })
    );
    console.log("dispatch template event")
  }

  function refreshTemplate(force) {
    const toolbar = document.querySelector("div[data-testid='ak-editor-secondary-toolbar'] > div")
    const settings = getJiraKey();
    if (force) {
      document.querySelectorAll(".jira-button-extra").forEach((e) => e.remove());
    }
  
    Object.keys(jira.projects).forEach(project => {
      // navbar not activate
      if (!settings[project]) {
        return
      }
  
      Object.keys(jira.projects[project].templates).forEach((key) => {
        const template = jira.projects[project].templates[key];
        const btnTemplate = toolbar.children[0].cloneNode(true)
        btnTemplate.classList.add("jira-button-extra")
        btnTemplate.children[0].innerHTML = key
        btnTemplate.title = `Template from ${project}`
        btnTemplate.addEventListener("click", () => {
          pasteContent(template.value, template.dataType)
        });
        toolbar.appendChild(btnTemplate);
      })
    })

    Object.keys(jira.actions).forEach(key => {
      const btnAcion = toolbar.children[1].cloneNode(true)
      btnAcion.children[0].innerHTML = key
      btnAcion.classList.add("jira-button-extra")
      btnAcion.style.borderWidth = "2px"
      btnAcion.title = jira.actions[key].description
      btnAcion.addEventListener("click", () => {
        const root = document.querySelector("#ak-editor-textarea");
        if (!root) {
          return
        }
        jira.actions[key].action(root);
        console.log("dispatch action event")
      });
      toolbar.appendChild(btnAcion);
    })

  }

  let active = false;
  const observer = new MutationObserver(() => {
    const toolbar = document.querySelector("div[data-testid='ak-editor-secondary-toolbar'] > div")
    if (!toolbar) {
      active = false;
      return
    } else if (active) {
      return
    }
    active = true;
    console.log("toolbar activate")
    refreshTemplate();
  })
  observer.observe(document.body, { subtree: true, childList: true });
})();