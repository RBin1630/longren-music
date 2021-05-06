import networkConfig from './networkConfig';

// 封装一下网络请求
export function request(type, url, data={}, method='GET') {
  return new Promise((resolve, reject) => {
    if(type === 'wy') {
      wx.request({
        // url: networkConfig.baseUrl + url,
        // url: networkConfig.mobileUrl + url,
        url: networkConfig.vercelUrl + url,
        data,
        method,
        header: {
          cookie: wx.getStorageSync('cookies')?wx.getStorageSync('cookies').find(item => item.indexOf('MUSIC_U') !== -1):''
        },
        success(res) {
          // wx.setStorageSync('cookies', res.cookies);
          resolve(res.data);
        },
        fail(err) {
          reject(err);
        }
      })
    } else if (type === 'qq') {
      wx.request({
        // url: networkConfig.baseUrl + url,
        // url: networkConfig.mobileUrl + url,
        url: networkConfig.baseUrl + url,
        data,
        method,
        success(res) {
          resolve(res.data);
        },
        fail(err) {
          reject(err);
        }
      })
    }
  })
}