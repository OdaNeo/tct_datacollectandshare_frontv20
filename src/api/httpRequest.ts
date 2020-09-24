import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import RequestHelper from './requestHelper';
import { rootStoreModule } from "../store/modules/root"
import { httpAllParams, returnDataType } from '../type/http-request.type';



class HttpRequest {
  private axiosIns: AxiosInstance = axios.create({
    // baseURL: "http://112.126.65.241:8081", // 测试环境
    // baseURL: "http://192.168.62.13:9000",
    //baseURL: "http://localhost:8080",
    //baseURL: "http://192.168.62.84:9000",
    baseURL: "http://192.168.60.214:9000/", // 郝帅本地服务
    timeout: 50000,
    headers: {
      post: {
        "Content-Type":"application/json;charset=UTF-8"
      }
    }
  });
  private requestHelper: RequestHelper = new RequestHelper(this.axiosIns);
  constructor() {
    // this.axiosIns.defaults.baseURL = "http://localhost:9000"
    // this.axiosIns.defaults.timeout = 10000
    // this.axiosIns.defaults.headers.post["Content-Type"] = "application/json;charset=UTF-8"
    this.axiosIns.interceptors.request.use((config: AxiosRequestConfig) => {
      config.headers["Authorization"] = rootStoreModule.UserState.token
      return config;
    })

    this.axiosIns.interceptors.response.use(({data}:AxiosResponse) => {
      try {
        return Promise.resolve(data);
      } catch (error) {
        return Promise.reject(error)
      }
    })
  }


  public get = async <T>(url: string,data: T,callback: Function)=> {
    const response:returnDataType = await this.requestHelper.getFun<T>(url, data)
    this.codeType(response,callback)
  }

  public post = async <T>(url: string, data: T, callback: Function) => {
    const response:returnDataType = await this.requestHelper.postFun<T>(url, data)
    this.codeType(response,callback)
  }

  public put = async <T>(url: string, data: T, callback: Function) => {
    const response:returnDataType = await this.requestHelper.putFun<T>(url, data)
    this.codeType(response,callback)
  }


  public all = async<T extends httpAllParams>(data: Array<T>, callback: Function) => {
    const response:Array<returnDataType> = await this.requestHelper.allFun<T>(data)
    this.codeType(response,callback)
  }

  private codeType(response: Array<returnDataType>|returnDataType, callback: Function) {
    let code:number = 0
    if (Array.isArray(response)) {
      code = response[0].code
    } else {
      code = response["code"]
    }
    switch (code) {
      case 200:
        callback(response)
        break;

      default:
        break;
    }
  }

}

export default HttpRequest;
