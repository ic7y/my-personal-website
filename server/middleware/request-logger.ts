export default defineEventHandler((event) => {
  const method = event.node?.req?.method || event.req?.method
  const url = event.node?.req?.url || event.req?.url
  console.log('[middleware] incoming', method, url)
})
