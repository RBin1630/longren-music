const { request } = require("../../network/request");

// miniprogram/pages/songList/songList.js
const app = getApp().globalData

Page({
  data: {
    // 歌曲列表
    songList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let data = app.songListInfo
    console.log(data);
    wx.setNavigationBarTitle({
      title: data.name,
    })
    // 根据id请求歌单中的详细数据
    request('wy', '/playlist/detail', { id: data.id}).then(res => {
      console.log(res);
      app.playListData = res.playlist.tracks;
      this.setData({
        songList: res.playlist.tracks
      })
    }).catch(err => {
      console.log(err);
    })
  },

  // 跳转到播放详情页
  toPlayer(e) {
    app.songId = e.currentTarget.dataset.songid;
    app.playListId = app.songListInfo.id;
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