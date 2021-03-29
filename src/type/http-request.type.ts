import REQUEST_NAME from '@/api/requestName'
import { topicTable } from './topic.type'

export type paramsType = {
  pageSize: number
  pageNum: number
  dataType?: number
  faceTypes?: any
  userName?: string
  id?: string
  status?: number
  topicId?: string
  topicID?: string
}

export type returnTypeData = {
  list: Array<topicTable>
  total: number
  pageNum: number
  pageSize: number
}

export type returnType = {
  code: number
  data: any | returnTypeData
  message: string
  success: boolean
}

export type httpAllParams = {
  name: keyof typeof REQUEST_NAME
  method: string
  data: any
}

export type headerObj = {
  headerKey: string
  headerVal: string | number
}
