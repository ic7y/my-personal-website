// ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: 'my-nuxt-site', // ← 这就是名字来源
      script: './.output/server/index.mjs',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
	PORT: 8080
      }
    }
  ]
}


module.exports = {
  apps: [{
    name: "my-nuxt-site",
    script: ".output/server/index.mjs",
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: "1G",
    env: {
      PORT: 3000
    }
  }]
}
