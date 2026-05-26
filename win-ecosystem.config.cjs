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
