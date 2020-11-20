const fs = require('fs')

function getConfig() {
    let config = JSON.parse(fs.readFileSync('../alastria-identity/config.json'))
    fs.writeFileSync(
      './node_modules/alastria-identity-lib/src/config.ts',
      `export const config = ${JSON.stringify(config)}`
    )
  }
  
  getConfig()