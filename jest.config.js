// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'], // This is the correct spelling!
  testEnvironment: 'jsdom',
}

module.exports = createJestConfig(customConfig)