import { toast } from 'react-toastify';
import _ from 'lodash';
import i18n from 'i18n';
// eslint-disable-next-line
import defaultThemes from 'assets/defaultThemes';

export const CHANGE_THEME = 'CHANGE_THEME';
export const INITIALIZE_THEMES = 'INITIALIZE_THEMES';
export const TOGGLE_NAVBAR_MENU = 'TOGGLE_NAVBAR_MENU';
export const TOGGLE_NAVBAR_MENU_OPEN = 'TOGGLE_NAVBAR_MENU_OPEN';
export const TOGGLE_NAVBAR_MENU_CLOSED = 'TOGGLE_NAVBAR_MENU_CLOSED';
export const TRIGGER_RESIZE = 'TRIGGER_RESIZE';
export const TRIGGER_TOAST = 'TRIGGER_TOAST';
export const TRIGGER_MODAL_OPEN = 'TRIGGER_MODAL_OPEN';
export const TRIGGER_MODAL_CLOSE = 'TRIGGER_MODAL_CLOSE';
export const CLEAR_NOTIFICATION = 'CLEAR_NOTIFICATION';

export const toggleNavbarMenu = state => {
  if (state) {
    return { type: TOGGLE_NAVBAR_MENU_OPEN };
  } else if (typeof state === 'undefined') {
    return { type: TOGGLE_NAVBAR_MENU };
  } else {
    return { type: TOGGLE_NAVBAR_MENU_CLOSED };
  }
};

export const triggerResize = breakpoints => ({
  type: TRIGGER_RESIZE,
  payload: breakpoints,
});

export const triggerToast = (
  message,
  messageType = 'warn',
  closeAfter = 7500,
  customId,
) => {
  return {
    type: TRIGGER_TOAST,
    payload: toast[messageType](
      i18n.t(`messages.${message.replace(/[.]/g, '')}`, {
        defaultValue: message,
      }),
      {
        toastId: customId,
        autoClose: closeAfter,
      },
    ),
  };
};

export const triggerModalOpen = (
  modalMessage,
  modalData,
  children,
  translateMessage,
) => ({
  type: TRIGGER_MODAL_OPEN,
  payload: {
    modalMessage,
    modalData,
    children,
    translateMessage,
  },
});

export const triggerModalClose = () => ({
  type: TRIGGER_MODAL_CLOSE,
});

export const changeTheme = theme => {
  return {
    type: CHANGE_THEME,
    payload: {
      theme,
      themeName: theme.themeName,
    },
  };
};

export const initializeThemes = themes => {
  // The following line can be uncommented to use the theme files located in `assets/defaultThemes.js
  themes = defaultThemes;

  return (dispatch, getState) => {
    let { themeName } = getState().ui;
    let currentTheme = _.find(themes, { themeName });

    if (!currentTheme) {
      themeName = themes[0].themeName;
      currentTheme = themes[0];
    }

    dispatch({
      type: INITIALIZE_THEMES,
      payload: {
        themes,
        theme: currentTheme,
        themeName,
      },
    });
  };
};

export const clearNotification = value => {
  return {
    type: CLEAR_NOTIFICATION,
    payload: value,
  };
};
