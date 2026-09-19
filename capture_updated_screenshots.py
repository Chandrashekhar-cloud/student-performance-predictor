"""
Automated Screenshot Generator for Project Report
Captures high-resolution updated screenshots of the web application
and generates both PNG and JPG assets, updates ZIP bundles, and regenerates the PDF report.
"""

import os
import time
import zipfile
from PIL import Image
from playwright.sync_api import sync_playwright

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SCREENSHOTS_DIR = os.path.join(BASE_DIR, "report_screenshots")
JPG_SUBDIR = os.path.join(SCREENSHOTS_DIR, "jpg")
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)
os.makedirs(JPG_SUBDIR, exist_ok=True)


def save_as_jpg_and_png(png_path, jpg_path):
    """Convert a PNG file to high-quality JPG."""
    with Image.open(png_path) as img:
        rgb_img = img.convert("RGB")
        rgb_img.save(jpg_path, "JPEG", quality=95)


def capture_all():
    print("[*] Launching Playwright browser automation...")
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="msedge", headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 800}, device_scale_factor=1.5)
        page = context.new_page()

        print("[*] Navigating to http://localhost:8080...")
        page.goto("http://localhost:8080", wait_until="networkidle")
        time.sleep(1)

        # -------------------------------------------------------------
        # Fig 1: 01_hero_and_navigation
        # -------------------------------------------------------------
        print("[1/11] Capturing 01_hero_and_navigation...")
        page.evaluate("window.scrollTo(0, 0)")
        time.sleep(0.5)
        f1_png = os.path.join(SCREENSHOTS_DIR, "01_hero_and_navigation.png")
        f1_jpg = os.path.join(SCREENSHOTS_DIR, "01_hero_and_navigation.jpg")
        page.screenshot(path=f1_png, clip={"x": 0, "y": 0, "width": 1280, "height": 780})
        save_as_jpg_and_png(f1_png, f1_jpg)

        # -------------------------------------------------------------
        # Fig 2: 02_project_statistics
        # -------------------------------------------------------------
        print("[2/11] Capturing 02_project_statistics...")
        stats_loc = page.locator("section:has-text('Student Records')").first
        f2_png = os.path.join(SCREENSHOTS_DIR, "02_project_statistics.png")
        f2_jpg = os.path.join(SCREENSHOTS_DIR, "02_project_statistics.jpg")
        stats_loc.screenshot(path=f2_png)
        save_as_jpg_and_png(f2_png, f2_jpg)

        # -------------------------------------------------------------
        # Fig 3: 03_prediction_form_idle
        # -------------------------------------------------------------
        print("[3/11] Capturing 03_prediction_form_idle...")
        # Reset form
        page.locator("button[title='Reset form']").click()
        time.sleep(0.5)
        pred_section = page.locator("#predictor")
        f3_png = os.path.join(SCREENSHOTS_DIR, "03_prediction_form_idle.png")
        f3_jpg = os.path.join(SCREENSHOTS_DIR, "03_prediction_form_idle.jpg")
        pred_section.screenshot(path=f3_png)
        save_as_jpg_and_png(f3_png, f3_jpg)

        # -------------------------------------------------------------
        # Fig 4: 04_prediction_result_good_74
        # -------------------------------------------------------------
        print("[4/11] Capturing 04_prediction_result_good_74...")
        page.locator("button:text-is('Consistent')").click()
        time.sleep(0.5)
        page.locator("button:has-text('Calculate Predicted Performance')").click()
        time.sleep(0.8)
        f4_png = os.path.join(SCREENSHOTS_DIR, "04_prediction_result_good_74.png")
        f4_jpg = os.path.join(SCREENSHOTS_DIR, "04_prediction_result_good_74.jpg")
        pred_section.screenshot(path=f4_png)
        save_as_jpg_and_png(f4_png, f4_jpg)

        # -------------------------------------------------------------
        # Fig 5: 05_prediction_result_excellent_89
        # -------------------------------------------------------------
        print("[5/11] Capturing 05_prediction_result_excellent_89...")
        page.locator("button:text-is('High Performer')").click()
        time.sleep(0.5)
        page.locator("button:has-text('Calculate Predicted Performance')").click()
        time.sleep(0.8)
        f5_png = os.path.join(SCREENSHOTS_DIR, "05_prediction_result_excellent_89.png")
        f5_jpg = os.path.join(SCREENSHOTS_DIR, "05_prediction_result_excellent_89.jpg")
        pred_section.screenshot(path=f5_png)
        save_as_jpg_and_png(f5_png, f5_jpg)

        # -------------------------------------------------------------
        # Fig 6: 06_prediction_result_needs_improvement_43
        # -------------------------------------------------------------
        print("[6/11] Capturing 06_prediction_result_needs_improvement_43...")
        page.locator("button:text-is('Needs Focus')").click()
        time.sleep(0.5)
        page.locator("button:has-text('Calculate Predicted Performance')").click()
        time.sleep(0.8)
        f6_png = os.path.join(SCREENSHOTS_DIR, "06_prediction_result_needs_improvement_43.png")
        f6_jpg = os.path.join(SCREENSHOTS_DIR, "06_prediction_result_needs_improvement_43.jpg")
        pred_section.screenshot(path=f6_png)
        save_as_jpg_and_png(f6_png, f6_jpg)

        # -------------------------------------------------------------
        # Fig 7: 07_input_validation_errors
        # -------------------------------------------------------------
        print("[7/11] Capturing 07_input_validation_errors...")
        page.locator("button[title='Reset form']").click()
        time.sleep(0.5)
        page.locator("button:has-text('Calculate Predicted Performance')").click()
        time.sleep(0.5)
        f7_png = os.path.join(SCREENSHOTS_DIR, "07_input_validation_errors.png")
        f7_jpg = os.path.join(SCREENSHOTS_DIR, "07_input_validation_errors.jpg")
        pred_section.screenshot(path=f7_png)
        save_as_jpg_and_png(f7_png, f7_jpg)

        # Restore consistent sample for clean state
        page.locator("button:text-is('Consistent')").click()
        page.locator("button:has-text('Calculate Predicted Performance')").click()
        time.sleep(0.5)

        # -------------------------------------------------------------
        # Fig 8: 08_how_it_works_workflow
        # -------------------------------------------------------------
        print("[8/11] Capturing 08_how_it_works_workflow...")
        how_section = page.locator("#how-it-works")
        f8_png = os.path.join(SCREENSHOTS_DIR, "08_how_it_works_workflow.png")
        f8_jpg = os.path.join(SCREENSHOTS_DIR, "08_how_it_works_workflow.jpg")
        how_section.screenshot(path=f8_png)
        save_as_jpg_and_png(f8_png, f8_jpg)

        # -------------------------------------------------------------
        # Fig 9: 09_model_and_system_architecture
        # -------------------------------------------------------------
        print("[9/11] Capturing 09_model_and_system_architecture...")
        specs_section = page.locator("#model-specs")
        f9_png = os.path.join(SCREENSHOTS_DIR, "09_model_and_system_architecture.png")
        f9_jpg = os.path.join(SCREENSHOTS_DIR, "09_model_and_system_architecture.jpg")
        specs_section.screenshot(path=f9_png)
        save_as_jpg_and_png(f9_png, f9_jpg)

        # -------------------------------------------------------------
        # Fig 10: 10_footer_and_branding
        # -------------------------------------------------------------
        print("[10/11] Capturing 10_footer_and_branding...")
        footer_loc = page.locator("footer")
        f10_png = os.path.join(SCREENSHOTS_DIR, "10_footer_and_branding.png")
        f10_jpg = os.path.join(SCREENSHOTS_DIR, "10_footer_and_branding.jpg")
        footer_loc.screenshot(path=f10_png)
        save_as_jpg_and_png(f10_png, f10_jpg)

        browser.close()

        # -------------------------------------------------------------
        # Fig 11: 11_mobile_responsive_view (390 x 844)
        # -------------------------------------------------------------
        print("[11/11] Capturing 11_mobile_responsive_view (iPhone 12/13/14 size)...")
        mobile_browser = p.chromium.launch(channel="msedge", headless=True)
        m_context = mobile_browser.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2)
        m_page = m_context.new_page()
        m_page.goto("http://localhost:8080", wait_until="networkidle")
        time.sleep(1)
        f11_png = os.path.join(SCREENSHOTS_DIR, "11_mobile_responsive_view.png")
        f11_jpg = os.path.join(SCREENSHOTS_DIR, "11_mobile_responsive_view.jpg")
        m_page.screenshot(path=f11_png)
        save_as_jpg_and_png(f11_png, f11_jpg)
        mobile_browser.close()

    # Also copy all JPGs into report_screenshots/jpg/
    print("[*] Copying JPG files to subfolder and creating ZIP package...")
    jpg_files = [f for f in os.listdir(SCREENSHOTS_DIR) if f.endswith(".jpg")]
    for jf in jpg_files:
        src = os.path.join(SCREENSHOTS_DIR, jf)
        dst = os.path.join(JPG_SUBDIR, jf)
        with Image.open(src) as im:
            im.save(dst)

    # Build ZIP package
    zip_path = os.path.join(BASE_DIR, "report_screenshots_jpg.zip")
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for jf in sorted(jpg_files):
            full_p = os.path.join(SCREENSHOTS_DIR, jf)
            zf.write(full_p, arcname=jf)

    # Also update project_report_screenshots_jpg.zip if exists
    alt_zip = os.path.join(BASE_DIR, "project_report_screenshots_jpg.zip")
    with zipfile.ZipFile(alt_zip, "w", zipfile.ZIP_DEFLATED) as zf:
        for jf in sorted(jpg_files):
            full_p = os.path.join(SCREENSHOTS_DIR, jf)
            zf.write(full_p, arcname=jf)

    print(f"[SUCCESS] Successfully captured 11 high-res screenshots and built {zip_path}!")


if __name__ == "__main__":
    capture_all()
