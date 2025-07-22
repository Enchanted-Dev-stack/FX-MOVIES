import { NativeModules } from 'react-native';

/**
 * AdBlocker module interface for TypeScript
 */
export interface AdBlockerModule {
  /**
   * Initialize the AdGuard Core library
   * @returns Promise that resolves to true if initialization successful
   */
  init(): Promise<boolean>;

  /**
   * Enable ad blocking for all WebViews
   * @returns Promise that resolves when ad blocking is enabled
   */
  enable(): Promise<void>;

  /**
   * Disable ad blocking for all WebViews
   * @returns Promise that resolves when ad blocking is disabled
   */
  disable(): Promise<void>;

  /**
   * Check if a URL should be blocked
   * @param url The URL to filter
   * @returns Promise that resolves to true if the URL should be blocked
   */
  filterRequest(url: string): Promise<boolean>;

  /**
   * Check if ad blocking is currently enabled
   * @returns Promise that resolves to true if ad blocking is enabled
   */
  isEnabled(): Promise<boolean>;

  /**
   * Update filter lists
   * @returns Promise that resolves when filters are updated
   */
  updateFilters(): Promise<void>;
}

/**
 * AdBlocker native module
 */
const { AdBlocker } = NativeModules;

if (!AdBlocker) {
  throw new Error(
    'AdBlocker native module is not available. Make sure the native module is properly linked.'
  );
}

/**
 * Typed AdBlocker module instance
 */
export const AdBlockerNative: AdBlockerModule = AdBlocker;

/**
 * AdBlocker class with additional convenience methods
 */
export class AdBlockerAPI {
  private static instance: AdBlockerAPI;
  private initialized = false;
  private enabled = false;

  private constructor() {}

  /**
   * Get singleton instance of AdBlockerAPI
   */
  public static getInstance(): AdBlockerAPI {
    if (!AdBlockerAPI.instance) {
      AdBlockerAPI.instance = new AdBlockerAPI();
    }
    return AdBlockerAPI.instance;
  }

  /**
   * Initialize the AdBlocker
   * @returns Promise that resolves to true if initialization successful
   */
  public async init(): Promise<boolean> {
    try {
      const success = await AdBlockerNative.init();
      this.initialized = success;
      return success;
    } catch (error) {
      console.error('Failed to initialize AdBlocker:', error);
      return false;
    }
  }

  /**
   * Enable ad blocking
   * @returns Promise that resolves when ad blocking is enabled
   */
  public async enable(): Promise<void> {
    if (!this.initialized) {
      throw new Error('AdBlocker must be initialized before enabling');
    }
    
    await AdBlockerNative.enable();
    this.enabled = true;
  }

  /**
   * Disable ad blocking
   * @returns Promise that resolves when ad blocking is disabled
   */
  public async disable(): Promise<void> {
    await AdBlockerNative.disable();
    this.enabled = false;
  }

  /**
   * Toggle ad blocking on/off
   * @returns Promise that resolves to the new enabled state
   */
  public async toggle(): Promise<boolean> {
    if (this.enabled) {
      await this.disable();
    } else {
      await this.enable();
    }
    return this.enabled;
  }

  /**
   * Check if a URL should be blocked
   * @param url The URL to filter
   * @returns Promise that resolves to true if the URL should be blocked
   */
  public async filterRequest(url: string): Promise<boolean> {
    if (!this.initialized || !this.enabled) {
      return false;
    }
    
    try {
      return await AdBlockerNative.filterRequest(url);
    } catch (error) {
      console.error('Failed to filter request:', error);
      return false; // Default to allow on error
    }
  }

  /**
   * Check if ad blocking is currently enabled
   * @returns Promise that resolves to true if ad blocking is enabled
   */
  public async isEnabled(): Promise<boolean> {
    try {
      const nativeEnabled = await AdBlockerNative.isEnabled();
      this.enabled = nativeEnabled;
      return nativeEnabled;
    } catch (error) {
      console.error('Failed to get AdBlocker status:', error);
      return false;
    }
  }

  /**
   * Update filter lists
   * @returns Promise that resolves when filters are updated
   */
  public async updateFilters(): Promise<void> {
    if (!this.initialized) {
      throw new Error('AdBlocker must be initialized before updating filters');
    }
    
    await AdBlockerNative.updateFilters();
  }

  /**
   * Get initialization status
   * @returns true if AdBlocker is initialized
   */
  public isInitialized(): boolean {
    return this.initialized;
  }
}

/**
 * Default export - singleton instance of AdBlockerAPI
 */
export default AdBlockerAPI.getInstance();