// app.js

// Directly define locale strings for simplicity in the worker environment
const enStrings = {
  "appName": "BodyMeasurePro",
  "index_title": "Body Measurement Tool",
  "index_start_measurement_btn": "Start Measurement",
  "index_view_history_btn": "View History",
  "index_switch_to_chinese_btn": "中文",
  "index_switch_to_english_btn": "English",

  "camera_nav_title": "Camera",
  "camera_capture_btn": "Capture",
  "camera_switch_camera_btn": "Switch Camera",
  "camera_helper_text": "Align yourself in the frame and tap capture.",
  "camera_positioning_title": "Tips for Positioning:",
  "camera_positioning_tip1": "- Stand straight, facing the camera directly.",
  "camera_positioning_tip2": "- Ensure your body from head to mid-thigh is visible in the frame.",
  "camera_positioning_tip3": "- Keep arms slightly away from your body.",
  "camera_error_toast": "Camera Error",
  "camera_capture_failed_toast": "Capture Failed",
  "camera_guide_neck": "Neck",
  "camera_guide_chest": "Chest",
  "camera_guide_waist": "Waist",
  "camera_guide_hip": "Hip",

  "measure_nav_title": "Simulated Measurement",
  "measure_chest_btn": "Measure Chest",
  "measure_waist_btn": "Measure Waist",
  "measure_hip_btn": "Measure Hip",
  "measure_neck_btn": "Measure Neck",
  "measure_options_title": "Measurement Options",
  "measure_result_title": "Result",
  "measure_simulated_value_suffix": "(Simulated)",
  "measure_error_no_image_toast": "Error: No image",

  "history_nav_title": "History",
  "history_title": "Measurement History",
  "history_no_measurements": "No measurements yet.",
  "history_clear_btn": "Clear History",
  "history_cleared_toast": "History cleared",

  "measurement_chest": "Chest",
  "measurement_waist": "Waist",
  "measurement_hip": "Hip",
  "measurement_neck": "Neck"
};

const zhStrings = {
  "appName": "体测专家",
  "index_title": "身体测量工具",
  "index_start_measurement_btn": "开始测量",
  "index_view_history_btn": "查看历史",
  "index_switch_to_chinese_btn": "中文",
  "index_switch_to_english_btn": "English",

  "camera_nav_title": "相机",
  "camera_capture_btn": "拍摄",
  "camera_switch_camera_btn": "切换相机",
  "camera_helper_text": "请将身体对准取景框后点击拍摄。",
  "camera_positioning_title": "姿势提示:",
  "camera_positioning_tip1": "- 身体站直，正对相机。",
  "camera_positioning_tip2": "- 确保从头到大腿中部都可见。",
  "camera_positioning_tip3": "- 手臂稍稍离开身体。",
  "camera_error_toast": "相机错误",
  "camera_capture_failed_toast": "拍摄失败",
  "camera_guide_neck": "颈围",
  "camera_guide_chest": "胸围",
  "camera_guide_waist": "腰围",
  "camera_guide_hip": "臀围",

  "measure_nav_title": "模拟测量",
  "measure_chest_btn": "测量胸围",
  "measure_waist_btn": "测量腰围",
  "measure_hip_btn": "测量臀围",
  "measure_neck_btn": "测量颈围",
  "measure_options_title": "测量选项",
  "measure_result_title": "测量结果",
  "measure_simulated_value_suffix": "(模拟值)",
  "measure_error_no_image_toast": "错误：无图像",

  "history_nav_title": "历史记录",
  "history_title": "测量历史",
  "history_no_measurements": "暂无测量记录。",
  "history_clear_btn": "清除历史",
  "history_cleared_toast": "历史已清除",

  "measurement_chest": "胸围",
  "measurement_waist": "腰围",
  "measurement_hip": "臀围",
  "measurement_neck": "颈围"
};


App({
  globalData: {
    userInfo: null,
    language: 'en', // Default language
    locales: {},    // To store loaded locale strings
    // Optional: localeFileMap can be kept for reference or future dynamic loading
    localeFileMap: {
      'en': '/locales/en.json',
      'zh': '/locales/zh.json'
    }
  },

  onLaunch: function () {
    // Called when the mini program is launched
    // console.log('App Launch');
    // Load default language strings
    this.loadLocale(this.globalData.language);
  },

  /**
   * Loads the specified language strings into globalData.locales.
   * @param {string} lang - The language code (e.g., 'en', 'zh').
   */
  loadLocale(lang) {
    if (lang === 'zh') {
      this.globalData.locales = zhStrings;
    } else {
      this.globalData.locales = enStrings; // Default to English
    }
    this.globalData.language = lang;
    // console.log('Locale loaded for:', lang, this.globalData.locales);
  },

  /**
   * Sets the application language and triggers a refresh of the current page's UI.
   * @param {string} lang - The language code (e.g., 'en', 'zh').
   */
  setLanguage(lang) {
    this.loadLocale(lang); // Load new language strings

    // Attempt to refresh the current page to reflect language changes
    const pages = getCurrentPages();
    if (pages.length > 0) {
      const currentPage = pages[pages.length - 1];
      // If the current page has a 'loadLangData' method, call it.
      // This method is expected to be implemented in pages that need dynamic UI updates for i18n.
      if (currentPage.loadLangData && typeof currentPage.loadLangData === 'function') {
        currentPage.loadLangData();
      }
    }
  },

  onShow: function (options) {
    // Called when the mini program is started or shown from the background
    // console.log('App Show');
  },
  onHide: function () {
    // Called when the mini program is switched to the background
    // console.log('App Hide');
  },
  onError: function (msg) {
    // Called when a script error occurs or an API call fails
    console.log('App Error:', msg);
  }
});
