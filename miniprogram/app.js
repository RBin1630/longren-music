//app.js
App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'my-env-id',
        traceUser: true,
      })
    }

    try {
      var value = wx.getStorageSync('cookies')
      if (!value) {
        // 获取cookies
        wx.request({
          url: 'https://tryvercel-rust.vercel.app/login/cellphone?phone=17722190204&password=chen1397',
          success(res) {
            console.log(res);
            wx.setStorageSync('cookies', res.cookies);
          }
        })
      }
    } catch (e) {
      // Do something when catch error
      console.log(e);
    }



    this.globalData = {
      // 歌单的数据 主要是要拿到歌单的图片和歌单的id
      songListInfo: {},

      // 记录当前点击进来的播放列表id
      playListId: 0,
      // 记录歌单列表数据
      playListData: [],
      // 记录实时播放列表id
      // currentPlayListId: 0,
      // 记录歌曲id 用于歌曲播放页请求歌曲url
      songId: 0,
      // 记录实时歌曲id
      currentSongId: 0,
      // 歌曲是否在播放
      isPlay: false,
      // 记录歌曲信息
      songInfo: {},
      // 记录歌曲时长
      durationTime: '00:00',

      // 记录视频数据
      videoInfo: {},
    }
  }
})