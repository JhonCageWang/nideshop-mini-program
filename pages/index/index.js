const util = require('../../utils/util.js');
const api = require('../../config/api.js');
const user = require('../../services/user.js');

//获取应用实例
const app = getApp()
Page({
  data: {
    goodsCount: 0,
    newGoods: [],
    hotGoods: [],
    topics: [],
    brands: [],
    floorGoods: [],
    banner: [],
    channel: []
  },
  onShareAppMessage: function () {
    let userInfo = wx.getStorageSync('userInfo')
    return {
      title: '超级卖',
      desc: '低价商品，低价特卖',
      path: '/pages/index/index?shareUserId=' + userInfo.id
    }
  },

  getIndexData: function () {
    let that = this;
    util.request(api.IndexUrl).then(function (res) {
      if (res.code === 0) {
        that.setData({
          newGoods: res.data.newGoodsList,
          hotGoods: res.data.hotGoodsList,
          topics: res.data.topicList,
          brand: res.data.brandList,
          floorGoods: res.data.categoryList,
          banner: res.data.banner,
          channel: res.data.channel
        });
      }
    });
  },
  updateShareUserId: function (shareUserId) {
    util.request(api.ShareUserUpdate, {
      'shareUserId': shareUserId
    }, 'POST').then(function (res) {
      if (res.code === 0) {
        wx.showToast({
          title: '与分享者绑定成功',
        })
      }
    });
  },
  onLoad: function (options) {
    console.info("aaaaa", options)
    let _that = this
    if (options.shareUserId) {
      this.updateShareUserId(options.shareUserId)
    }
    //首先应该登录的

    util.request(api.GoodsCount).then(res => {
      this.setData({
        goodsCount: res.data.goodsCount
      });
    }, (res) => {
      if (res.data.code == 401) {
        _that.onLoad({})
      }
    });
    this.getIndexData()
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {

    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  onPullDownRefresh() {
    this.onLoad({})
    wx.stopPullDownRefresh()
  },
  // 获取滚动条当前位置
  onPageScroll: function (e) {
    if (e.scrollTop > 100) {
      this.setData({
        floorstatus: true
      });
    } else {
      this.setData({
        floorstatus: false
      });
    }
  },

  //回到顶部
  goTop: function (e) { // 一键回到顶部
    if (wx.pageScrollTo) {
      wx.pageScrollTo({
        scrollTop: 0
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  },
})