// miniprogram/pages/profile/profile.js
import {debounce} from '../../utils/debounce'
import {throttle} from '../../utils/throttle'
const db = wx.cloud.database();
const app = getApp().globalData;
Page({
  data: {
    // 当前swiper中的索引
    currentIndex: 0,

    // 历史歌曲列表长度
    historyListLength: 0,
    // 喜欢歌曲列表长度
    likeListLength: 0,
    // 历史歌曲列表
    historyList: [],
    // 喜欢歌曲列表
    likeList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  // 获取history表的数据长度 
  getHistoryListLength() {
    wx.cloud.callFunction({
      name: 'getListLength',
      data: {
        collectionName: 'history'
      }
    }).then(res => {
      console.log(res);
      this.setData({
        historyListLength: res.result.total
      })
    })
    .catch(console.error)
  },

  // 获取like表中的数据长度
  getLikeListLength() {
    wx.cloud.callFunction({
      name: 'getListLength',
      data: {
        collectionName: 'like'
      }
    }).then(res => {
      console.log(res);
      this.setData({
        likeListLength: res.result.total
      })
    })
    .catch(console.error)
  },

  // 获取历史播放歌曲列表
  getHistoryList() {
    db.collection('history').orderBy('createdTime', 'desc')
    .get().then(res => {
      console.log(res.data);
      this.setData({
        historyList: res.data
      })
    })
  },

  // 获取喜欢歌曲列表
  getLikeList() {
    db.collection('like').orderBy('createdTime', 'desc')
    .get().then(res => {
      console.log(res.data);
      // 按创建时间从大到小 即离当前时间最近的时间戳
      let likeList = res.data.sort((a, b) => {
        return b.createdTime - a.createdTime;
      })
      this.setData({
        likeList,
      })
    })
  },

  // 点击选项卡获取活跃index
  handleCurrentIndex(e) {
    let currentIndex = parseInt(e.currentTarget.dataset.index);
    console.log('点击了' + currentIndex);
    this.setData({
      currentIndex
    })
  },

  // 歌曲列表左右滑动触发 更新currentIndex
  handleSwiperChange(e) {
    let currentIndex = parseInt(e.detail.current);
    console.log('滑动到当前索引位置为：', currentIndex);
    this.setData({
      currentIndex
    })
  },

  // 跳转到播放页面
  toPlayer(e) {
    app.songId = e.currentTarget.dataset.songid;
    if (e.currentTarget.dataset.type === 'history') {
      let playListData = this.data.historyList.map(item => {
        return item.songInfo
      })
      app.playListData = playListData;
    } else if (e.currentTarget.dataset.type === 'like') {
      let playListData = this.data.likeList.map(item => {
        return item.songInfo
      })
      app.playListData = playListData;
    }
    wx.navigateTo({
      url: '/pages/player/player',
    })
  },

  // 点击歌曲的三个小点 弹出选项 
  songSetting(e) {
    console.log(e.currentTarget.dataset);
    let _this = this;
    if (e.currentTarget.dataset.type === 'history') {
      wx.showActionSheet({
        itemList: ['收藏歌曲', '从列表移除歌曲'],
        success(res) {
          if (res.tapIndex === 0) {
            let likeList = _this.data.likeList;
            likeList.unshift(e.currentTarget.dataset.item)
            _this.setData({
              likeList,
              likeListLength: _this.data.likeListLength + 1
            });
            // 收藏歌曲 调用云函数把歌曲添加到收藏表中
            wx.cloud.callFunction({
                name: 'addLike',
                data: {
                  collectionName: 'like',
                  songInfo: e.currentTarget.dataset.item.songInfo,
                },
              })
              .then(res => {
                console.log(res);
                wx.showToast({
                  title: '收藏成功',
                })
              })
              .catch(console.error)
          } else if (res.tapIndex === 1) {
            // 删除记录
            let historyList = _this.data.historyList.filter(item => {
              return item.songInfo.id !== e.currentTarget.dataset.item.songInfo.id
            });
            _this.setData({
              historyList,
              historyListLength: _this.data.historyListLength - 1
            });
            // 把数据库中的history中相对应的数据删除
            wx.cloud.callFunction({
              name: 'delete',
              data: {
                collectionName: 'history',
                songId: e.currentTarget.dataset.item.songInfo.id
              }
            }).then(res => {
              console.log(res);
            }).catch(console.error)
          }
        },
        fail(res) {
          console.log(res.errMsg)
        }
      });
    }
    if (e.currentTarget.dataset.type === 'like') {
      wx.showActionSheet({
        itemList: ['取消收藏'],
        success(res) {
          // 取消收藏
          let likeList = _this.data.likeList.filter(item => {
            return item.songInfo.id !== e.currentTarget.dataset.item.songInfo.id
          });
          _this.setData({
            likeList,
            likeListLength: _this.data.likeListLength - 1
          });
          // 把数据库中的like中相对应的数据删除
          wx.cloud.callFunction({
            name: 'delete',
            data: {
              collectionName: 'like',
              songId: e.currentTarget.dataset.item.songInfo.id
            }
          }).then(res => {
            console.log(res);
          }).catch(console.error)
        },
        fail(res) {
          console.log(res.errMsg)
        }
      });
    }
  },

  // 拉到底部触发的回调
  loadSongList() {
    // if(this.data.currentIndex === 0) {
    //   // 如果本来显示的数据就小于20 说明没有更多数据了
    //   if(this.data.historyList.length < 20) {
    //     return
    //   }
    //   if(!this.data.historyAll) {
    //     wx.showLoading({
    //       title: '加载中。。。',
    //       mask: true
    //     })
    //     let x = this.data.historyList.length;
    //     db.collection('history').orderBy('createdTime', 'desc').skip(x).get()
    //     .then(res => {
    //       wx.hideLoading();
    //       console.log(res.data);
    //       let historyList = this.data.historyList;
    //       historyList.push(...res.data);
    //       this.setData({
    //         historyList,
    //       });
    //       if(res.data.length < 20) {
    //         this.setData({
    //           historyAll: true
    //         })
    //       }
    //     })
    //   }
    // } else if(this.data.currentIndex === 1) {
    //   // 如果本来显示的数据就小于20 说明没有更多数据了
    //   if(this.data.likeList.length < 20) {
    //     return
    //   }
    //   if(!this.data.likeAll) {
    //     wx.showLoading({
    //       title: '加载中。。。',
    //       mask: true
    //     })
    //     let x = this.data.likeList.length;
    //     db.collection('like').orderBy('createdTime', 'desc').skip(x).get()
    //     .then(res => {
    //       wx.hideLoading();
    //       console.log(res.data);
    //       let likeList = this.data.likeList;
    //       likeList.push(...res.data);
    //       this.setData({
    //         likeList,
    //       });
    //       if(res.data.length < 20) {
    //         this.setData({
    //           likeAll: true
    //         })
    //       }
    //     })
    //   }
    // }
  },

  loadSongList: debounce(function() {
    if(this.data.currentIndex === 0) {
      // 如果本来显示的数据就小于20 说明没有更多数据了
      if(this.data.historyList.length < 20) {
        return
      }
      if(!this.data.historyAll) {
        wx.showLoading({
          title: '加载中。。。',
          mask: true
        })
        let x = this.data.historyList.length;
        db.collection('history').orderBy('createdTime', 'desc').skip(x).get()
        .then(res => {
          wx.hideLoading();
          console.log(res.data);
          let historyList = this.data.historyList;
          historyList.push(...res.data);
          this.setData({
            historyList,
          });
          if(res.data.length < 20) {
            this.setData({
              historyAll: true
            })
          }
        })
      }
    } else if(this.data.currentIndex === 1) {
      // 如果本来显示的数据就小于20 说明没有更多数据了
      if(this.data.likeList.length < 20) {
        return
      }
      if(!this.data.likeAll) {
        wx.showLoading({
          title: '加载中。。。',
          mask: true
        })
        let x = this.data.likeList.length;
        db.collection('like').orderBy('createdTime', 'desc').skip(x).get()
        .then(res => {
          wx.hideLoading();
          console.log(res.data);
          let likeList = this.data.likeList;
          likeList.push(...res.data);
          this.setData({
            likeList,
          });
          if(res.data.length < 20) {
            this.setData({
              likeAll: true
            })
          }
        })
      }
    }
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
    this.getHistoryList();
    this.getLikeList();
    this.getHistoryListLength();
    this.getLikeListLength();
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