// VUE_APP_BASE_API = 'http://192.168.56.158:8070'
// VUE_APP_BASE_API = 'http://192.168.58.0:8080'
// 3.0
// VUE_APP_BASE_API = 'http://172.51.216.106:49090'
// ali
// VUE_APP_BASE_API = 'http://112.126.65.241:9002'
// 测试服1
// VUE_APP_BASE_API = 'http://8.131.231.56:49090'
// 测试服2
// VUE_APP_BASE_API = 'http://8.131.247.200:49090'
// 2.0
// VUE_APP_BASE_API = 'http://172.51.216.106:9002'

// staging 环境下用户可以自定义后端服务IP及端口
if (process.env.VUE_APP_NINJA_CAT && !sessionStorage.getItem('staging')) {
  const _url = window.prompt('staging')
  if (_url) {
    sessionStorage.setItem('staging', `http://${_url}`)
  }
}

export const VUE_APP_BASE_API = process.env.VUE_APP_NINJA_CAT
  ? sessionStorage.getItem('staging') || undefined
  : 'http://172.51.216.106:49090'

export const BASE_REQUEST_TIME_OUT = 60000

export const PROJECT_TITLE = process.env.VUE_APP_NINJA_CAT
  ? `${VUE_APP_BASE_API}，最近更新${new Date()}`
  : process.env.NODE_ENV === 'development'
  ? `开发环境IP${VUE_APP_BASE_API}`
  : '交控科技天枢平台数据采集管理中心'

// rgb 0,21,41
export const PROJECT_BASE_COLOR = '#001529'