class DOMHelper {
  static clearEventListeners(element) {
    const clonedElement = element.cloneNode(true);
    element.replaceWith(clonedElement);
    return clonedElement;
  }
  static moveElement(elementId, newDestinationSelector) {
    const element = document.getElementById(elementId);
    const destinationElement = document.querySelector(newDestinationSelector);
    destinationElement.append(element);
  }
}

class Component {
  constructor(hostElementId, insertBefore = false) {
    if (hostElementId) {
      this.hostElement = document.getElementById(hostElementId);
    } else {
      this.hostElement = document.body;
    }
    this.insertBefore = insertBefore;
  }
  removeElement() {
    if (this.element) {
      this.element.remove();
      // this.element.parentElement.removeChild(this.element); // older syntax.
    }
  }
  show() {
    this.hostElement.insertAdjacentElement(
      this.insertBefore ? 'afterbegin' : 'beforeend',
      this.element
    );
  }
}

class Tooltip extends Component {
  constructor(closeNotifierFunction) {
    super();
    this.closeNotifier = closeNotifierFunction;
    this.create();
  }
  closeTooltip = () => {
    this.removeElement();
    this.closeNotifier();
  };

  create() {
    const tooltipElement = document.createElement('div');
    tooltipElement.className = 'card';
    tooltipElement.textContent = 'Dummy!';
    tooltipElement.addEventListener('click', this.closeTooltip);
    this.element = tooltipElement;
  }
}

class ProjectItem {
  hadActiveTooltip = false;

  constructor(id, updateProjectListsFunction, type) {
    this.id = id;
    this.updateProjectListsHandler = updateProjectListsFunction;
    this.connectFinishButton(type);
    this.connectMoreInfoButton();
  }

  showMoreInfoHandler() {
    if (this.hadActiveTooltip) {
      return;
    }
    const tooltip = new Tooltip(() => {
      this.hadActiveTooltip = false;
    });
    tooltip.show();
    this.hadActiveTooltip = true;
  }

  connectMoreInfoButton() {
    const projectDomeNodeInfo = document.getElementById(this.id);
    const moreInfoButton = projectDomeNodeInfo.querySelector(
      'button:first-of-type'
    );
    moreInfoButton.addEventListener('click', this.showMoreInfoHandler);
  }

  connectFinishButton(type) {
    const projectDomeNodeFinish = document.getElementById(this.id);
    let finishButton = projectDomeNodeFinish.querySelector(
      'button:last-of-type'
    );
    finishButton = DOMHelper.clearEventListeners(finishButton);
    finishButton.textContent = type === 'active' ? 'Finish' : 'Activate';
    finishButton.addEventListener(
      'click',
      this.updateProjectListsHandler.bind(null, this.id)
    );
  }
  update(updateProjectListsFn, type) {
    this.updateProjectListsHandler = updateProjectListsFn;
    this.connectFinishButton(type);
  }
}

class ProjectList {
  projects = [];

  constructor(type) {
    this.type = type;
    const prjItems = document.querySelectorAll(`#${type}-projects li`);
    for (const prjItem of prjItems) {
      this.projects.push(
        new ProjectItem(prjItem.id, this.removeProject.bind(this), this.type)
      );
    }
  }

  setSwitchHandlerFunction(switchHandlerFunction) {
    this.switchHandler = switchHandlerFunction;
  }

  addProject(project) {
    this.projects.push(project);
    DOMHelper.moveElement(project.id, `#${this.type}-projects ul`);
    project.update(this.removeProject.bind(this), this.type);
  }

  removeProject(projectId) {
    // const projectIndex = this.projects.findIndex(p => p.id === projectId);
    // this.projects = this.projects.filter(projectIndex, 1);
    this.switchHandler(this.projects.find((p) => p.id === projectId));
    this.projects = this.projects.filter((p) => p.id !== projectId);
  }
}

class App {
  static init() {
    const activeProjectsList = new ProjectList('active');
    const finishedProjectsList = new ProjectList('finished');
    activeProjectsList.setSwitchHandlerFunction(
      finishedProjectsList.addProject.bind(finishedProjectsList)
    );
    finishedProjectsList.setSwitchHandlerFunction(
      activeProjectsList.addProject.bind(activeProjectsList)
    );
  }
}

App.init();
