var app = getApp();
var WxParse = require('../../lib/wxParse/wxParse.js');
var util = require('../../utils/util.js');
var api = require('../../config/api.js');

Page({
  data: {
    id: 0,
    goods: {},
    gallery: [],
    attribute: [],
    issueList: [],
    comment: [],
    brand: {},
    specificationList: [],
    productList: [],
    relatedGoods: [],
    cartGoodsCount: 0,
    userHasCollect: 0,
    number: 1,
    checkedSpecText: '请选择规格数量',
    checkedProductPrice: null,
    openAttr: false,
    justBuy: false,
    noCollectImage: "/static/images/icon_collect.png",
    hasCollectImage: "/static/images/icon_collect_checked.png",
    collectBackImage: "/static/images/icon_collect.png",
    show: false,
    buttons: [{
        type: 'default',
        className: '',
        text: '辅助操作',
        value: 0
      },
      {
        type: 'primary',
        className: '',
        text: '主操作',
        value: 1
      }
    ],
    isCart: false,
    isBuy: false,
    collect: true
  },
  open: function () {
    this.setData({
      show: true
    })
    this.changeSpecInfo()
  },
  buttontap(e) {
    console.log(e.detail)
  },
  halfClose() {
    this.setData({
      show: false,
      isCart: false,
      isBuy: false
    })
  },
  getGoodsInfo: function () {
    let that = this;
    util.request(api.GoodsDetail, {
      id: that.data.id
    }).then(function (res) {
      if (res.code === 0) {

        that.setData({
          goods: res.data.info,
          gallery: res.data.gallery,
          attribute: res.data.attribute,
          issueList: res.data.issue,
          comment: res.data.comment,
          brand: res.data.brand,
          specificationList: res.data.specificationList,
          productList: res.data.productList,
          userHasCollect: res.data.userHasCollect
        });

        if (res.data.userHasCollect == 1) {
          that.setData({
            'collectBackImage': that.data.hasCollectImage,
            'collect': false
          });
        } else {
          that.setData({
            'collectBackImage': that.data.noCollectImage,
            'collect': true
          });
        }

        WxParse.wxParse('goodsDetail', 'html', res.data.info.goodsDesc, that);
        // that.getGoodsRelated();
      }
    });

  },
  getGoodsRelated: function () {
    let that = this;
    util.request(api.GoodsRelated, {
      id: that.data.id
    }).then(function (res) {
      if (res.errno === 0) {
        that.setData({
          relatedGoods: res.data.goodsList,
        });
      }
    });

  },
  clickSkuValue: function (event) {
    let that = this;
    let specNameId = event.currentTarget.dataset.nameId;
    let specValueId = event.currentTarget.dataset.valueId;

    //判断是否可以点击

    //TODO 性能优化，可在wx:for中添加index，可以直接获取点击的属性名和属性值，不用循环
    let _specificationList = this.data.specificationList;
    for (let i = 0; i < _specificationList.length; i++) {
      if (_specificationList[i].specificationId == specNameId) {
        for (let j = 0; j < _specificationList[i].valueList.length; j++) {
          if (_specificationList[i].valueList[j].id == specValueId) {
            //如果已经选中，则反选
            if (_specificationList[i].valueList[j].checked) {
              _specificationList[i].valueList[j].checked = false;
            } else {
              _specificationList[i].valueList[j].checked = true;
            }
          } else {
            _specificationList[i].valueList[j].checked = false;
          }
        }
      }
    }
    this.setData({
      'specificationList': _specificationList
    });
    //重新计算spec改变后的信息
    this.changeSpecInfo();

    //重新计算哪些值不可以点击
  },

  //获取选中的规格信息
  getCheckedSpecValue: function () {
    let checkedValues = [];
    let _specificationList = this.data.specificationList;
    for (let i = 0; i < _specificationList.length; i++) {
      let _checkedObj = {
        nameId: _specificationList[i].specificationId,
        valueId: 0,
        valueText: ''
      };
      for (let j = 0; j < _specificationList[i].valueList.length; j++) {
        if (_specificationList[i].valueList[j].checked) {
          _checkedObj.valueId = _specificationList[i].valueList[j].id;
          _checkedObj.valueText = _specificationList[i].valueList[j].value;
        }
      }
      checkedValues.push(_checkedObj);
    }

    return checkedValues;

  },
  //根据已选的值，计算其它值的状态
  setSpecValueStatus: function () {

  },
  //判断规格是否选择完整
  isCheckedAllSpec: function () {
    return !this.getCheckedSpecValue().some(function (v) {
      if (v.valueId == 0) {
        return true;
      }
    });
  },
  getCheckedSpecKey: function () {
    let checkedValue = this.getCheckedSpecValue().map(function (v) {
      return v.valueId;
    });

    return checkedValue.join('_');
  },
  changeSpecInfo: function () {
    let checkedNameValue = this.getCheckedSpecValue();
    let key = this.getCheckedSpecKey()
    let checkedList = this.getCheckedProductItem(key)
    if (checkedList.length > 0) {
      this.setData({
        checkedProductPrice: checkedList[0].retailPrice,
        productPic: checkedList[0].picUrl,
      })
    }
    //设置选择的信息
    let checkedValue = checkedNameValue.filter(function (v) {
      if (v.valueId != 0) {
        return true;
      } else {
        return false;
      }
    }).map(function (v) {
      return v.valueText;
    });
    if (checkedValue.length > 0) {
      this.setData({
        'checkedSpecText': checkedValue.join('　')
      });
    } else {
      this.setData({
        'checkedSpecText': '请选择规格数量'
      });
    }

  },
  getCheckedProductItem: function (key) {
    return this.data.productList.filter(function (v) {
      if (v.goodsSpecificationIds == key) {
        return true;
      } else {
        return false;
      }
    });
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    this.setData({
      id: parseInt(options.id)
      // id: 1181000
    });
    var that = this;
    this.getGoodsInfo();
    util.request(api.CartGoodsCount).then(function (res) {
      if (res.code === 0) {
        that.setData({
          cartGoodsCount: res.data.goodsCount
        });

      }
    });

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
  switchAttrPop: function () {
    if (this.data.show == false) {
      this.setData({
        show: !this.data.show
      });
    }
  },
  closeAttr: function () {
    this.setData({
      openAttr: false,
    });
  },
  closeJustBuy: function () {
    this.halfClose()
  },
  addCannelCollect: function () {
    let that = this;
    if (this.data.collect) {
      //添加或是取消收藏
      util.request(api.CollectAdd, {
          typeId: 0,
          valueId: this.data.id
        }, "POST")
        .then(function (res) {
          let _res = res;
          if (_res.code == 0) {
            that.setData({
              'collectBackImage': that.data.hasCollectImage,
              'collect': false
            });
            wx.showToast({
              title: '已收藏'
            })
          } else {
            wx.showToast({
              image: '/static/images/icon_error.png',
              title: _res.errmsg,
              mask: true
            });
          }
        });
    } else {
      util.request(api.CollectAddOrDelete, {
          typeId: 0,
          valueId: this.data.id
        }, "POST")
        .then(function (res) {
          let _res = res;
          if (_res.code == 0) {
            that.setData({
              'collectBackImage': that.data.noCollectImage,
              'collect': true
            });
            wx.showToast({
              title: '已取消收藏'
            })
          } else {
            wx.showToast({
              image: '/static/images/icon_error.png',
              title: _res.errmsg,
              mask: true
            });
          }
        });
    }

  },
  openCartPage: function () {
    wx.switchTab({
      url: '/pages/cart/cart',
    });
  },
  addToCart: function () {
    if (this.data.show === false) {
      //打开规格选择窗口
      this.setData({
        show: !this.data.show,
        isCart: true
      });
      this.changeSpecInfo()
    }
  },
  justBuyFunc: function () {
    if (this.data.show === false) {
      //打开规格选择窗口
      this.setData({
        show: !this.data.show,
        isBuy: true,
        isCart: false
      });
      this.changeSpecInfo()
    }
  },
  onShareAppMessage: function () {
    let userInfo = wx.getStorageSync('userInfo')
    return {
      title: '超级卖',
      desc: '低价商品，低价特卖',
      path: '/pages/index/index?shareUserId=' + userInfo.id
    }
  },
  createOrderOrAddCart: function () {
    var that = this;
    //提示选择完整规格
    if (!this.isCheckedAllSpec()) {
      wx.showToast({
        image: '/static/images/icon_error.png',
        title: '请选择规格',
        mask: true
      });
      return false;
    }

    //根据选中的规格，判断是否有对应的sku信息
    let checkedProduct = this.getCheckedProductItem(this.getCheckedSpecKey());
    if (!checkedProduct || checkedProduct.length <= 0) {
      //找不到对应的product信息，提示没有库存
      wx.showToast({
        image: '/static/images/icon_error.png',
        title: '库存不足',
        mask: true
      });
      return false;
    }

    //验证库存
    if (checkedProduct.goodsNumber < this.data.number) {
      //找不到对应的product信息，提示没有库存
      wx.showToast({
        image: '/static/images/icon_error.png',
        title: '库存不足',
        mask: true
      });
      return false;
    }
    debugger
    //购物车
    if (this.data.isCart) {
      //添加到购物车
      util.request(api.CartAdd, {
          goodsId: this.data.goods.id,
          number: this.data.number,
          productId: checkedProduct[0].id
        }, "POST")
        .then(function (res) {
          let _res = res;
          if (_res.code == 0) {
            wx.showToast({
              title: '添加成功'
            });
            that.setData({
              show: !that.data.show
            });
          } else {
            wx.showToast({
              image: '/static/images/icon_error.png',
              title: _res.msg,
              mask: true
            });
          }
          util.request(api.CartGoodsCount).then(function (res) {
            if (res.code === 0) {
              that.setData({
                cartGoodsCount: res.data.goodsCount
              });
            }
          });
        });
    }
    //直接购买
    if (this.data.isBuy) {
      wx.setStorageSync('justBudProductId', checkedProduct[0].id)
      wx.setStorageSync('justBudnumber', this.data.number)
      wx.setStorageSync('isCart', false)
      wx.navigateTo({
        url: '../shopping/checkout/checkout'
      })
    }

  },

  checkoutOrder: function () {
    //获取已选择的商品
    let that = this;

    // var checkedGoods = this.data.cartGoods.filter(function (element, index, array) {
    //   if (element.checked == true) {
    //     return true;
    //   } else {
    //     return false;
    //   }
    // });

    // if (checkedGoods.length <= 0) {
    //   return false;
    // }


    wx.navigateTo({
      url: '../shopping/checkout/checkout'
    })
  },
  cutNumber: function () {
    this.setData({
      number: (this.data.number - 1 > 1) ? this.data.number - 1 : 1
    });
  },
  addNumber: function () {
    this.setData({
      number: this.data.number + 1
    });
  },
  onReady: function () {
    // 页面渲染完成
    this.changeSpecInfo()
  },
})