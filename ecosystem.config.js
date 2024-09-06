module.exports = {
  apps: [
    {
      name: 's6-front',
      port: '1349',
      exec_mode: 'cluster',
      instances: 1,
      script: './.output/server/index.mjs'
    }
  ]
}
