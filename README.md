
[![Netlify Status](https://api.netlify.com/api/v1/badges/a449af0b-0572-4105-b5a0-15e981e0a5a3/deploy-status)](https://app.netlify.com/sites/upbeat-khorana-b0fd0e/deploys)

## Bytedex Exchange Frontend

This repository is a [lerna monorepo](https://github.com/lerna/lerna) that contains a shared codebase for the Bytedex Exchange frontend.

Current packages:
* `web` - The react version of the app for web browsers

## Setup

### Requirements

1. Install [nodejs/npm](https://nodejs.org/en/ ) @ LTS version
1. Install [yarn](https://yarnpkg.com/) globally -- `npm install -g yarn`
1. Install [Lerna](https://lerna.js.org/) globally -- `npm install -g lerna`

### Repository Setup

1. Clone the repository
1. Naviate to repository that was cloned
1. Run `lerna bootstrap`

### Running the React App

1. Navigate to `packages/web`
1. Run `yarn start`
