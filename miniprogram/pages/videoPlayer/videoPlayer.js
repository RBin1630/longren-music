// miniprogram/pages/VideoPlayer/videoPlayer.js
const app = getApp().globalData;
import {
  request
} from '../../network/request'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 视频url
    videoSrc: '',
    // 记录视频数据
    videoInfo: {},
    // 记录相关视频列表数据
    otherVideoList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let videoInfo = app.videoInfo.data;
    this.setData({
      videoInfo
    })
    // 请求视频url
    request('wy', '/video/url', {
      id: videoInfo.vid
    }).then(res => {
      this.setData({
        videoSrc: res.urls[0].url
      })
    }).catch(err => {
      console.log(err);
    });
    // 请求相关视频数据
    request('wy', '/related/allvideo', {
      id: videoInfo.vid
    }).then(res => {
      console.log(res);
      this.setData({
        otherVideoList: res.data
      })
    }).catch(err => {
      console.log(err);
    });
  },

  // 点击相关视频触发的回调
  loadOtherVideo(e) {
    console.log(e.currentTarget.dataset.item);
    let id = e.currentTarget.dataset.item.vid;
    // 请求视频url
    request('wy', '/video/url', {
      id
    }).then(res => {
      this.setData({
        videoSrc: res.urls[0].url
      })
    }).catch(err => {
      console.log(err);
    });
    // 请求相关视频数据
    request('wy', '/related/allvideo', {
      id
    }).then(res => {
      console.log(res);
      this.setData({
        otherVideoList: res.data
      })
    }).catch(err => {
      console.log(err);
    });
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