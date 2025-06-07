// pages/index/index.js
/**
 * Index Page: The main entry point of the application.
 * Provides navigation to the camera page for starting measurements and to the history page.
 */
const app = getApp(); // Get the app instance for accessing globalData and methods

Page({
  /**
   * Page initial data.
   * - lang: Object to store localized strings for the page.
   */
  data: {
    lang: {}
  },

  /**
   * Navigates to the camera page.
   * Called when the "Start Measurement" button is tapped.
   */
  goToCamera: function() {
    wx.navigateTo({
      url: '/pages/camera/camera' // Path to the camera page
    });
  },

  /**
   * Navigates to the history page.
   * Called when the "View History" button is tapped.
   */
  goToHistory: function() {
    wx.navigateTo({
      url: '/pages/history/history' // Path to the history page
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
    const navBarTitle = app.globalData.locales.index_title || 'Body Measurement Tool';
    wx.setNavigationBarTitle({
      title: navBarTitle
    });
  },

  /**
   * Handles language switching.
   * Called when a language switch button is tapped.
   * @param {Object} e - The event object, containing the new language code in e.currentTarget.dataset.lang.
   */
  switchLanguage: function(e) {
    const newLang = e.currentTarget.dataset.lang;
    if (newLang && newLang !== app.globalData.language) {
      // console.log('Switching language to:', newLang);
      app.setLanguage(newLang);
      // loadLangData will be called by app.setLanguage via currentPage.loadLangData()
    }
  },

  /**
   * Lifecycle function--Called when page load.
   */
  onLoad: function(options) {
    // console.log('Index Page: onLoad');
  },

  /**
   * Lifecycle function--Called when page is initially rendered.
   */
  onReady: function() {
    // console.log('Index Page: onReady');
  },

  /**
   * Lifecycle function--Called when page show.
   * Loads language data when the page is shown.
   */
  onShow: function() {
    // console.log('Index Page: onShow');
    this.loadLangData(); // Load language data every time the page is shown
  },

  /**
   * Lifecycle function--Called when page hide.
   */
  onHide: function() {
    // console.log('Index Page: onHide');
  },

  /**
   * Lifecycle function--Called when page unload.
   */
  onUnload: function() {
    // console.log('Index Page: onUnload');
  },

  /**
   * Page event handler function--Called when user drop down.
   */
  onPullDownRefresh: function() {
    // console.log('Index Page: onPullDownRefresh');
  },

  /**
   * Called when page reach bottom.
   */
  onReachBottom: function() {
    // console.log('Index Page: onReachBottom');
  },

  /**
   * Called when user click on the top right corner to share.
   */
  onShareAppMessage: function() {
    // console.log('Index Page: onShareAppMessage');
    return {
      title: 'BodyMeasurePro',
      path: '/pages/index/index'
    }
  }
});
