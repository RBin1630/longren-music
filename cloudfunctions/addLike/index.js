// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {
  const {
    collectionName,
    ...params
  } = event
  // 需要前后加字符串，否则会出现一直添加在第一张表上的情况
  return await db.collection(''+collectionName+'').add({
    data: {
      ...params,
      createdTime: new Date().getTime(),
    }
  })
}