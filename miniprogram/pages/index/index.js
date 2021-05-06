import {
  request
} from '../../network/request'
const app = getApp().globalData
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 存储轮播图
    bannerImageUrlList: [],
    // 推荐歌曲数据
    recommendSongs: [],
    // 热门歌单数据
    hotSongList: [],
    //存储所有排行榜的id
    topListId: [],
    // 存储排行榜相关数据
    topListData: [],
    // 推荐歌曲的列表数据
    recommendPlaylist: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 发送请求 获取轮播图数据
    request('wy', '/banner', {
      'type': 2
    }).then(res => {
      this.setData({
        bannerImageUrlList: res.banners,
      })
    }, err => {
      console.log(err);
    });

    // 发送请求 获取推荐歌单数据
    request('wy', '/personalized', {
      'limit': 6
    }).then(res => {
      this.setData({
        hotSongList: res.result,
      })
    }, err => {
      console.log(err);
    });

    // 发请求 获取热歌排行榜的tracksId 3778678这是热歌排行榜的id 直接浏览器拿
    // request('wy', '/playlist/detail', { id: 3778678 }).then(res => {
    //   console.log(res);
    //   let recommendSongTrackIds = res.privileges.slice(0, 6);
    //   return recommendSongTrackIds
    // }).catch(err => {
    //   console.log(err);
    // }).then(res => {
    //   let ids = res.map(item => {
    //     return item.id
    //   }).join(',')
    //   request('wy', '/song/detail', { ids }).then(res => {
    //     console.log(res);
    //     let recommendSongs = res.songs;
    //     this.setData({
    //       recommendSongs
    //     })
    //   }).catch(err => {
    //     console.log(err);
    //   })
    // })



    // 发送请求 获取排行榜的id 
    let topListId = [];
    request('wy', '/toplist').then(res => {
      // 拿到全部(30)排行榜的id
      res.list.map(item => {
        topListId.push(item.id);
      });
      this.setData({
        topListId
      });
    }).then(res => {
      let topListData = [];
      let tracksData = [];
      for (let i = 0; i < 6; i++) {
        // 获取到排行榜id后才能 发送请求，获取排行榜详细数据
        request('wy', '/playlist/detail', {
          id: this.data.topListId[i]
        }).then(res => {
          let topListItem = {
            id: res.playlist.id,
            name: res.playlist.name,
            tracks: res.playlist.tracks.slice(0, 3)
          }
          let tracksItem = res.playlist.tracks
          topListData.push(topListItem);
          tracksData.push(tracksItem);
          this.setData({
            topListData,
            tracksData
          });
        })
      }
      let timer = setInterval(() => {
        if(this.data.tracksData && this.data.tracksData.length >= 6) {
          let recommendPlaylist = this.data.tracksData[parseInt(Math.random() * 7)];
          let recommendSongs = recommendPlaylist.slice(0, 6);
          this.setData({
            recommendPlaylist,
            recommendSongs
          })
          clearInterval(timer);
        }
      }, 500)
    })
  },

  // 点击搜索栏跳转至搜索页面
  toSearch() {
    wx.navigateTo({
      url: '/pages/search/search',
    })
  },

  // 点击跳转至歌曲列表页
  toSongList(e) {
    console.log(e);
    app.songListInfo = e.currentTarget.dataset.item
    wx.navigateTo({
      url: '/pages/songList/songList',
    })
  },

  // 跳转至歌曲播放页面
  toPlayer(e) {
    console.log(e);
    app.songId = e.currentTarget.dataset.songid;
    // app.playListId = e.currentTarget.dataset.playlistid;
    app.playListData = this.data.tracksData[e.currentTarget.dataset.index] || this.data.recommendPlaylist;
    wx.navigateTo({
      url: '/pages/player/player',
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})