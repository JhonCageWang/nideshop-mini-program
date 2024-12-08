var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
var app = getApp();
const chooseLocation = requirePlugin('chooseLocation');
Page({
  data: {
    address: {
      id: 0,
      provinceId: 0,
      city_id: 0,
      districtId: 0,
      address: '',
      fullRegion: '',
      name: '',
      mobile: '',
      isDefault: 0
    },
    addressId: 0,
    openSelectRegion: false,
    selectRegionList: [{
        id: 0,
        name: '省份',
        parent_id: 1,
        type: 1
      },
      {
        id: 0,
        name: '城市',
        parent_id: 1,
        type: 2
      },
      {
        id: 0,
        name: '区县',
        parent_id: 1,
        type: 3
      }
    ],
    regionType: 1,
    regionList: [],
    selectRegionDone: false
  },
  choseLocation() {
    var _that = this;
    const category = '';
    const key = 'MWDBZ-YKU67-LFDXN-P2ZE6-LHOYK-OJFRO'; //使用在腾讯位置服务申请的key
    const referer = '王胖胖的小卖部'; //调用插件的app的名称
    const location = JSON.stringify({
      latitude: 39.89631551,
      longitude: 116.323459711
    });
    const hotCitys = ''; // 用户自定义的的热门城市
    // wx.navigateTo({
    //   url: 'plugin://chooseLocation/index?key=' + key + '&referer=' + referer + '&location=' + location + '&category=' + category
    // });
    // wx.navigateTo({
    //   url: `plugin://citySelector/index?key=${key}&referer=${referer}&hotCitys=${hotCitys}`,
    // })
    wx.choosePoi({
      "success": function name(params) {
        console.log("add" + JSON.stringify(params));
        var sn = params.address+params.name;
        if (params.type == 1) {
          wx.showToast({
            title: '请选择详细地址',
            icon: "none"
          })
          return;
        }
        var url = `https://apis.map.qq.com/ws/geocoder/v1/?address=${encodeURIComponent(params.address)}&key=${key}`
        wx.request({
          url: url,
          method: 'GET',
          success: function (res) {
            if (res.data.status === 0) {
              const result = res.data.result;
              const title = result.title;
              const province = result.address_components.province; // 省
              const city = result.address_components.city; // 市
              const district = result.address_components.district; // 区
              const adcode = result.address_components.adcode; // 地区编码
              debugger
              var idx = sn.indexOf(district);
              const startIndex = idx + district.length;
              const rst = sn.substring(startIndex); 
              if (province && city && district) {
                util.request(api.RegionGetCode, {
                  'province': province,
                  "city": city,
                  "district": district
                }).then(function (res) {
                  let address = _that.data.address;
                  address.provinceId = res.data.provinceCode;
                  address.cityId = res.data.cityCode;
                  address.districtId = res.data.districtCode;
                  address.address = rst;
                  address.fullRegion = province+city+district
                  _that.setData({
                    address: address
                  });
                })
              } else {
                wx.showToast({
                  title: '地址不够完整，请手动输入',
                  icon: "none"
                })
                return;
              }
            } else {
              console.error("未找到相关地址信息");
              wx.showToast({
                title: '地址解析失败，请手动输入',
                icon: "none"
              })
              return;
            }
          },
          fail: function () {
            console.error("请求失败");
          }
        });
      }
    })
    // wx.getLocation({
    //   type: 'wgs84',
    //   success(res) {
    //     debugger
    //     const latitude = res.latitude
    //     const longitude = res.longitude
    //     const speed = res.speed
    //     const accuracy = res.accuracy
    //     const key = 'MWDBZ-YKU67-LFDXN-P2ZE6-LHOYK-OJFRO'; //使用在腾讯位置服务申请的key
    //     const referer = '王胖胖的小卖部'; //调用插件的app的名称
    //     const location = JSON.stringify({
    //       latitude: latitude,
    //       longitude: longitude
    //     });
    //     const category = '生活服务,娱乐休闲';
    //     wx.navigateTo({
    //       url: 'plugin://chooseLocation/index?key=' + key + '&referer=' + referer + '&location=' + location + '&category=' + category
    //     });
    //   }
    // })

  },
  getrealtimephonenumber(e) {
    var _this = this;
    console.log(e.detail.code) // 动态令牌
    console.log(e.detail.errMsg) // 回调信息（成功失败都会返回）
    console.log(e.detail.errno)
    if (e.detail.errMsg == 'getPhoneNumber:ok') {
      util.request(api.Mobile, {
          "code": e.detail.code
        })
        .then(function (res) {
          let address = _this.data.address;
          address.mobile = res.data;
          _this.setData({
            address: address
          })
        }) // 错误码（失败时返回）
    } else {
      wx.showToast({
        image: '/static/images/icon_error.png',
        title: '获取手机号失败',
      })
    }

  },
  bindinputMobile(event) {
    let address = this.data.address;
    address.mobile = event.detail.value;
    this.setData({
      address: address
    });
  },
  bindinputName(event) {
    let address = this.data.address;
    address.name = event.detail.value;
    this.setData({
      address: address
    });
  },
  bindinputAddress(event) {
    let address = this.data.address;
    address.address = event.detail.value;
    this.setData({
      address: address
    });
  },
  bindIsDefault() {
    let address = this.data.address;
    address.isDefault = !address.isDefault;
    this.setData({
      address: address
    });
  },
  getAddressDetail() {
    let that = this;
    util.request(api.AddressDetail, {
      id: that.data.addressId
    }).then(function (res) {
      if (res.code === 0) {
        that.setData({
          address: res.data
        });
      }
    });
  },
  setRegionDoneStatus() {
    let that = this;
    let doneStatus = that.data.selectRegionList.every(item => {
      return item.id != 0;
    });

    that.setData({
      selectRegionDone: doneStatus
    })

  },
  chooseRegion() {
    let that = this;
    this.setData({
      openSelectRegion: !this.data.openSelectRegion
    });

    //设置区域选择数据
    let address = this.data.address;
    if (address.provinceId > 0 && address.cityId > 0 && address.districtId > 0) {
      let selectRegionList = this.data.selectRegionList;
      selectRegionList[0].id = address.provinceId;
      selectRegionList[0].name = address.provinceName;
      selectRegionList[0].parent_id = 1;

      selectRegionList[1].id = address.cityId;
      selectRegionList[1].name = address.cityName;
      selectRegionList[1].parent_id = address.provinceId;

      selectRegionList[2].id = address.districtId;
      selectRegionList[2].name = address.districtName;
      selectRegionList[2].parent_id = address.cityId;

      this.setData({
        selectRegionList: selectRegionList,
        regionType: 3
      });

      this.getRegionList(address.cityId);
    } else {
      this.setData({
        selectRegionList: [{
            id: 0,
            name: '省份',
            parent_id: 1,
            type: 1
          },
          {
            id: 0,
            name: '城市',
            parent_id: 1,
            type: 2
          },
          {
            id: 0,
            name: '区县',
            parent_id: 1,
            type: 3
          }
        ],
        regionType: 1
      })
      this.getRegionList(1);
    }

    this.setRegionDoneStatus();

  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    console.log(options)
    if (options.id) {
      this.setData({
        addressId: options.id
      });
      this.getAddressDetail();
    }

    this.getRegionList(1);

  },
  onReady: function () {

  },
  selectRegionType(event) {
    let that = this;
    let regionTypeIndex = event.target.dataset.regionTypeIndex;
    let selectRegionList = that.data.selectRegionList;

    //判断是否可点击
    if (regionTypeIndex + 1 == this.data.regionType || (regionTypeIndex - 1 >= 0 && selectRegionList[regionTypeIndex - 1].id <= 0)) {
      return false;
    }

    this.setData({
      regionType: regionTypeIndex + 1
    })

    let selectRegionItem = selectRegionList[regionTypeIndex];

    this.getRegionList(selectRegionItem.parent_id);

    this.setRegionDoneStatus();

  },
  selectRegion(event) {
    let that = this;
    let regionIndex = event.target.dataset.regionIndex;
    let regionItem = this.data.regionList[regionIndex];
    let regionType = regionItem.type;
    let selectRegionList = this.data.selectRegionList;
    selectRegionList[regionType - 1] = regionItem;


    if (regionType != 3) {
      this.setData({
        selectRegionList: selectRegionList,
        regionType: regionType + 1
      })
      this.getRegionList(regionItem.id);
    } else {
      this.setData({
        selectRegionList: selectRegionList
      })
    }

    //重置下级区域为空
    selectRegionList.map((item, index) => {
      if (index > regionType - 1) {
        item.id = 0;
        item.name = index == 1 ? '城市' : '区县';
        item.parent_id = 0;
      }
      return item;
    });

    this.setData({
      selectRegionList: selectRegionList
    })


    that.setData({
      regionList: that.data.regionList.map(item => {

        //标记已选择的
        if (that.data.regionType == item.type && that.data.selectRegionList[that.data.regionType - 1].id == item.id) {
          item.selected = true;
        } else {
          item.selected = false;
        }

        return item;
      })
    });

    this.setRegionDoneStatus();

  },
  doneSelectRegion() {
    if (this.data.selectRegionDone === false) {
      return false;
    }

    let address = this.data.address;
    let selectRegionList = this.data.selectRegionList;
    address.provinceId = selectRegionList[0].id;
    address.cityId = selectRegionList[1].id;
    address.districtId = selectRegionList[2].id;
    address.provinceName = selectRegionList[0].name;
    address.cityName = selectRegionList[1].name;
    address.districtName = selectRegionList[2].name;
    address.fullRegion = selectRegionList.map(item => {
      return item.name;
    }).join('');

    this.setData({
      address: address,
      openSelectRegion: false
    });

  },
  cancelSelectRegion() {
    this.setData({
      openSelectRegion: false,
      regionType: this.data.regionDoneStatus ? 3 : 1
    });

  },
  getRegionList(regionId) {
    let that = this;
    let regionType = that.data.regionType;
    util.request(api.RegionList, {
      parentId: regionId
    }).then(function (res) {
      if (res.code === 0) {
        that.setData({
          regionList: res.data.map(item => {

            //标记已选择的
            if (regionType == item.type && that.data.selectRegionList[regionType - 1].id == item.id) {
              item.selected = true;
            } else {
              item.selected = false;
            }
            return item;
          })
        });
      }
    });
  },
  cancelAddress() {
    wx.navigateBack()
  },
  saveAddress() {
    console.log(this.data.address)
    let address = this.data.address;

    if (address.name == '') {
      util.showErrorToast('请输入姓名');

      return false;
    }

    if (address.mobile == '') {
      util.showErrorToast('请输入手机号码');
      return false;
    }


    if (address.districtId == 0) {
      util.showErrorToast('请输入省市区');
      return false;
    }

    if (address.address == '') {
      util.showErrorToast('请输入详细地址');
      return false;
    }


    let that = this;
    util.request(api.AddressSave, {
      id: address.id,
      name: address.name,
      mobile: address.mobile,
      provinceId: address.provinceId,
      cityId: address.cityId,
      districtId: address.districtId,
      address: address.address,
      isDefault: address.isDefault ? 1 : 0,
    }, 'POST').then(function (res) {
      if (res.code === 0) {
        wx.navigateBack()
      }
    });

  },
  onShow: function () {
    // 页面显示
    const location = chooseLocation.getLocation();
    if (location) {

    }
  },
  onHide: function () {
    // 页面隐藏

  },
  onUnload: function () {
    // 页面关闭
    chooseLocation.setLocation(null);
  }
})