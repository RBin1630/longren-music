import {
  request
} from '../../network/request'
// miniprogram/pages/search/search.js
const app = getApp().globalData;
Page({
  data: {
    // input输入框的值
    keyWord: '',
    // 默认搜索关键词
    searchDefault: {
      showKeyword: '',
      realkeyword: ''
    },
    // 热门搜索关键词
    searchHots: [],
    // 搜索建议歌曲数据
    songs: [],
    // 记录历史搜索记录 数据来自本地
    histroySearch: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 请求默认搜索关键词
    request('wy', '/search/default').then(res => {
      let showKeyword = res.data.showKeyword;
      let realkeyword = res.data.realkeyword;
      this.setData({
        'searchDefault.showKeyword': showKeyword,
        'searchDefault.realkeyword': realkeyword
      })
    }).catch(err => {
      console.log(err);
    });

    // 请求热门搜索关键词
    request('wy', '/search/hot').then(res => {
      console.log(res);
      this.setData({
        searchHots: res.result.hots
      })
    }).catch(err => {
      console.log(err);
    });

    // 一加载立马调用处理历史搜索记录的方法
    this.dealHistroySearch(this.data.keyWord);
  },

  // 处理历史搜索记录
  dealHistroySearch(keyWrod) {
    let histroy
    try {
      let local = wx.getStorageSync('histroySearch')
      if (local) {
        histroy = local
        if (keyWrod && local.indexOf(keyWrod) < 0) {
          local.push(keyWrod)
          wx.setStorage({
            key: "histroySearch",
            data: local
          })
        }
      } else {
        if (keyWrod) {
          histroy = [keyWrod]
          wx.setStorage({
            key: "histroySearch",
            data: [keyWrod]
          })
        }
      }
    } catch (e) {
      console.log(e)
    }
    if (histroy) {
      this.setData({
        histroySearch: histroy.reverse()
      })
    }
  },

  // 处理input输入框数据
  handleInput() {
    if (this.data.keyWord) {
      this.getSearchData(this.data.keyWord).then(res => {
        console.log(res);
        if (res.result && res.result.length === 0) {
          this.setData({
            songs: []
          })
        } else {
          this.setData({
            songs: res.result.songs
          })
        }
      }).catch(err => {
        console.log(err);
      })
    }
  },

  // 获取搜索结果
  getSearchData(keyWord) {
    return request('wy', '/search/suggest', {
      keywords: keyWord
    }).then(res => {
      return res;
    }).catch(err => {
      return err
    })
  },

  // 点击搜索结果中的歌曲的回调
  handleSelectSong(e) {
    // 点击之后把搜索结果赋予input输入框的值
    this.data.keyWord = e.currentTarget.dataset.keyword;
    // 点击了搜索结果的歌曲会进行跳转 在跳转成功前执行把keyWord进行处理 保存到本地
    this.dealHistroySearch(this.data.keyWord);

    app.songId = e.currentTarget.dataset.id;
    app.playListData = [e.currentTarget.dataset.item];
    // 跳转至歌曲播放页面
    wx.redirectTo({
      url: '/pages/player/player',
      success() {
        console.log('我跳');
      }
    })
  },

  // 删除历史记录
  deleteHistroySearch (event) {
    const keyWord = event.currentTarget.dataset.txt
    if (keyWord) {
      let local = wx.getStorageSync('histroySearch')
      let index = local.indexOf(keyWord)
      local.splice(index, 1)
      wx.setStorageSync('histroySearch', local)
    } else {
      // 清空
      wx.removeStorageSync('histroySearch')
    }
    this.setData({
      histroySearch: wx.getStorageSync('histroySearch')
    })
  },

  // 点击了热门搜索关键词
  searchAction(e) {
    // 把热门关键词作为搜索关键词
    let keyWord = e.currentTarget.dataset.txt;
    this.setData({
      keyWord
    });
    this.getSearchData(this.data.keyWord).then(res => {
      console.log(res);
      if (res.result && res.result.length === 0) {
        this.setData({
          songs: []
        })
      } else {
        this.setData({
          songs: res.result.songs
        })
      }
    }).catch(err => {
      console.log(err);
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