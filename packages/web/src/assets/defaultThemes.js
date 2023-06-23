const darkTheme = {
  global: {
    colors: {
      brand: '#0ecb81',
      control: '#0ecb81',
      red: '#f6465d',
      green: '#0ecb81',
      white: '#fff',
      whiteHover: 'rgba(255, 255, 255, 0.5)',
      bidColor: '#0ecb81',
      askColor: '#f6465d',
      background: '#120f22',
      primary: '#0ecb81',
      primaryHover: 'rgba(219, 35, 39, 0.5)',
      loadingColor: '#0ecb81',
      focus: '#0ecb81',
      'background-1': '#120f22',
      'background-2': '#241f33',
      'background-3': '#312e3f',
      'background-4': '#42404f',
      'background-5': '#64626f',
      'border-1': 'rgba(255,255,255,0.33)',
      'handleColor': '#fff',
      defaultTextColor: '#f8f8f8',
      defaultTextColorDarken: '#d9d9d9',
      tableBackground: '#231f33',
      tableHeadBackground: 'background-4',
      selectBackground: '#231f33',
      errorPageBackground: '#fff',
      footerBackground: '#312e3f',
      navbarBackground: '#241f33',
      skinnyBarBackground: '#120f22',
      cookieConsentBackground: 'accent-4',
    },
    font: {
      size: '12px',
      lineHeight: '1.25',
      family: '"Open Sans"',
    },
  },
  button: {
    color: '#f8f8f8',
    primary: {
      color: '#f8f8f8',
    },
    border: {
      radius: '8px',
    },
  },
  tab: {
    active: {
      color: 'brand',
    },
    color: 'text',
    border: {
      side: 'bottom',
      size: 'small',
      color: {
        dark: 'text',
        light: 'text',
      },
      active: {
        color: {
          dark: 'brand',
          light: 'brand',
        },
      },
      hover: {
        color: {
          dark: 'brand',
          light: 'brand',
        },
      },
    },
  },
  chartingTheme: 'Dark',
  modalBackgroundColor: 'grey-lighter',
  modalConfirmationBackgroundColor: 'grey-darker',
  formButtonColor: 'primary',
};

const lightTheme = {
  global: {
    colors: {
      brand: '#db2327',
      red: '#f6465d',
      green: '#0ecb81',
      white: '#fff',
      whiteHover: 'rgba(255, 255, 255, 0.5)',
      bidColor: '#0ecb81',
      askColor: '#f6465d',
      background: '#eff2f6',
      primary: '#db2327',
      primaryHover: 'rgba(219, 35, 39, 0.5)',
      loadingColor: '#0ecb81',
      'background-1': '#eff2f6',
      'background-2': '#fbfcfe',
      'background-3': '#ffffff',
      'background-4': '#eff2f6',
      'background-5': '#eff2f6',
      defaultTextColor: '#444444',
      defaultTextColorDarken: '#333333',
      'border-1': 'rgba(0,0,0,0.33)',
      handleColor: '#312e3f',
      tableBackground: '#fbfcfe',
      selectBackground: '#fbfcfe',
      errorPageBackground: '#fff',
      navbarBackground: '#312e3f',
      skinnyBarBackground: '#fbfcfe',
      footerBackground: '#312e3f',
      cookieConsentBackground: 'accent-4',
    },
    font: {
      size: '12px',
      lineHeight: '1.25',
      family: '"Open Sans"',
    },
  },
  button: {
    border: {
      radius: '8px',
    },
  },
  tab: {
    active: {
      color: 'brand',
    },
    color: 'text',
    border: {
      side: 'bottom',
      size: 'small',
      color: {
        dark: 'text',
        light: 'text',
      },
      active: {
        color: {
          dark: 'brand',
          light: 'brand',
        },
      },
      hover: {
        color: {
          dark: 'brand',
          light: 'brand',
        },
      },
    },
  },
  chartingTheme: 'Light',
  modalBackgroundColor: 'grey-lighter',
  modalConfirmationBackgroundColor: 'grey-darker',
  formButtonColor: 'primary',
};

const themes = [
  {
    themeName: 'Dark',
    theme: darkTheme,
  },
  {
    themeName: 'Light',
    theme: lightTheme,
  },
];

window.themes = themes;

export default themes;
