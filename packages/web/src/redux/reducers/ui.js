import storage from 'redux-persist/lib/storage';
import { persistReducer } from 'redux-persist';
import {
  CHANGE_THEME,
  INITIALIZE_THEMES,
  TOGGLE_NAVBAR_MENU,
  TOGGLE_NAVBAR_MENU_OPEN,
  TOGGLE_NAVBAR_MENU_CLOSED,
  TRIGGER_RESIZE,
  TRIGGER_TOAST,
  TRIGGER_MODAL_OPEN,
  TRIGGER_MODAL_CLOSE,
  CLEAR_NOTIFICATION,
} from 'redux/actions/ui';

const initialState = {
  isMobileMenuOpen: false,
  isModalOpen: false,
  modalMessage: '',
  modalData: null,
  exchangeLayout: [],
  breakpoints: {
    isMobile: '',
    isTablet: '',
    isDesktop: '',
  },
  notificationCleared: false,
  clearedNotification: '',
  themeName: '',
  themes: [],
  theme: {},
};

const initialUiReducer = (state = initialState, action) => {
  switch (action.type) {
    case CHANGE_THEME:
      return { ...state, ...action.payload };
    case INITIALIZE_THEMES:
      return { ...state, ...action.payload };
    case TOGGLE_NAVBAR_MENU:
      return { ...state, isMobileMenuOpen: !state.isMobileMenuOpen };
    case TOGGLE_NAVBAR_MENU_OPEN:
      return { ...state, isMobileMenuOpen: true };
    case TOGGLE_NAVBAR_MENU_CLOSED:
      return { ...state, isMobileMenuOpen: false };
    case TRIGGER_RESIZE:
      return { ...state, breakpoints: action.payload };
    case TRIGGER_TOAST:
      return { ...state, payload: action.payload };
    case TRIGGER_MODAL_OPEN:
      return {
        ...state,
        modalMessage: action.payload.modalMessage,
        modalData: action.payload.modalData,
        children: action.payload.children,
        isModalOpen: true,
      };
    case TRIGGER_MODAL_CLOSE:
      return {
        ...state,
        isModalOpen: false,
        modalMessage: '',
        modalData: null,
      };

    case CLEAR_NOTIFICATION:
      return { ...state, clearedNotification: action.payload };
    default:
      return state;
  }
};

const persistConfig = {
  key: 'ui',
  storage: storage,
  whitelist: ['exchangeLayout', 'themeName', 'theme'],
};

export const uiReducer = persistReducer(persistConfig, initialUiReducer);
