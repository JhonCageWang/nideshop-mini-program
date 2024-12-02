var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');



var app = getApp();

Page({
  data: {
    couponList: [],
    yhCode:''
  },
  onLoad: function (options) {
    let that = this;
    util.request(api.CouponsList).then(function (res) {
      if (res.code === 0) {
        console.log(res.data);
        that.setData({
          couponList: res.data,
        });

      }
    });
  },
  onReady: function () {

  },
  onShow: function () {

  },
  onHide: function () {
    // 页面隐藏

  },
  onUnload: function () {
    // 页面关闭
  },
  selectCoupon: function (e) {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  clearInput: function (e) {
    debugger
    this.setData({
      yhCode: ''
    })
  },
  dealCouponCode: function () {
    wx.showModal({
      title: '暂未开通，敬请期待',
      content: '暂未开通，敬请期待',
      complete: (res) => {
        if (res.cancel) {

        }

        if (res.confirm) {

        }
      }
    })
  }
})