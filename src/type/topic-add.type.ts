export type TopicAdd = {
    topicName: string,
    messageType: string,
    queneType: string,
    dataStruct: string,
    structMapping: string,
    topicList: Array<any>,
    _numberS: string,
    _keyS: string
    interfaceType: string | number
    databaseType: string
    dataBaseIp: string
    url:string
    header:string
    canNotEdit:boolean
    id:string
    redisTimer:number
    writeElasticsearch:any
}
