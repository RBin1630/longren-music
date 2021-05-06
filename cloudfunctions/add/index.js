// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {
  // const {
  //   OPENID,
  // } = cloud.getWXContext()
  // const { collectionName, ...params } = event
  const {
    collectionName,
    songInfo,
    userInfo
  } = event
  // 需要前后加字符串，否则会出现一直添加在第一张表上的情况
  // return await db.collection(''+collectionName+'').add({
  //   data: {
  //     // open_id: OPENID,
  //     ...params,
  //     createdTime: new Date().getTime(),
  //   }
  // })
  db.collection(''+collectionName+'').where({
    songId: songInfo.id,
  }).get().then(async res => {
    console.log(res);
    // 说明该数据已经存在了
    if (res.data.length>0) {
      console.log('这条数据已存在 更新一下创建时间');
      return await db.collection('' + collectionName + '')
      .where({
        songId: songInfo.id
      }).update({
          data: {
            createdTime: new Date().getTime()
          }
        })
    } else {
      console.log('这条数据是新数据，不需要删除操作。');
      return await db.collection('' + collectionName + '')
        .add({
          data: {
            // open_id: OPENID,
            songId: songInfo.id,
            songInfo,
            userInfo,
            createdTime: new Date().getTime()
          }
        })
    }
  })
}