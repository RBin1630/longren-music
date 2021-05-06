import {
  request
} from '../../network/request';
import moment from 'moment'
// miniprogram/pages/player/player.js
const app = getApp().globalData;
const BackgroundAudioManager = wx.getBackgroundAudioManager();
const db = wx.cloud.database();
Page({
  data: {
    // 记录歌曲是否正在播放
    isPlay: false,
    // 记录歌曲url
    songUrl: '',
    // 记录歌曲其他信息
    songInfo: {},
    // 记录歌曲的总时长
    durationTime: '00:00',
    // 记录歌曲的实时进度
    currentTime: '00:00',
    // 记录滑块的实时位置
    sliderValue: 0,
    // 记录歌单数据
    playListData: [],

    // 是否为喜欢歌曲
    like: false,
    // 播放列表中正在播放的歌曲索引值
    currentIndex: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 判断当前歌曲是否为喜欢歌曲
    db.collection('like').get().then(res => {
      let like = res.data.some(item => {
        return app.songId === item.songInfo.id;
      });
      this.setData({
        like
      })
    });
    // 拿到歌单列表用于渲染
    // 获得当前歌曲在列表中的index
    let index = app.playListData.findIndex(item => {
      return item.id == app.songId
    });
    this.setData({
      playListData: app.playListData,
      currentIndex: index
    })
    console.log('当前歌曲ID为：' + app.songId);
    if (app.songId !== app.currentSongId) {
      // 拿到歌曲的id 就能通过/song/url?id=33894312    /song/detail?ids=347230,347231    获取到歌曲的url和其他数据
      request('wy', '/song/detail', {
        ids: app.songId
      }).then(res => {
        console.log('当前歌曲信息：', res.songs[0]);
        app.songInfo = res.songs[0];
        this.setData({
          songInfo: res.songs[0]
        });
        // 获取到数据后 在请求url 请求到url后才去创建背景音乐实例 要有数据才能创建背景音乐实例
        this.getUrl(app.songId);
      }).catch(err => {
        console.log(err);
      })
    } else {
      // 还是原来的歌曲 不请求数据 使用全局保存好的数据
      app.isPlay = true;
      this.setData({
        songInfo: app.songInfo,
        isPlay: app.isPlay,
        durationTime: app.durationTime
      });
      if (app.isPlay) {
        BackgroundAudioManager.play();
      } else {
        BackgroundAudioManager.pause();
      }
      // 设置标题为歌曲名
      wx.setNavigationBarTitle({
        title: this.data.songInfo.name,
      });
      this.timeUpdate();
    }

    // 获取歌单列表数据
    // console.log('当前歌曲的歌单ID为：' + app.playListId);
    // if (app.currentPlayListId !== app.playListId) {
    //   request('wy', '/playlist/detail', {
    //     id: app.playListId
    //   }).then(res => {
    //     console.log('请求的歌单数据为：', res);
    //     app.playListData = res.playlist.tracks;
    //     this.setData({
    //       playListData: app.playListData
    //     })
    //   }).catch(err => {
    //     console.log(err);
    //   })
    // } else {
    //   this.setData({
    //     playListData: app.playListData
    //   })
    // }
  },

  // 获取音乐的URL
  getUrl(id) {
    db.collection('like').get().then(res => {
      let like = res.data.some(item => {
        return app.songId === item.songInfo.id;
      });
      this.setData({
        like
      })
    })
    BackgroundAudioManager.seek(0);
    BackgroundAudioManager.pause();
    // 设置标题为歌曲名
    wx.setNavigationBarTitle({
      title: this.data.songInfo.name,
    });
    request('wy', '/song/url', {
      id
    }).then(res => {
      console.log('当前歌曲url：', res.data[0].url);
      this.setData({
        songUrl: res.data[0].url
      })
      if (!res.data[0].url) {
        wx.showToast({
          title: '本歌曲暂时不能播放。请切换下一首',
          icon: 'none',
          duration: 2000,
          complete: () => {
            setTimeout(() => {
              this.onNext();
            }, 2000);
          }
        });
      } else {
        this.createBackGroundAudio(res.data[0].url);
        // 当歌曲存在url 调用add云函数 把歌曲添加到云数据库中
        wx.cloud.callFunction({
            // 云函数名称
            name: 'add',
            // 传给云函数的参数
            data: {
              collectionName: 'history',
              songInfo: this.data.songInfo,
            },
          })
          .then(res => {
            console.log('添加或更新数据成功');
          })
          .catch(console.error)
      }
    }).catch(err => {
      console.log(err);
    });

    // 监听系统的播放暂停事件
    BackgroundAudioManager.onPause(() => {
      app.isPlay = false;
      this.setData({
        isPlay: app.isPlay
      })
    })
    BackgroundAudioManager.onPlay(() => {
      app.isPlay = true;
      this.setData({
        isPlay: app.isPlay
      })
    })
    BackgroundAudioManager.onEnded(() => {
      console.log('背景音乐自然播放结束了~');
      this.onNext();
    })
  },
  // 跳到下一首 用于歌曲无资源 和 歌曲自然播放结束
  onNext() {
    let index = app.playListData.findIndex(item => {
      return item.id == app.songId
    });
    this.setData({
      currentIndex: index+1
    })
    if (index + 1 > app.playListData.length - 1) {
      wx.showToast({
        title: '当前为最后一首歌曲',
        icon: 'none',
        duration: 1500
      });
      app.isPlay = false;
      this.setData({
        isPlay: app.isPlay
      })
    } else {
      let nextSongInfo = app.playListData[index + 1];
      app.songInfo = nextSongInfo;
      app.songId = nextSongInfo.id;
      this.setData({
        songInfo: nextSongInfo
      });
      this.getUrl(app.songInfo.id);
      console.log('当前歌曲id为：', app.songInfo.id);
    }
  },

  // 创建背景音乐实例的方法 在获取到url时调用
  createBackGroundAudio(playUrl) {
    BackgroundAudioManager.src = playUrl;
    BackgroundAudioManager.title = this.data.songInfo.name;
    BackgroundAudioManager.singer = this.data.songInfo.ar[0].name;
    BackgroundAudioManager.epname = this.data.songInfo.al.name;
    BackgroundAudioManager.coverImgUrl = this.data.songInfo.al.picUrl;
    BackgroundAudioManager.onCanplay(() => {
      let durationTime = moment(this.data.songInfo.dt).format('mm:ss');
      app.durationTime = durationTime;
      app.isPlay = true;
      this.setData({
        isPlay: app.isPlay,
        durationTime
      });

    });
    this.timeUpdate();
  },
  // 歌曲时间更新的方法
  timeUpdate() {
    BackgroundAudioManager.onTimeUpdate(() => {
      // 格式化progress中的value
      let sliderValue = BackgroundAudioManager.currentTime / BackgroundAudioManager.duration * 100
      // 格式化当前播放进度
      let currentTime = moment(BackgroundAudioManager.currentTime * 1000).format('mm:ss');
      this.setData({
        currentTime,
        sliderValue
      })

    })
  },

  // 处理点击播放的方法
  handlePlay() {
    // 如果url为空 禁用播放按钮
    if (this.data.songUrl === null) {
      wx.showToast({
        title: '本歌曲暂时不能播放。请切换下一首',
        icon: 'none'
      })
      return;
    } else {
      BackgroundAudioManager.src = this.data.songUrl;
      BackgroundAudioManager.title = app.songInfo.name;
    }
    // 每次点击就让isPlay取反
    app.isPlay = !this.data.isPlay;
    this.setData({
      isPlay: app.isPlay
    });
    if (app.isPlay) {
      BackgroundAudioManager.play();
    } else {
      BackgroundAudioManager.pause();
    }
  },

  // 处理进度条拖动的方法
  handleProgress(e) {
    // 如果url为空 禁用进度条拖放功能
    if (this.data.songUrl === null) {
      wx.showToast({
        title: '本歌曲暂时不能播放。请切换下一首',
        icon: 'none'
      })
      return;
    }
    // 拿到拖动位置的value值
    let sliderValue = e.detail.value;
    // 现在需要根据拿到的sliderValue求得歌曲的最新位置
    // console.log(this.BgAM.duration); 确认单位
    let currentTime = sliderValue / 100 * BackgroundAudioManager.duration;
    console.log('拖动的位置为歌曲的第' + currentTime + '秒');
    BackgroundAudioManager.seek(currentTime);
    // 若歌曲为暂停状态拖动的话
    app.isPlay = true;
    this.setData({
      isPlay: app.isPlay
    });
    BackgroundAudioManager.play();
  },

  // 点击上一首 下一首 触发的方法
  handleSwitch(e) {
    let switchType = e.currentTarget.id;
    // 获得当前歌曲在列表中的index
    let index = app.playListData.findIndex(item => {
      return item.id == app.songId
    });
    // 暂停歌曲 并初始化
    BackgroundAudioManager.pause();
    app.isPlay = false;
    this.setData({
      isPlay: app.isPlay,
    })
    console.log('初始化');
    // 点了上一首
    if (switchType === 'pre') {
      if (index - 1 < 0) {
        wx.showToast({
          title: '当前为第一首歌曲',
          icon: 'none',
          duration: 1500
        });
      } else {
        let preSongInfo = app.playListData[index - 1];
        console.log(preSongInfo);
        app.songInfo = preSongInfo;
        app.songId = preSongInfo.id;
        this.setData({
          songInfo: preSongInfo
        });
        this.getUrl(app.songInfo.id);
        this.setData({
          currentIndex: index-1
        })
      }
    } else { // 点了下一首
      if (index + 1 > app.playListData.length - 1) {
        wx.showToast({
          title: '当前为最后一首歌曲',
          icon: 'none',
          duration: 1500
        });
      } else {
        let nextSongInfo = app.playListData[index + 1];
        console.log(nextSongInfo);
        app.songInfo = nextSongInfo;
        app.songId = nextSongInfo.id;
        this.setData({
          songInfo: nextSongInfo
        });
        this.getUrl(app.songInfo.id);
        this.setData({
          currentIndex: index+1
        })
      }
    }
  },

  // 点击爱心触发的回调
  handleLike() {
    if(this.data.like === false) {
      this.setData({
        like: true
      })
      // 点击爱心后需要把当前歌曲数据添加到like表中
      wx.cloud.callFunction({
        name: 'addLike',
        data: {
          collectionName: 'like',
          songInfo: this.data.songInfo,
        },
      })
      .then(res => {
        console.log(res);
      })
      .catch(console.error)
    } else {
      // 当前歌曲为喜欢 再次点击取消喜欢
      this.setData({
        like: false
      })
      wx.cloud.callFunction({
        name: 'delete',
        data: {
          collectionName: 'like',
          songId: app.songId
        }
      }).then(res => {
        console.log(res);
      }).catch(console.error)
    }
    
  },

  // 打开列表
  openList: function () {
    if (!this.data.playListData.length) {
      return
    }
    this.setData({
      translateCls: 'uptranslate'
    })
  },
  // 关闭列表
  close: function () {
    this.setData({
      translateCls: 'downtranslate'
    })
  },

  // 点击列表的歌曲item
  playthis(e) {
    console.log(e.currentTarget.dataset);
    app.songInfo = e.currentTarget.dataset.item
    this.setData({
      currentIndex: e.currentTarget.dataset.index,
      songInfo: e.currentTarget.dataset.item
    })
    this.getUrl(e.currentTarget.dataset.item.id);
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
    // app.currentPlayListId = app.playListId;
    app.currentSongId = app.songId;
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