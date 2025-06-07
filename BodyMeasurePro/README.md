# BodyMeasurePro

**A WeChat Mini Program to demonstrate camera-based body measurement (chest, waist, hip, neck).**
This WeChat Mini Program is designed to help users estimate their body circumferences (chest, waist, hip, neck) using their phone's camera. It is intended for human subjects.

**Note: Currently, all measurements are simulated.**

## Features

*   Live camera view for image capture.
*   Switch between front and back cameras.
*   Visual guide lines (silhouette and horizontal lines) for positioning assistance.
*   Simulated measurement for Chest, Waist, Hip, and Neck.
*   Storage of measurement history (type, value, timestamp).
*   Ability to view and clear measurement history.

## How to Use

1.  Tap "Start Measurement" on the home page.
2.  On the camera page, use the "Switch Camera" button if needed. Align yourself using the on-screen guides for framing, then tap "Capture".
3.  You will be taken to the "Simulated Measurement" page, where the captured image is displayed.
4.  Tap "Measure Chest", "Measure Waist", "Measure Hip", or "Measure Neck".
5.  A simulated measurement value (e.g., "Chest: 90cm (Simulated)") will be displayed and saved to your local history.
6.  Navigate back to the home page (using the top-left back arrow) and tap "View History" to see all saved measurements. You can also clear the history from this page.

## Important Limitations

*   **Simulated Measurements**: The core feature of measuring body dimensions from an image is NOT yet implemented. All displayed measurements are placeholders and not based on image analysis. This is a proof-of-concept for the UI flow and data handling.
*   **Accuracy**: No real-world accuracy can be expected from the current version. The values are entirely simulated.

## Future Development

*   Integration of actual computer vision models for body segmentation and measurement.
*   User guidance for optimal photo capture (e.g., ensuring correct pose, distance, and lighting).
*   Calibration tools for improved accuracy.
*   More detailed measurement history and trends.

## Tips for Best Results (Future Accuracy)

While the current version uses simulated measurements, adhering to these guidelines would be important if actual image processing were implemented for accurate results:

*   **Pose**: Stand upright and straight, facing the camera directly. Look forward. Relax your shoulders and keep your arms slightly away from your sides (e.g., a 15-20 degree angle).
*   **Distance & Framing**: Position yourself so that your entire body, at least from the top of your head to your mid-thighs, is clearly visible within the frame. Avoid being too close or too far.
*   **Clothing**: Wear form-fitting clothing. Bulky or loose clothes can significantly skew measurements.
*   **Lighting**: Ensure you are in a well-lit area with even lighting. Avoid strong shadows or backlighting.
*   **Background**: A plain, contrasting background is preferable.

## Project Structure

*   `/images`: Icon files (currently placeholders) and other static image assets.
*   `/pages`: Contains all pages of the mini-program:
    *   `index`: The home page with navigation to camera and history.
    *   `camera`: Page for capturing photos using the device camera.
    *   `measure`: Page to display the captured photo and trigger simulated measurements.
    *   `history`: Page to display the list of saved measurements.
*   `/utils`: Utility scripts (currently minimal).
*   `app.js`: Global application logic (currently minimal, just `App({})`).
*   `app.json`: Global application configuration, including page registration and window styling.
*   `app.wxss`: Global styles (currently empty).
*   `project.config.json`: WeChat DevTools project configuration, including AppID and settings.

---
This README provides an overview of the BodyMeasurePro application, its current capabilities, limitations, and future direction.
