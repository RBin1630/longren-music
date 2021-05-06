import {
  request
} from '../../network/request';
import {throttle} from '../../utils/throttle';
import {debounce} from '../../utils/debounce';

// miniprogram/pages/video/video.js
const app = getApp().globalData;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 导航部分数据
    tabs: [],
    activeTab: 0,
    windowHeight: 0,

    // 推荐视频数据
    recommendVideoData: [],
    // 热门MV 列表数据
    hotMVList: [],

    // 记录MV播放地址
    MVSrc: '',
    // 记录播放视频的id
    MVId: 0,
    // 记录视频播放的进度
    videoCurrentTime: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const tabs = [{
        title: '推荐视频'
      },
      {
        title: '热门MV'
      },
    ]
    this.setData({
      tabs
    });

    wx.getSystemInfo({
      success: (res) => {
        let windowHeight = res.windowHeight * 2;
        this.setData({
          windowHeight: windowHeight
        })
      }
    });

    // 获取推荐视频数据
    request('wy', '/video/timeline/all', {
      offset: 0
    }).then(res => {
      let recommendVideoData = res.datas;
      this.setData({
        recommendVideoData
      })
    }).catch(err => {
      console.log(err);
    });

    // 获取热门MV数据
    request('wy', '/top/mv', {
      limit: 10
    }).then(res => {
      console.log(res);
      this.setData({
        hotMVList: res.data
      })
    })
  },

  // 点击MV进行播放
  playMV(e) {
    console.log(e);
    let id = e.currentTarget.dataset.item.id;
    this.setData({
      MVId: id,
      MVSrc: ''
    })
    // 获取mv地址
    request('wy', '/mv/url', { id }).then(res => {
      this.setData({
        MVSrc: res.data.url
      })
    });
  },

  // 跳转至视频播放页面
  toVideoPlayer(e) {
    console.log(e);
    app.videoInfo = e.currentTarget.dataset.item;
    app.videoType = 'video';

    wx.navigateTo({
      url: '/pages/videoPlayer/videoPlayer',
    })
  },

  // 推荐视频scroll触底的回调
  loadRecommendVideo: debounce(function() {
    // 加载更多推荐视频的数据
    wx.showLoading({
      title: '加载中。。。',
      mask: true
    })
    let x = parseInt(this.data.recommendVideoData.length / 8);
    request('wy', '/video/timeline/all', {
      offset: x
    }).then(res => {
      console.log('上拉加载了更多数据');
      let recommendVideoData = this.data.recommendVideoData;
      recommendVideoData.push(...res.datas);
      this.setData({
        recommendVideoData
      });
      wx.hideLoading()
    })
  }, 1000),
  
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})