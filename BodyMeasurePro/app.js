// app.js
App({
  // Global lifecycle callbacks can be defined here
  onLaunch: function () {
    // Called when the mini program is launched
    console.log('App Launch');
  },
  onShow: function (options) {
    // Called when the mini program is started or shown from the background
    console.log('App Show');
  },
  onHide: function () {
    // Called when the mini program is switched to the background
    console.log('App Hide');
  },
  onError: function (msg) {
    // Called when a script error occurs or an API call fails
    console.log('App Error:', msg);
  },
  // globalData can be used to store global data, though not used in this simple app
  // globalData: {
  //   userInfo: null
  // }
});
