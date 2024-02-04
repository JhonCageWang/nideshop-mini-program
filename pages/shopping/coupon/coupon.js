var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');



var app = getApp();

Page({
  data: {
    couponList: []
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
    console.info("数据", e.currentTarget.dataset.userCouponId)
    wx.setStorageSync('userCouponId', e.currentTarget.dataset.userCouponId)
    wx.navigateBack()
  }
})