import McFly from 'mcfly';
import _ from 'lodash';
import {
  ASSIGNMENTS_PANEL_INDEX,
  RECEIVE_WIZARD_ASSIGNMENT_OPTIONS,
  SELECT_WIZARD_OPTION,
  WIZARD_ADVANCE,
  WIZARD_REWIND,
  WIZARD_GOTO,
  RECEIVE_WIZARD_PANELS,
  API_FAIL
} from '../constants';

import logErrorMessage from '../utils/log_error_message';

const Flux = new McFly();

const WizardActions = Flux.createActions({
  toggleOptionSelected(panelIndex, optionIndex) {
    return {
      actionType: 'SELECT_OPTION',
      data: {
        panel_index: panelIndex,
        option_index: optionIndex
      }
    };
  },

  toggleOptionExpanded(panelIndex, optionIndex) {
    return {
      actionType: 'EXPAND_OPTION',
      data: {
        panel_index: panelIndex,
        option_index: optionIndex
      }
    };
  },

  rewindWizard(toIndex = null) {
    return {
      actionType: 'WIZARD_REWIND',
      data: { toIndex }
    };
  },

  advanceWizard() {
    return { actionType: 'WIZARD_ADVANCE' };
  },

  resetWizard() {
    return { actionType: 'WIZARD_RESET' };
  },

  goToWizard(toIndex = 0) {
    return {
      actionType: 'WIZARD_GOTO',
      data: { toIndex }
    };
  },
  receiveWizardIndex(resp) {
    return {
      actionType: 'RECEIVE_WIZARD_INDEX',
      data: {
        wizard_index: resp
      }
    };
  },
  receiveWizardPanels(resp) {
    return {
      actionType: 'RECEIVE_WIZARD_PANELS',
      data: {
        wizard_panels: resp
      }
    };
  }
});


const fetchWizardIndexPromise = () => {
  return new Promise((res, rej) =>
    $.ajax({
      type: 'GET',
      url: '/wizards.json',
      success(data) {
        return res(data);
      }
    })
    .fail((obj) => {
      logErrorMessage(obj);
      return rej(obj);
    })
  );
};

export const fetchWizardIndex = () => dispatch => {
  return fetchWizardIndexPromise()
    .then(data => {
      dispatch({ type: RECEIVE_WIZARD_ASSIGNMENT_OPTIONS, assignmentOptions: data });
    })
    .catch(data => dispatch({ type: API_FAIL, data }));
};


const fetchWizardPanelsPromise = (wizardId) => {
  return new Promise((res, rej) =>
    $.ajax({
      type: 'GET',
      url: `/wizards/${wizardId}.json`,
      success(data) {
        return res(data);
      }
    })
    .fail((obj) => {
      logErrorMessage(obj);
      return rej(obj);
    })
  );
};

export const fetchWizardPanels = (wizardId) => dispatch => {
  return fetchWizardPanelsPromise(wizardId)
    .then(data => {
      dispatch({ type: RECEIVE_WIZARD_PANELS, extraPanels: data });
    })
    .catch(data => dispatch({ type: API_FAIL, data }));
};

export const advanceWizard = () => (dispatch, getState) => {
  const state = getState();
  dispatch({ type: WIZARD_ADVANCE });
  // If we're advancing from the Assignments panel,
  // we need to fetch the specific wizard panel for the selected
  // assignment option.
  if (state.wizard.activeIndex === ASSIGNMENTS_PANEL_INDEX) {
    const assignmentOptions = state.wizard.panels[ASSIGNMENTS_PANEL_INDEX].options;
    const selectedWizard = _.find(assignmentOptions, option => option.selected);
    fetchWizardPanels(selectedWizard.key)(dispatch);
  }
};

export const selectWizardOption = (panelIndex, optionIndex) => {
  return { type: SELECT_WIZARD_OPTION, panelIndex, optionIndex };
};

export const rewindWizard = () => {
  return { type: WIZARD_REWIND };
};

export const goToWizard = (toPanelIndex) => {
  return { type: WIZARD_GOTO, toPanelIndex };
};


export default WizardActions;
