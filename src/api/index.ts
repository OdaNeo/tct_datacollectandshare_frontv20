import REQUEST_NAME from './requestName'
import { returnType, httpAllParams, headerObj } from '../type/http-request.type'
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { rootStoreModule } from '../store/modules/root'
import { cancelTokenModule } from '../store/modules/request'
import alertUtil from '../utils/alertUtil'
import authUtil from '../utils/authenticateUtil'
import { VUE_APP_BASE_API, BASE_REQUEST_TIME_OUT } from '../../config'
import { uploadStoreModule } from '@/store/modules/upload'
import { httpErrorMsg } from '@/enum/http-enum'

class RequestData {
  private axiosIns: AxiosInstance = axios.create({
    baseURL: VUE_APP_BASE_API,
    headers: {
      post: {
        'Content-Type': 'application/json;charset=UTF-8'
      }
    },
    onUploadProgress: progress => {
      // 格式化成百分数
      uploadStoreModule.handleSetUploadingProgress(Math.ceil((progress.loaded / progress.total) * 100))
    }
    // withCredentials: true
  })

  private DEFAULT_CONFIG = {
    timeout: BASE_REQUEST_TIME_OUT
  }

  constructor(headers: Array<headerObj> = [], otherConfig?: AxiosRequestConfig) {
    this.axiosIns.interceptors.request.use((config: AxiosRequestConfig) => {
      if (headers?.length > 0) {
        // 自定义headers
        headers.forEach((header: headerObj) => {
          config.headers[header.headerKey] = header.headerVal
        })
      } else {
        // 默认发token
        config.headers['Authorization'] = rootStoreModule.UserState.token
      }

      // 取消上个页面的请求
      config.cancelToken = new axios.CancelToken(cancel => {
        cancelTokenModule.setToken(cancel)
      })

      // 合并用户配置与默认配置
      config = { ...config, ...this.DEFAULT_CONFIG, ...otherConfig }

      return config
    })

    this.axiosIns.interceptors.response.use(
      ({ data, headers }: AxiosResponse) => {
        // 如果有content-disposition 响应头，认为是文件下载
        const filename = headers['content-disposition']?.split('=')[1].split('"')[1]
        filename && (data.filename = filename)
        return Promise.resolve(data)
      },
      (error: AxiosError) => {
        // console.log(error.response)
        let _msg = '其他'
        if (error.message.includes('Network Error')) {
          _msg = '网络错误'
        } else if (error.message.includes('timeout')) {
          _msg = '超时'
        } else if (error.message.includes('路由跳转取消请求')) {
          _msg = '取消'
        }
        return Promise.reject({
          httpStatus: error.response?.status || _msg,
          code: error.response?.data.code,
          message: error.response?.data.message
        })
      }
    )
  }

  public httpGET = async <T>(
    requestName: keyof typeof REQUEST_NAME,
    params: T,
    ...urlArr: Array<string>
  ): Promise<returnType> => {
    const url = this.urlFormat(REQUEST_NAME[requestName], [...urlArr])
    try {
      const response: returnType = await this.axiosIns.get(url, {
        params
      })
      return new Promise(resolve => {
        this.codeType(response, (data: returnType) => {
          resolve(data)
        })
      })
    } catch (err) {
      return new Promise(resolve => {
        this.httpErrorHandle(err, (data: returnType) => {
          resolve(data)
        })
      })
    }
  }

  public httpPOST = async <T>(
    requestName: keyof typeof REQUEST_NAME,
    params: T,
    ...urlArr: Array<string>
  ): Promise<returnType> => {
    const url = this.urlFormat(REQUEST_NAME[requestName], [...urlArr])
    try {
      const response: returnType = await this.axiosIns.post(url, params)
      return new Promise(resolve => {
        this.codeType(response, (data: returnType) => {
          resolve(data)
        })
      })
    } catch (err) {
      return new Promise(resolve => {
        this.httpErrorHandle(err, (data: returnType) => {
          resolve(data)
        })
      })
    }
  }

  public httpPUT = async <T>(
    requestName: keyof typeof REQUEST_NAME,
    params: T,
    ...urlArr: Array<string>
  ): Promise<returnType> => {
    const url = this.urlFormat(REQUEST_NAME[requestName], [...urlArr])
    try {
      const response: returnType = await this.axiosIns.put(url, params)
      return new Promise(resolve => {
        this.codeType(response, (data: returnType) => {
          resolve(data)
        })
      })
    } catch (err) {
      return new Promise(resolve => {
        this.httpErrorHandle(err, (data: returnType) => {
          resolve(data)
        })
      })
    }
  }

  public httpAll = async <T extends httpAllParams>(params: Array<T>): Promise<returnType[]> => {
    const httpList = params.map(
      (item: T): Promise<returnType> => {
        switch (item.method) {
          case 'get':
            return this.axiosIns.get(REQUEST_NAME[item.name], {
              params: item.data
            })
          case 'post':
            return this.axiosIns.post(REQUEST_NAME[item.name], item.data)
          case 'put':
            return this.axiosIns.put(REQUEST_NAME[item.name], item.data)
          default:
            return this.axiosIns.get(REQUEST_NAME[item.name], {
              params: item.data
            })
        }
      }
    )
    try {
      const response: Array<returnType> = await axios.all(httpList)
      return new Promise(resolve => {
        this.codeType(response, (data: Array<returnType>) => {
          resolve(data)
        })
      })
    } catch (err) {
      // Promise.all 返回第一个错误
      return new Promise(resolve => {
        this.httpErrorHandle(
          err,
          (data: returnType[]) => {
            resolve(data)
          },
          params
        )
      })
    }
  }

  private urlFormat(url: string, urlArr: Array<string>): string {
    let u: string = url
    if (urlArr.length > 0) {
      urlArr.forEach(element => {
        u += `/${element}`
      })
    }
    return u
  }

  // 捕捉业务上的错误：直接显示后端错误码
  private codeType(response: Array<returnType> | returnType, callback: Function) {
    let code = 0
    let message = ''
    let _error: {} | Array<{}>
    let filename: string | undefined = ''

    if (Array.isArray(response)) {
      // 找出第一个错误项
      const _error_item = response.filter(item => item.code !== 200)

      if (_error_item.length === 0) {
        code = 200
      } else {
        code = _error_item[0].code
        message = _error_item[0].message
      }
      _error = response.map(() => ({}))
    } else {
      filename = response.filename
      code = response.code
      message = response.message
      _error = {}
    }
    // 如果有filename，直接callback
    if (filename) {
      callback(response)
      return
    }

    switch (code) {
      // -1000是登录超时，用户需要重新登陆，2秒后
      case -1000:
        alertUtil.open(`${message}，请尝试重新登录`, true, 'error')
        // 登出
        setTimeout(() => {
          authUtil.logout()
        }, 2000)

        callback(_error)
        break

      case 200:
        alertUtil.close()
        callback(response)
        break

      default:
        alertUtil.open('错误代码：' + code + '，错误信息：' + message, true, 'error')
        // 默认返回{}或者[{},{}...]
        callback(_error)
        break
    }
  }
  // 捕捉http错误：显示http错误码
  private httpErrorHandle(
    err: { httpStatus: string | number; code: number; message: string },
    callback: Function,
    data?: Array<unknown>
  ) {
    // console.log('error status:' + err.status)
    let _message = ''
    switch (err.httpStatus) {
      case '取消':
        // 如果是取消请求，直接返回，不提示错误
        return
      case '网络错误':
        _message = '网络错误，请检查网络连接'
        break
      case '超时':
        _message = '请求超时，请重试'
        break
      default:
        console.error(err)
        _message = `错误代码：${err.code}，HTTP错误码：${err.httpStatus}，${err.message}：${
          httpErrorMsg[Number(err.httpStatus)]
        }`
        break
    }

    alertUtil.open(_message, true, 'error')

    let _error: {} | Array<{}>
    data ? (_error = data.map(() => ({}))) : (_error = {})
    // 如果请求失败，默认返回{}或者[{},{}...]
    callback(_error)
  }
}

export default RequestData
