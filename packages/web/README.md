[![Netlify Status](https://api.netlify.com/api/v1/badges/a449af0b-0572-4105-b5a0-15e981e0a5a3/deploy-status)](https://app.netlify.com/sites/upbeat-khorana-b0fd0e/deploys)
# Bytedex Exchange Frontend - React App

## Repository

This repository contains a pure version of the Bytedex codebase contained in the `master` branch, please do not modify this branch. We recommend doing any custom development work in the `develop` branch.  

## Builds/Deployment

This repository is set up to deploy to AWS S3 using the `.gitlab-ci.yml` file. Any time a change is pushed to the `develop` branch a build will be performed.

### Manual Build/Deployment

1. Ensure setup has been completed -- see the README file at the root of this repository.
1. Navigate to `packages/web` -- `cd ~/<repository location>/packages/web`
1. Perform a build -- `yarn build`
1. The build will be output at `~/<repository location>/packages/web/build` -- these files are what should be deployed. 

## React App Dependencies

This section contains a nearly complete list of all dependencies of the React app with a quick explanation of what they are used for. 

### Core

- React - javascript library to build user interfaces with components
    - prop-types - adds type checking to component props
    - react-dom - React for working with DOM (required for browser apps)
- redux - state management. Handles application state across the app.
    - immer - used to help with immutable state. This is used in some cases, because redux state should not be modified directly (things will break)
    - redux-thunk - handle async login in redux
    - react-redux - react bindings for redux
    - redux-persist - loads and stores some parts of redux state in user's local storage
    - reselect - selectors for redux state, also memoizes calls to redux store for performance.
- Formik - used to build our form components and forms.
- Grommet - Grommet makes it really easy to enable theming functionality. Most of our components are built on top of Grommet components
- i18next - library we use for internationalization
    - react-i18next - react components and bindings to use with i18next
    - i18next-browser-language-detector - will attempt to find user's browser language and default to that if possible
- react-table - extendable table component for react, we build a few additional features on top of this library
- react-router-dom - handles routing in the application, this enables SPA functionality
- TradingView - we use the tradingview library for our main chart on the exchange page, a React wrapper is build around their library. A signed license with them is needed for use of this.

### Presentational/Styling

- Bulma (transitioning away from) - css framework that supplies basic components
    - bulma-extensions - a few extensions on top of bulma, like progress bars
    - react-bulma-components - react implementation of bulma css
- qrcode.react - QR code component
- react-loader-spinner - provides a few different pre-built loading spinners.
- react-markdown - parses and displays markdown, used for content pages and some documentation

### Helper React Components

- react-dropzone - used for file inputs, allows drag and drop for files and file validations like file type and sizes.
- react-grid-layout - grid helper components, we use this to display the exchange layout
- react-responsive - responsive helper components for react
- react-select - extendable select component for react
- react-toastify - used for toast notifications throughout the app
- react-virtualized - helper components for rendering lists of data, we use this in things like the order book
- recharts - charting library
- styled-components - CSS-in-JS for react components, used to add dynamic styling to components

### Utility

- axios - http request library
    - axios-progress-bar - adds a nice progress bar when select http requests are being made
- classnames - useful utility for creating dynamic classnames list in react
- clipboard-polyfill - polyfill for copy to clipboard functionality (not available in select browsers natively)
- compressorjs - used to compress images in our KYC form before submission. we need this because our max payload size is restricted.
- crypto-js - we use this to help with calling our backend API. A lot of our requests require an HMAC header, which is created with hmacsha512
- lodash - general utility library that includes a ton of useful functions
- match-sorter - used to add filtering functionality in our tables
- moment - general utility library for dates and times. One main use is formatting dates in our tables.
- money - very small utility to assist with conversion rates of currencies. For some functionality our backend sends an object containing exchanges rates from a list of currencies to USD, we can use this to ask what the rate between two different currencies in that list is.
- normalizr - normalizes objects according to a schema. Useful for turning an array of objects into an object so accessing data is easier.
- numbro - number formatting library we use to format numbers across the app.
- pdfmake - utility to create pdfs in the browser, we use this for table export to PDF functionality
- redoc - displays OpenAPI documentation in a friendly way
    - mobx - redoc requires mobx as a dependency
- xlsx - similar to pdfmake, this is a library that will create excel and csv files in the browser, we use this for export functionality in tables.
- yup - object schema validation, used alongside formik for form validation.

### Misc.

- flag-icon-css - used for icons used on signup form
- i18n-iso-countries - iso codes for countries
- react-google-recaptcha - Google Recaptcha react component
- react-gtm-module - Google Tag Manager
- react-helmet - adds stuff to the head section depending on app context, like titles and metatags
