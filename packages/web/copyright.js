#!/usr/bin/env node

const fs = require('fs');
const manifest = require(`${__dirname}/build/asset-manifest.json`);
const buildFileName = `${__dirname}/build/${manifest.files["main.js"]}`

const build = fs.readFileSync(buildFileName, { encoding: 'utf8' });

const license = '//Copyright 2023 by Bytedex Global'

fs.writeFileSync(buildFileName,
`
${license}
${build}
`
  )