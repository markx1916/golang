// pages/measure/measure.js
/**
 * Measure Page: Displays the captured image on a canvas, initializes VisionKit for body detection,
 * triggers detection, processes results, and allows users to trigger simulated body measurements
 * with visual indicators. Results are displayed and saved.
 */
const app = getApp();

// Mock TF is kept for potential fallback but VisionKit is primary for detection
const mockTf = {
  loadGraphModel: async (modelPath) => {
    // console.log(`Simulating loading model from: ${modelPath}`);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // console.log("Model loaded successfully (simulated).");
        resolve({
          estimatePoses: async (canvasElementIgnored, flipHorizontalIgnored) => {
            // console.log("Simulating TF estimatePoses...");
            return new Promise(res => setTimeout(() => {
               // console.log("TF estimatePoses completed (simulated).");
               res([{
                   score: 0.8,
                   keypoints: [
                       { name: 'left_shoulder', score: 0.85, x: 100, y: 150 },
                       { name: 'right_shoulder', score: 0.82, x: 200, y: 150 },
                       { name: 'left_hip', score: 0.75, x: 110, y: 250 },
                       { name: 'right_hip', score: 0.72, x: 190, y: 250 },
                       { name: 'nose', score: 0.9, x: 150, y: 100 },
                       { name: 'left_ear', score: 0.7, x: 80, y: 105 },
                       { name: 'right_ear', score: 0.68, x: 220, y: 105 },
                       { name: 'left_elbow', score: 0.7, x: 70, y: 190 },
                       { name: 'right_elbow', score: 0.68, x: 230, y: 190 },
                       { name: 'left_wrist', score: 0.65, x: 60, y: 230 },
                       { name: 'right_wrist', score: 0.62, x: 240, y: 230 },
                       { name: 'left_knee', score: 0.78, x: 120, y: 350 },
                       { name: 'right_knee', score: 0.76, x: 180, y: 350 },
                       { name: 'left_ankle', score: 0.7, x: 125, y: 450 },
                       { name: 'right_ankle', score: 0.69, x: 175, y: 450 }
                   ]
               }]);
            }, 1500));
          }
        });
      }, 2000);
    });
  }
};

Page({
  data: {
    imagePath: '',
    measurementResult: '',
    lang: {},
    imageLoaded: false,
    originalImageWidth: 0,
    originalImageHeight: 0,
    canvasDrawWidth: 300,
    canvasDrawHeight: 400,
    canvasOffsetX: 0,
    canvasOffsetY: 0,
    canvasElementWidth: 0,  // Actual runtime width of the canvas DOM element
    canvasElementHeight: 0, // Actual runtime height of the canvas DOM element
    lastMeasurementTypeKey: null,
    lastMeasurementRawValue: null,

    visionKitSession: null,
    visionKitReady: false,
    visionKitError: false,
    visionKitRawKeypoints: null,
    visionKitKeypoints: null,
    visionKitDetectionInProgress: false,
    visionKitUserMessage: ''
  },
  canvasCtx: null,

  onLoad: function (options) {
    this.setData({
      imagePath: options.imagePath || null,
      measurementResult: '', imageLoaded: false,
      visionKitSession: null, visionKitReady: false, visionKitError: false,
      visionKitRawKeypoints: null, visionKitKeypoints: null,
      visionKitDetectionInProgress: false, visionKitUserMessage: '',
      canvasElementWidth: 0, canvasElementHeight: 0
    });
    this.canvasCtx = wx.createCanvasContext('measureCanvas');
    this.loadLangData();
    if (this.data.imagePath) { this.loadImageOntoCanvas(this.data.imagePath); }
    else {
      console.error("No imagePath provided to measure page");
      const errTitle = (this.data.lang && this.data.lang.measure_error_no_image_toast)
                       ? this.data.lang.measure_error_no_image_toast : 'Error: No image';
      this.setData({ visionKitUserMessage: errTitle, visionKitError: true });
    }
    this.initVisionKit();
  },

  initVisionKit() {
    if (!wx.createVKSession) {
      console.error("wx.createVKSession is not available.");
      this.setData({
        visionKitUserMessage: (this.data.lang && this.data.lang.visionkit_not_supported) || 'VisionKit not supported. Please update WeChat.',
        visionKitReady: false, visionKitError: true
      });
      return;
    }
    try {
      const session = wx.createVKSession({ track: { body: { mode: 2 } }, version: 'v1' });
      this.setData({ visionKitSession: session });

      session.on('error', error => {
        console.error('VisionKit Session Error:', error);
        this.setData({
          visionKitUserMessage: (this.data.lang && this.data.lang.visionkit_error_toast) || 'VisionKit error.',
          visionKitReady: false, visionKitError: true, visionKitDetectionInProgress: false
        });
        wx.hideLoading();
      });

      session.on('updateAnchors', anchors => {
        // console.log('VisionKit updateAnchors:', anchors);
        wx.hideLoading();
        let userMsg = '', rawKps = null, scaledKps = null, vkError = false;
        if (anchors && anchors.length > 0) {
          const bodyAnchor = anchors[0];
          if (bodyAnchor.points && bodyAnchor.points.length > 0) {
            rawKps = [];
            for (let i = 0; i < bodyAnchor.points.length; i += 2) {
               rawKps.push({ x: bodyAnchor.points[i], y: bodyAnchor.points[i+1] });
            }
            this.setData({ visionKitRawKeypoints: rawKps });
            scaledKps = this._scaleKeypoints(rawKps);
            if (scaledKps && scaledKps.length > 0) {
                userMsg = (this.data.lang && this.data.lang.visionkit_detection_success) || 'Body features detected!';
            } else {
                userMsg = (this.data.lang && this.data.lang.visionkit_detection_failed) || 'No body features detected. Using default lines.';
                vkError = true;
            }
          } else {
            userMsg = (this.data.lang && this.data.lang.visionkit_detection_failed) || 'No body features detected. Using default lines.';
            vkError = true;
          }
        } else {
          userMsg = (this.data.lang && this.data.lang.visionkit_detection_failed) || 'No body features detected. Using default lines.';
          vkError = true;
        }
        this.setData({
            visionKitKeypoints: scaledKps,
            visionKitUserMessage: userMsg,
            visionKitError: vkError,
            visionKitDetectionInProgress: false
        });
        // console.log("Processed VisionKit Keypoints:", scaledKps);
      });

      session.start(error => {
        if (error) {
          console.error('VisionKit Session Start Failed:', error);
          this.setData({
            visionKitUserMessage: (this.data.lang && this.data.lang.visionkit_start_failed_toast) || 'VisionKit failed to start.',
            visionKitReady: false, visionKitError: true
          });
          return;
        }
        console.log('VisionKit Session Started Successfully.');
        this.setData({ visionKitReady: true, visionKitError: false, visionKitUserMessage: '' });
        if (this.data.imageLoaded) { this.detectBodyFeaturesFromCanvas(); }
      });
    } catch (err) {
      console.error("Error creating VKSession:", err);
      this.setData({
          visionKitUserMessage: (this.data.lang && this.data.lang.visionkit_creation_failed) || 'Failed to create VisionKit session.',
          visionKitReady: false, visionKitError: true
      });
    }
  },

  _scaleKeypoints(rawKeypoints) {
    if (!rawKeypoints || rawKeypoints.length === 0 || !this.data.imageLoaded) {
      return null;
    }
    return rawKeypoints.map((kp) => ({
      x: kp.x + this.data.canvasOffsetX,
      y: kp.y + this.data.canvasOffsetY,
    }));
  },

  loadImageOntoCanvas(path) {
    const ctx = this.canvasCtx;
    wx.createSelectorQuery().select('#measureCanvas').boundingClientRect(node => {
      // CRITICAL: Canvas element query failed or canvas has no valid dimensions. Cannot proceed with image drawing or analysis.
      if (!node || node.width <= 0 || node.height <= 0) {
        console.error("CRITICAL: Failed to get valid canvas dimensions from selectorQuery or canvas has zero dimensions. Node:", node);
        const canvasInitFailedMsg = (this.data.lang && this.data.lang.canvas_init_failed) || 'Canvas setup failed. Cannot proceed.';
        this.setData({
            imageLoaded: false,
            visionKitUserMessage: canvasInitFailedMsg,
            visionKitError: true
        });
        return;
      }
      // console.log("Canvas element actual dimensions via selectorQuery:", node.width, node.height);
      // Store the actual runtime dimensions of the canvas element.
      this.setData({
          canvasElementWidth: node.width,
          canvasElementHeight: node.height
      });

      // Use actual, queried canvas dimensions for aspect ratio calculations to ensure accuracy.
      const canvasDisplayWidth = node.width;
      const canvasDisplayHeight = node.height;

      wx.getImageInfo({
        src: path,
        success: (res) => {
          // CRITICAL: Image information is invalid or image has zero dimensions. Cannot proceed.
          if (!res || !res.width || res.width <= 0 || !res.height || res.height <= 0) {
            console.error("CRITICAL: wx.getImageInfo returned invalid image dimensions.", res);
            this.setData({
                imageLoaded: false,
                visionKitUserMessage: (this.data.lang && this.data.lang.load_image_failed_toast) || 'Failed to load image details.',
                visionKitError: true
            });
            return;
          }

          let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
          // Standard aspect-fit logic to calculate dimensions for drawing image onto canvas
          const imgAspectRatio = res.width / res.height;
          const canvasAspectRatio = canvasDisplayWidth / canvasDisplayHeight;

          if (imgAspectRatio > canvasAspectRatio) {
            drawWidth = canvasDisplayWidth;
            drawHeight = canvasDisplayWidth / imgAspectRatio;
            offsetY = (canvasDisplayHeight - drawHeight) / 2;
          } else {
            drawHeight = canvasDisplayHeight;
            drawWidth = canvasDisplayHeight * imgAspectRatio;
            offsetX = (canvasDisplayWidth - drawWidth) / 2;
          }

          // CRITICAL VALIDATION: Ensure the calculated parameters for drawing the image onto the canvas
          // define a valid rectangle that fits entirely within the actual canvas element dimensions.
          // This prevents ctx.drawImage from potentially drawing misaligned content and, more importantly,
          // ensures that the subsequent wx.canvasGetImageData call targets a valid area within the canvas.
          // Parameters for canvasGetImageData (x, y, width, height) must be positive and within canvas bounds.
          const tolerance = 0.5;
          if (drawWidth <= 0 || drawHeight <= 0 ||
              offsetX < -tolerance || offsetY < -tolerance ||
              (offsetX + drawWidth) > canvasDisplayWidth + tolerance ||
              (offsetY + drawHeight) > canvasDisplayHeight + tolerance) {
              console.error("CRITICAL: Calculated draw parameters are invalid or out of canvas bounds.",
                            { offsetX, offsetY, drawWidth, drawHeight, canvasDisplayWidth, canvasDisplayHeight });
              this.setData({
                  imageLoaded: false,
                  visionKitUserMessage: (this.data.lang && this.data.lang.canvas_draw_error) || 'Error preparing image for analysis.',
                  visionKitError: true
              });
              return;
          }

          this.setData({
            originalImageWidth: res.width, originalImageHeight: res.height,
            canvasDrawWidth: drawWidth, canvasDrawHeight: drawHeight,
            canvasOffsetX: offsetX, canvasOffsetY: offsetY,
            imagePath: path
          });
          ctx.drawImage(path, offsetX, offsetY, drawWidth, drawHeight);
          ctx.draw();
          this.setData({ imageLoaded: true });
          if (this.data.visionKitReady) { this.detectBodyFeaturesFromCanvas(); }
          else {
            // console.log("Image loaded, but VisionKit not ready yet for detection trigger from loadImageOntoCanvas.");
          }
        },
        fail: (err) => {
            console.error("Failed to get image info:", err);
            const loadImageFailed = (this.data.lang && this.data.lang.load_image_failed_toast) || 'Failed to load image';
            this.setData({ visionKitUserMessage: loadImageFailed, visionKitError: true });
        }
      });
    }).exec();
  },

  detectBodyFeaturesFromCanvas() {
    if (!this.data.visionKitReady || !this.data.imageLoaded) {
      // console.log("detectBodyFeaturesFromCanvas skipped: VK ready?", this.data.visionKitReady, "Image loaded?", this.data.imageLoaded);
      return;
    }
    if (this.data.visionKitDetectionInProgress) {
      // console.log("detectBodyFeaturesFromCanvas skipped: Detection already in progress.");
      return;
    }

    // --- Diagnostic Logging (commented out) ---
    // console.log("--- Preparing for canvasGetImageData in detectBodyFeaturesFromCanvas ---");
    // ...

    // CRITICAL PRE-CHECK: Verify that the calculated drawWidth and drawHeight (which will be
    // used as width and height for wx.canvasGetImageData) are positive and valid.
    // Calling wx.canvasGetImageData with zero or negative width/height will cause an error.
    if (!this.data.canvasDrawWidth || !this.data.canvasDrawHeight ||
        this.data.canvasDrawWidth <= 0 || this.data.canvasDrawHeight <= 0) {
       console.error("ERROR: Invalid draw dimensions for canvasGetImageData.",
                     "DrawW:", this.data.canvasDrawWidth, "DrawH:", this.data.canvasDrawHeight);
       this.setData({
           visionKitDetectionInProgress: false,
           visionKitUserMessage: (this.data.lang && this.data.lang.canvas_getimagedata_invalid_dims) || 'Invalid image draw dimensions for analysis.',
           visionKitError: true
       });
       wx.hideLoading();
       return;
    }

    this.setData({
        visionKitDetectionInProgress: true,
        visionKitRawKeypoints: null, visionKitKeypoints: null,
        visionKitUserMessage: ''
    });
    const loadingTitle = (this.data.lang && this.data.lang.visionkit_detecting) ? this.data.lang.visionkit_detecting : 'Analyzing features...';
    wx.showLoading({ title: loadingTitle });

    wx.canvasGetImageData({
      canvasId: 'measureCanvas',
      x: this.data.canvasOffsetX, y: this.data.canvasOffsetY,
      width: this.data.canvasDrawWidth, height: this.data.canvasDrawHeight,
      success: (res) => {
        // console.log("canvasGetImageData success. Width:", res.width, "Height:", res.height);
        if (this.data.visionKitSession) {
          this.data.visionKitSession.detectBody({
            frameBuffer: res.data.buffer, width: res.width, height: res.height,
            scoreThreshold: 0.3, sourceType: 1
          });
        } else {
            this.setData({ visionKitDetectionInProgress: false, visionKitUserMessage: 'VK Session lost.', visionKitError: true });
            wx.hideLoading();
        }
      },
      fail: (err) => {
        console.error("wx.canvasGetImageData failed:", err);
        this.setData({
            visionKitUserMessage: (this.data.lang && this.data.lang.visionkit_getimagedata_failed) || 'Failed to get image data.',
            visionKitDetectionInProgress: false, visionKitError: true
        });
        wx.hideLoading();
      }
    });
  },

  _drawMeasurementLine(measurementType) {
    if (!this.data.imageLoaded || !this.canvasCtx) return;
    const ctx = this.canvasCtx;
    ctx.drawImage(this.data.imagePath, this.data.canvasOffsetX, this.data.canvasOffsetY, this.data.canvasDrawWidth, this.data.canvasDrawHeight);
    const keypoints = this.data.visionKitKeypoints;
    let lineDrawn = false;
    // Keypoint mapping based on hypothetical VisionKit 23-point model:
    // (Indices represent common body models like COCO/BlazePose, but VisionKit's actual indices must be verified from its documentation)
    // 0: Nose, 1: L_Eye, 2: R_Eye, 3: L_Ear, 4: R_Ear,
    // 5: L_Shoulder, 6: R_Shoulder, 7: L_Elbow, 8: R_Elbow,
    // 9: L_Wrist, 10: R_Wrist, 11: L_Hip, 12: R_Hip,
    // 13: L_Knee, 14: R_Knee, 15: L_Ankle, 16: R_Ankle
    // IMPORTANT: These indices are placeholders for this simulation.
    const VK_NOSE = 0, VK_L_SHOULDER = 5, VK_R_SHOULDER = 6, VK_L_HIP = 11, VK_R_HIP = 12;

    if (keypoints && keypoints.length > Math.max(VK_L_SHOULDER, VK_R_SHOULDER, VK_L_HIP, VK_R_HIP, VK_NOSE)) {
      const getKp = (index) => (keypoints[index] && typeof keypoints[index].x === 'number' && typeof keypoints[index].y === 'number') ? keypoints[index] : null;
      try {
        let p1, p2, yPos, xStart, xEnd, centerX;
        ctx.setStrokeStyle('rgba(255, 0, 0, 0.8)'); ctx.setLineWidth(3); ctx.beginPath();
        switch (measurementType) {
            case 'measurement_chest':
              p1 = getKp(VK_L_SHOULDER); p2 = getKp(VK_R_SHOULDER);
              if (p1 && p2) { yPos = (p1.y + p2.y) / 2; ctx.moveTo(p1.x, yPos); ctx.lineTo(p2.x, yPos); lineDrawn = true; }
              break;
            case 'measurement_waist':
              const lHipW = getKp(VK_L_HIP); const rHipW = getKp(VK_R_HIP);
              const lShoulderW = getKp(VK_L_SHOULDER); const rShoulderW = getKp(VK_R_SHOULDER);
              if (lHipW && rHipW && lShoulderW && rShoulderW) {
                const shoulderY = (lShoulderW.y + rShoulderW.y) / 2; const hipY = (lHipW.y + rHipW.y) / 2;
                yPos = hipY + (shoulderY - hipY) * 0.4;
                xStart = Math.min(lHipW.x, rHipW.x); xEnd = Math.max(lHipW.x, rHipW.x);
                ctx.moveTo(xStart, yPos); ctx.lineTo(xEnd, yPos); lineDrawn = true;
              }
              break;
            case 'measurement_hip':
              p1 = getKp(VK_L_HIP); p2 = getKp(VK_R_HIP);
              if (p1 && p2) { yPos = (p1.y + p2.y) / 2; ctx.moveTo(p1.x, yPos); ctx.lineTo(p2.x, yPos); lineDrawn = true; }
              break;
            case 'measurement_neck':
              const noseN = getKp(VK_NOSE); const lsN = getKp(VK_L_SHOULDER); const rsN = getKp(VK_R_SHOULDER);
              if (noseN && lsN && rsN) {
                 yPos = noseN.y + (((lsN.y + rsN.y)/2) - noseN.y) * 0.35;
                 const shoulderWidth = Math.abs(rsN.x - lsN.x); const neckWidthEstimate = shoulderWidth * 0.35;
                 centerX = (lsN.x + rsN.x) / 2;
                 ctx.moveTo(centerX - neckWidthEstimate / 2, yPos); ctx.lineTo(centerX + neckWidthEstimate / 2, yPos); lineDrawn = true;
              }
              break;
        }
        if (lineDrawn) ctx.stroke();
      } catch (e) { console.error("Error drawing pose-informed line:", e); lineDrawn = false; }
    }

    if (!lineDrawn) {
        console.log("Using static fallback lines for:", measurementType);
        let yFactor, xSF = 0.1, xEF = 0.9;
        if (measurementType === 'measurement_chest') yFactor = 0.45;
        else if (measurementType === 'measurement_waist') yFactor = 0.60;
        else if (measurementType === 'measurement_hip') yFactor = 0.70;
        else if (measurementType === 'measurement_neck') { yFactor = 0.25; xSF = 0.3; xEF = 0.7; }
        else return;
        const sY = this.data.canvasOffsetY + this.data.canvasDrawHeight * yFactor;
        const sXS = this.data.canvasOffsetX + this.data.canvasDrawWidth * xSF;
        const sXE = this.data.canvasOffsetX + this.data.canvasDrawWidth * xEF;
        ctx.setStrokeStyle('rgba(0, 0, 255, 0.7)'); ctx.setLineWidth(2); ctx.beginPath();
        ctx.moveTo(sXS, sY); ctx.lineTo(sXE, sY); ctx.stroke();
        ctx.setFontSize(10); ctx.setFillStyle('blue');
        const fallbackText = (this.data.lang && this.data.lang.visionkit_fallback_line) || '(Default Line)';
        ctx.fillText(fallbackText, this.data.canvasOffsetX + 5, this.data.canvasOffsetY + 15);
    }
    ctx.draw(true);
  },

  _finalizeMeasurement(typeKey, rawValue) { /* ... (content as before) ... */ },
  measureChest: function() { if (!this.data.imageLoaded || !this.data.visionKitReady || this.data.visionKitError || this.data.visionKitDetectionInProgress) return; this._drawMeasurementLine('measurement_chest'); this._finalizeMeasurement('measurement_chest', "90"); },
  measureWaist: function() { if (!this.data.imageLoaded || !this.data.visionKitReady || this.data.visionKitError || this.data.visionKitDetectionInProgress) return; this._drawMeasurementLine('measurement_waist'); this._finalizeMeasurement('measurement_waist', "75"); },
  measureHip: function() { if (!this.data.imageLoaded || !this.data.visionKitReady || this.data.visionKitError || this.data.visionKitDetectionInProgress) return; this._drawMeasurementLine('measurement_hip'); this._finalizeMeasurement('measurement_hip', "95"); },
  measureNeck: function() { if (!this.data.imageLoaded || !this.data.visionKitReady || this.data.visionKitError || this.data.visionKitDetectionInProgress) return; this._drawMeasurementLine('measurement_neck'); this._finalizeMeasurement('measurement_neck', "38"); },

  loadLangData: function() { /* ... (content as before) ... */ },
  drawDetectedKeypoints() { /* ... (content as before) ... */ },
  onShow: function () { this.loadLangData(); },
  onReady: function () {},
  onHide: function () {},
  onUnload: function () {
    if (this.data.visionKitSession) {
      console.log("Stopping VisionKit session on page unload.");
      this.data.visionKitSession.stop();
      this.setData({ visionKitSession: null, visionKitReady: false });
    }
  },
  onPullDownRefresh: function () {},
  onReachBottom: function () {},
  onShareAppMessage: function () { /* ... (content as before) ... */ }
});
