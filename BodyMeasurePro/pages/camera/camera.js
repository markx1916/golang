// pages/camera/camera.js
/**
 * Camera Page: Handles camera interaction for capturing images.
 * Users can take a photo which is then passed to the measure page.
 */
const app = getApp(); // Get the app instance

Page({
  /**
   * Page initial data.
   */
  data: {
    src: "", // This was for local image preview, now unused as image is passed to measure page.
    devicePosition: 'back', // 'front' or 'back'
    lang: {} // For storing localized strings
  },

  /**
   * Switches between the front and back camera.
   */
  switchCamera() {
    this.setData({
      devicePosition: this.data.devicePosition === 'back' ? 'front' : 'back'
    });
    // console.log('Switched camera to:', this.data.devicePosition);
  },

  /**
   * Lifecycle function--Called when page load.
   * Initializes the camera context.
   */
  onLoad: function (options) {
    // Create a camera context to control the <camera> component.
    this.ctx = wx.createCameraContext();
    // console.log('Camera Page: onLoad');
  },

  /**
   * Captures a photo using the camera.
   * On success, navigates to the 'measure' page, passing the temporary image path.
   * On failure, shows a toast message.
   */
  takePhoto() {
    this.ctx.takePhoto({
      quality: 'high', // Capture high-quality photos
      success: (res) => {
        // console.log('Photo captured:', res.tempImagePath);
        // Navigate to the measure page, passing the captured image's temporary path as a query parameter.
        wx.navigateTo({
          url: '/pages/measure/measure?imagePath=' + res.tempImagePath
        });
      },
      fail: (err) => {
        console.error('Photo capture failed:', err);
        wx.showToast({
          title: app.globalData.locales.camera_capture_failed_toast || 'Capture Failed',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  /**
   * Handles errors from the <camera> component.
   * @param {Object} e - The error event object from the camera component.
   */
  error(e) {
    console.error('Camera error:', e.detail);
    wx.showToast({
      title: app.globalData.locales.camera_error_toast || 'Camera Error',
      icon: 'none',
      duration: 2000
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
    const navBarTitle = app.globalData.locales.camera_nav_title || 'Camera';
    wx.setNavigationBarTitle({
      title: navBarTitle
    });
  },

  /**
   * Lifecycle function--Called when page is initially rendered.
   */
  onReady: function () {
    // console.log('Camera Page: onReady');
  },

  /**
   * Lifecycle function--Called when page show.
   * Loads language data when the page is shown.
   */
  onShow: function () {
    // console.log('Camera Page: onShow');
    this.loadLangData();
  },

  /**
   * Lifecycle function--Called when page hide.
   */
  onHide: function () {
    // console.log('Camera Page: onHide');
  },

  /**
   * Lifecycle function--Called when page unload.
   */
  onUnload: function () {
    // console.log('Camera Page: onUnload');
  },

  /**
   * Page event handler function--Called when user drop down.
   */
  onPullDownRefresh: function () {
    // console.log('Camera Page: onPullDownRefresh');
  },

  /**
   * Called when page reach bottom.
   */
  onReachBottom: function () {
    // console.log('Camera Page: onReachBottom');
  },

  /**
   * Called when user click on the top right corner to share.
   */
  onShareAppMessage: function () {
    // console.log('Camera Page: onShareAppMessage');
    // Use localized appName if available for the shared message title
    const appName = app.globalData.locales.appName || 'BodyMeasurePro';
    return {
      title: `${app.globalData.locales.camera_nav_title || 'Camera'} - ${appName}`,
      path: '/pages/camera/camera'
    }
  }
})
