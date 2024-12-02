var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
const pay = require('../../../services/pay.js');

var app = getApp();

Page({
  data: {
    checkedGoodsList: [],
    checkedAddress: {},
    checkedCoupon: {},
    couponList: [],
    goodsTotalPrice: 0.00, //商品总价
    freightPrice: 0.00, //快递费
    couponPrice: 0.00, //优惠券的价格
    orderTotalPrice: 0.00, //订单总价
    actualPrice: 0.00, //实际需要支付的总价
    addressId: 0,
    couponId: 0,
    productId: null,
    number: 1,
    isCart: true
  },
  onLoad: function (options) {

    // 页面初始化 options为页面跳转所带来的参数

    try {
      var isCart = wx.getStorageSync('isCart');
      this.setData({
        'isCart': isCart
      });
      var addressId = wx.getStorageSync('addressId');
      if (addressId) {
        this.setData({
          'addressId': addressId
        });
      }

      var couponId = wx.getStorageSync('userCouponId');
      if (couponId) {
        this.setData({
          'couponId': couponId
        });
      }
      var productId = wx.getStorageSync('justBudProductId');
      if (!isCart && productId) {
        this.setData({
          'productId': productId
        });
      }
      var number = wx.getStorageSync('justBudnumber');
      if (number) {
        this.setData({
          'number': number
        });
      }
    } catch (e) {
      // Do something when catch error
    }


  },
  getCheckoutInfo: function () {
    let that = this;
    util.request(api.CartCheckout, {
      addressId: that.data.addressId,
      couponId: that.data.couponId,
      productId: that.data.productId || '',
      number: that.data.number,

    }).then(function (res) {
      if (res.code === 0) {
        console.log(res.data);
        that.setData({
          checkedGoodsList: res.data.checkedGoodsList,
          checkedAddress: res.data.checkedAddress,
          actualPrice: res.data.actualPrice,
          checkedCoupon: res.data.checkedCoupon,
          couponCount: res.data.couponCount,
          couponPrice: res.data.couponPrice,
          freightPrice: res.data.freightPrice,
          goodsTotalPrice: res.data.goodsTotalPrice,
          orderTotalPrice: res.data.orderTotalPrice,
          addressId: res.data.checkedAddress ? res.data.checkedAddress.id : 0,
          couponId: res.data.checkedCoupon ? res.data.checkedCoupon.userCouponId : 0
        });
      }
      wx.hideLoading();
    });
  },
  selectAddress() {
    wx.navigateTo({
      url: '/pages/shopping/address/address',
    })
  },
  selectCoupon() {
    wx.navigateTo({
      url: '/pages/shopping/coupon/coupon',
    })
  },
  addAddress() {
    wx.navigateTo({
      url: '/pages/shopping/addressAdd/addressAdd',
    })
  },
  onReady: function () {
    // 页面渲染完成

  },
  onShow: function () {
    // 页面显示
    wx.showLoading({
      title: '加载中...',
    })
    var isCart = wx.getStorageSync('isCart');
    this.setData({
      'isCart': isCart
    });
    var addressId = wx.getStorageSync('addressId');
    if (addressId) {
      this.setData({
        'addressId': addressId
      });
    }

    var couponId = wx.getStorageSync('userCouponId');
    if (couponId) {
      this.setData({
        'couponId': couponId
      });
    }
    var productId = wx.getStorageSync('justBudProductId');
    if (!isCart && productId) {
      this.setData({
        'productId': productId
      });
    }
    var number = wx.getStorageSync('justBudnumber');
    if (number) {
      this.setData({
        'number': number
      });
    }
    this.getCheckoutInfo();

  },
  onHide: function () {
    // 页面隐藏

  },
  onUnload: function () {
    // 页面关闭

  },
  submitOrder: function () {
    wx.getSetting({
      withSubscriptions: true,
      success(res) {
        console.log(res.authSetting)
        console.log(res.subscriptionsSetting)
        // res.authSetting = {
        //   "scope.userInfo": true,
        //   "scope.userLocation": true
        // }
      }
    })
    if (this.data.addressId <= 0) {
      util.showErrorToast('请选择收货地址');
      return false;
    }
    let that = this;
    util.request(api.OrderSubmit, {
      addressId: that.data.addressId,
      couponId: that.data.couponId,
      checkoutGoodsList: that.data.checkedGoodsList,
      isCart: that.data.isCart

    }, 'POST').then(res => {
      if (res.code === 0) {
        const orderId = res.data.id;
        pay.payOrder(parseInt(orderId)).then(res => {
          // 获取用户的当前设置，判断是否点击了“总是保持以上，不在询问”
          wx.getSetting({
            withSubscriptions: true, // 是否获取用户订阅消息的订阅状态，默认false不返回
            success(res) {
              console.log('res.authSetting', res.authSetting)
              if (res.authSetting['scope.subscribeMessage']) {
                console.log('用户点击了“总是保持以上，不再询问”')
              } else {
                console.log('用户没有点击“总是保持以上，不再询问”则每次都会调起订阅消息')
                //因为没有选择总是保持，所以需要调起授权弹窗再次授权
                wx.requestSubscribeMessage({
                  tmplIds: ['T7YuHvuNl8W8PctDtyODgW2RkyAM2-ZKVyN_cOgf9ng', 'y3BlFEBKGY36TXFVw7ziDEW-J860L8Nag9KaSk57Y6s'],
                  success(res) {
                    wx.setStorageSync('orderInfo', {
                      'id': orderId,
                      'status': true
                    })
                    wx.redirectTo({
                      url: '/pages/payResult/payResult?status=1&orderId=' + orderId
                    });
                  }
                })
              }

            }
          })

        }).catch(res => {
          wx.setStorageSync('orderInfo', {
            'id': orderId,
            'status': false
          })
          wx.redirectTo({
            url: '/pages/payResult/payResult?status=0&orderId=' + orderId
          });

        });
      } else {
        util.showErrorToast('下单失败');
      }
    });
  }
})