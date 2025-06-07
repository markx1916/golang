// pages/history/history.js
/**
 * History Page: Displays the list of saved measurements.
 * Allows users to view their past (simulated) measurements and clear the history.
 */
const app = getApp(); // Get the app instance

Page({
  /**
   * Page initial data.
   */
  data: {
    measurementHistory: [], // Stores the list of measurement records
    lang: {}                // For storing localized strings
  },

  /**
   * Lifecycle function--Called when page show.
   */
  onShow: function () {
    this.loadLangData(); // Load language strings first
    const history = wx.getStorageSync('measurementHistory');
    this.setData({
      measurementHistory: history || []
    });
    // console.log('Loaded history:', this.data.measurementHistory);
  },

  /**
   * Clears all measurement history from local storage and updates the UI.
   */
  clearHistory: function() {
    wx.removeStorageSync('measurementHistory');
    this.setData({
      measurementHistory: []
    });

    const toastTitle = (app.globalData.locales && app.globalData.locales.history_cleared_toast)
                       ? app.globalData.locales.history_cleared_toast
                       : 'History cleared';
    wx.showToast({
      title: toastTitle,
      icon: 'success',
      duration: 1500
    });
  },

  /**
   * Loads localized strings into page data.
   * Also updates the navigation bar title.
   */
  loadLangData: function() {
    this.setData({
      lang: app.globalData.locales
    });
    const navBarTitle = (app.globalData.locales && app.globalData.locales.history_nav_title)
                        ? app.globalData.locales.history_nav_title
                        : 'History';
    wx.setNavigationBarTitle({
      title: navBarTitle
    });
  },

  /**
   * Lifecycle function--Called when page load.
   */
  onLoad: function (options) {
    // console.log('History Page: onLoad');
  },

  /**
   * Lifecycle function--Called when page is initially rendered.
   */
  onReady: function () {
    // console.log('History Page: onReady');
  },

  /**
   * Lifecycle function--Called when page hide.
   */
  onHide: function () {
    // console.log('History Page: onHide');
  },

  /**
   * Lifecycle function--Called when page unload.
   */
  onUnload: function () {
    // console.log('History Page: onUnload');
  },

  /**
   * Page event handler function--Called when user drop down.
   */
  onPullDownRefresh: function () {
    // this.onShow();
    // wx.stopPullDownRefresh();
  },

  /**
   * Called when page reach bottom.
   */
  onReachBottom: function () {
    // console.log('History Page: onReachBottom');
  },

  /**
   * Called when user click on the top right corner to share.
   */
  onShareAppMessage: function () {
    const appName = (app.globalData.locales && app.globalData.locales.appName)
                    ? app.globalData.locales.appName
                    : 'BodyMeasurePro';
    const pageTitle = (app.globalData.locales && app.globalData.locales.history_nav_title)
                      ? app.globalData.locales.history_nav_title
                      : 'History';
    return {
      title: `${pageTitle} - ${appName}`,
      path: '/pages/history/history'
    }
  }
})
