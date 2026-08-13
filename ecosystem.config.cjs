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
	      PORT: 8080,
        WX_APPID: 'wx890e079c68fa47bf',
        WX_SECRET: 'c1e1f81643564b2cd0d45ac494ef03c2'
      }
    }
  ]
}


