'use strict'

const fs = require('fs')
const path = require('path')
const xml = require('xml')
const getPackageData = require('./utils/getPackageData')
const getConfig = require('./utils/getConfig')
const xmlIndent = require('./utils/xmlIndent')
const testExecutions = require('./xml/testExecutions')
const getDefaultConfig = require('./getDefaultConfig')

const root = process.cwd()
const packageData = getPackageData(root)

const processor = (results, reporterOptions = {}) => {
  const config = Object.assign({}, getDefaultConfig(root), getConfig(packageData, reporterOptions, process.env.NODE_ENV))
  const report = xml(testExecutions(results, config.sonar56x), { declaration: true, indent: xmlIndent(config.indent) })

  if (!fs.existsSync(config.reportPath)) {
    fs.mkdirSync(config.reportPath)
  }

  const reportFile = path.join(config.reportPath, config.reportFile)
  fs.writeFileSync(reportFile, report)

  if (process.env.DEBUG) {
    fs.writeFileSync('debug.json', JSON.stringify(results, null, 2))
  }

  return results
}

function JestSonar(globalConfig, options) {
  this._options = options;

  this.onRunComplete = (contexts, results) => {
    processor(results, this._options);
  };
}

module.exports = JestSonar
