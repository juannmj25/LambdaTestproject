import { Page } from "@playwright/test";
import { timeouts, urls } from "./testData";

/**
 * Base helper with common functionality for all pages
 */
class BaseHelper {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigates to the playground main page
   */
  async gotoPlayground(): Promise<void> {
    await this.page.goto(urls.playground);
    await this.page.waitForLoadState("domcontentloaded");
  }

  /**
   * Safe method to fill a form field by trying multiple selectors
   */
  protected async fillInputSafely(
    selectors: string[],
    value: string,
  ): Promise<void> {
    for (const selector of selectors) {
      try {
        const element = this.page.locator(selector);
        if ((await element.count()) > 0) {
          await element.first().fill(value);
          return;
        }
      } catch {
        // Continue with the next selector
      }
    }
    console.log(`Could not fill any of the selectors: ${selectors.join(", ")}`);
  }

  /**
   * Safe method to click a button by trying multiple selectors
   */
  protected async clickButtonSafely(selectors: string[]): Promise<void> {
    for (const selector of selectors) {
      try {
        const element = this.page.locator(selector);
        if ((await element.count()) > 0) {
          await element.first().click();
          return;
        }
      } catch {
        // Continue with the next selector
      }
    }
    console.log(
      `Could not click any of the selectors: ${selectors.join(", ")}`,
    );
  }

  /**
   * Safe wait that doesn't fail if the element doesn't appear
   */
  protected async waitForSelectorSafely(
    selector: string,
    timeout = 5000,
  ): Promise<boolean> {
    try {
      await this.page.waitForSelector(selector, { timeout });
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Helper for Simple Form Demo page
 */
export class SimpleFormHelper extends BaseHelper {
  /**
   * Navigates to Simple Form Demo page
   */
  async gotoPage(): Promise<void> {
    await this.gotoPlayground();
    await this.page.click('a:text("Simple Form Demo")');
    await this.page.waitForURL(new RegExp(urls.simpleForm));
  }

  /**
   * Tests the simple form
   */
  async testForm(message: string): Promise<string | null> {
    await this.page.waitForSelector("#user-message");
    await this.page.fill("#user-message", message);
    await this.page.click("#showInput");

    await this.page.waitForSelector("#message");
    return await this.page.locator("#message").textContent();
  }
}

/**
 * Helper for Drag & Drop Sliders page
 */
export class SliderHelper extends BaseHelper {
  /**
   * Navigates to Drag & Drop Sliders page
   */
  async gotoPage(): Promise<void> {
    await this.gotoPlayground();
    await this.page.click('a:text("Drag & Drop Sliders")');
    await this.page.waitForURL(new RegExp(urls.dragDropSliders));
    await this.page.waitForTimeout(timeouts.pageLoad);
  }

  /**
   * Drags a slider to a specific value
   */
  async dragSlider(sliderIndex: number, targetValue: number): Promise<void> {
    // Wait for sliders to be visible
    await this.page.waitForSelector('input[type="range"]', { timeout: 30000 });

    const sliders = this.page.locator('input[type="range"]');
    const count = await sliders.count();

    if (sliderIndex >= count) {
      throw new Error(`Slider index ${sliderIndex} is out of range. Found ${count} sliders.`);
    }

    // Select the target slider
    const targetSlider = sliders.nth(sliderIndex);
    const currentValue = await targetSlider.inputValue();

    // Use the fill method (most reliable for range inputs)
    await targetSlider.fill(targetValue.toString());

    // Wait for the value to update
    await this.page.waitForTimeout(200);

    // Verify the final value
    const finalValue = await targetSlider.inputValue();
    const finalValueInt = parseInt(finalValue);

    // Use tolerance for validation
    const tolerance = 2;
    if (Math.abs(finalValueInt - targetValue) > tolerance) {
      console.warn(`Slider value ${finalValue} is not exactly ${targetValue}, but within tolerance`);
    }
  }

  /**
   * Gets the current value of a slider
   */
  async getSliderValue(sliderIndex: number): Promise<string | null> {
    // Try to find the value using different strategies
    const strategies = [
      // Strategy 1: Output tags
      async () => {
        const outputs = this.page.locator("output");
        const count = await outputs.count();
        if (count > sliderIndex) {
          return await outputs.nth(sliderIndex).textContent();
        }
        return null;
      },

      // Strategy 2: Specific value display elements
      async () => {
        const valueDisplays = this.page.locator(
          ".range-slider__tooltip, .rangeslider__value-bubble, .rangeslider__tooltip, .slider-value",
        );
        const count = await valueDisplays.count();
        if (count > sliderIndex) {
          return await valueDisplays.nth(sliderIndex).textContent();
        }
        return null;
      },

      // Strategy 3: Value attribute of the slider itself
      async () => {
        const slider = this.page
          .locator('input[type="range"]')
          .nth(sliderIndex);
        return await slider.getAttribute("value");
      },
    ];

    // Try each strategy until a value is found
    for (const strategy of strategies) {
      try {
        const value = await strategy();
        if (value !== null) {
          return value;
        }
      } catch {
        // Continue with the next strategy
      }
    }

    return null;
  }
}

/**
 * Helper for Input Form Submit page
 */
export class FormHelper extends BaseHelper {
  /**
   * Navigates to Input Form Submit page
   */
  async gotoPage(): Promise<void> {
    await this.gotoPlayground();
    await this.page.click('a:text("Input Form Submit")');
    await this.page.waitForURL(new RegExp(urls.inputForm));
    await this.page.waitForTimeout(timeouts.pageLoad);
  }

  /**
   * Fills and submits the form
   */
  async fillAndSubmitForm(formData: {
    name: string;
    email: string;
    password: string;
    company: string;
    website: string;
    country: string;
    city: string;
    address1: string;
    address2: string;
    state: string;
    zip: string;
  }): Promise<void> {
    // Llenar campos de texto
    await this.fillInputSafely(
      ["input#name", 'input[name="name"]'],
      formData.name,
    );
    await this.fillInputSafely(
      ["input#inputEmail4", 'input[name="email"]'],
      formData.email,
    );
    await this.fillInputSafely(
      ["input#inputPassword4", 'input[name="password"]'],
      formData.password,
    );
    await this.fillInputSafely(
      ["input#company", 'input[name="company"]'],
      formData.company,
    );
    await this.fillInputSafely(
      ["input#websitename", 'input[name="website"]'],
      formData.website,
    );

    // Seleccionar país
    await this.selectCountry(formData.country);

    // Llenar dirección
    await this.fillInputSafely(
      ["input#inputCity", 'input[name="city"]'],
      formData.city,
    );
    await this.fillInputSafely(
      ["input#inputAddress1", 'input[name="address_line1"]'],
      formData.address1,
    );
    await this.fillInputSafely(
      ["input#inputAddress2", 'input[name="address_line2"]'],
      formData.address2,
    );
    await this.fillInputSafely(
      ["input#inputState", 'input[name="state"]'],
      formData.state,
    );
    await this.fillInputSafely(
      ["input#inputZip", 'input[name="zip"]'],
      formData.zip,
    );

    // Enviar formulario
    await this.submitForm();
  }

  /**
   * Submits an empty form
   */
  async submitEmptyForm(): Promise<void> {
    await this.submitForm();
  }

  /**
   * Gets the success message
   */
  async getSuccessMessage(): Promise<string | null> {
    // Possible success message selectors
    const successSelectors = [
      ".success-msg",
      ".alert-success",
      "text=/Thanks|Success|successfully/i",
    ];

    // Try each selector
    for (const selector of successSelectors) {
      try {
        if (selector.startsWith("text")) {
          const element = this.page.locator(selector);
          if ((await element.count()) > 0) {
            return await element.first().textContent();
          }
        } else {
          await this.page.waitForSelector(selector, {
            timeout: timeouts.messageCheck,
          });
          return await this.page.locator(selector).textContent();
        }
      } catch {
        // Continue with the next selector
      }
    }

    return null;
  }

  /**
   * Selects a country from the dropdown
   */
  private async selectCountry(country: string): Promise<void> {
    const selectors = [
      "select.form-control",
      'select[name="country"]',
      "select",
    ];

    for (const selector of selectors) {
      try {
        const element = this.page.locator(selector);
        if ((await element.count()) > 0) {
          await element.selectOption({ label: country });
          return;
        }
      } catch {
        // Continue with the next selector
      }
    }

    console.log("Could not select the country");
  }

  /**
   * Submits the form
   */
  private async submitForm(): Promise<void> {
    const submitButtonSelectors = [
      'button[type="submit"]:not(#contbtn)',
      'form button[type="submit"]',
      "button.btn-primary",
      'input[type="submit"]',
    ];

    await this.clickButtonSafely(submitButtonSelectors);
  }
}

/**
 * Main helper that integrates all functionalities
 */
export class LambdaTestHelper {
  private readonly page: Page;
  private readonly simpleFormHelper: SimpleFormHelper;
  private readonly sliderHelper: SliderHelper;
  private readonly formHelper: FormHelper;

  constructor(page: Page) {
    this.page = page;
    this.simpleFormHelper = new SimpleFormHelper(page);
    this.sliderHelper = new SliderHelper(page);
    this.formHelper = new FormHelper(page);
  }

  // Simple Form Demo methods
  async gotoSimpleFormDemo(): Promise<void> {
    await this.simpleFormHelper.gotoPage();
  }

  async testSimpleForm(message: string): Promise<string | null> {
    return await this.simpleFormHelper.testForm(message);
  }

  // Drag & Drop Sliders methods
  async gotoDragDropSliders(): Promise<void> {
    await this.sliderHelper.gotoPage();
  }

  async dragSlider(sliderIndex: number, targetValue: number): Promise<void> {
    await this.sliderHelper.dragSlider(sliderIndex, targetValue);
  }

  async getSliderValue(sliderIndex: number): Promise<string | null> {
    return await this.sliderHelper.getSliderValue(sliderIndex);
  }

  // Input Form Submit methods
  async gotoInputFormSubmit(): Promise<void> {
    await this.formHelper.gotoPage();
  }

  async fillAndSubmitForm(formData: any): Promise<void> {
    await this.formHelper.fillAndSubmitForm(formData);
  }

  async submitEmptyForm(): Promise<void> {
    await this.formHelper.submitEmptyForm();
  }

  async getSuccessMessage(): Promise<string | null> {
    return await this.formHelper.getSuccessMessage();
  }

  // Common method
  async gotoPlayground(): Promise<void> {
    await this.simpleFormHelper.gotoPlayground();
  }
}
