import { NativeModules } from 'react-native';
import {
  AdBlockerError,
  AdBlockerErrorType,
  AdBlockerInitOptions,
  FilterResult,
  AdBlockerConfig,
} from './AdBlocker/types';

/**
 * AdBlocker module interface for TypeScript
 */
export interface AdBlockerModule {
  /**
   * Initialize the AdGuard Core library
   * @param options Optional initialization options
   * @returns Promise that resolves to true if initialization successful
   */
  init(options?: AdBlockerInitOptions): Promise<boolean>;

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

  /**
   * Get current configuration
   * @returns Promise that resolves to current AdBlocker configuration
   */
  getConfig?(): Promise<AdBlockerConfig>;

  /**
   * Set configuration
   * @param config New configuration to apply
   * @returns Promise that resolves when configuration is applied
   */
  setConfig?(config: Partial<AdBlockerConfig>): Promise<void>;
}

/**
 * AdBlocker native module
 */
const { AdBlocker } = NativeModules;

if (!AdBlocker) {
  throw new AdBlockerError(
    AdBlockerErrorType.NATIVE_MODULE_UNAVAILABLE,
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
  private initOptions?: AdBlockerInitOptions;

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
   * @param options Optional initialization options
   * @returns Promise that resolves to true if initialization successful
   */
  public async init(options?: AdBlockerInitOptions): Promise<boolean> {
    try {
      this.initOptions = options;
      const success = await AdBlockerNative.init(options);
      this.initialized = success;
      
      if (!success) {
        throw new AdBlockerError(
          AdBlockerErrorType.INITIALIZATION_FAILED,
          'AdBlocker initialization failed'
        );
      }
      
      return success;
    } catch (error) {
      const adBlockerError = error instanceof AdBlockerError 
        ? error 
        : new AdBlockerError(
            AdBlockerErrorType.INITIALIZATION_FAILED,
            'Failed to initialize AdBlocker',
            error as Error
          );
      
      console.error('Failed to initialize AdBlocker:', adBlockerError);
      this.initialized = false;
      throw adBlockerError;
    }
  }

  /**
   * Enable ad blocking
   * @returns Promise that resolves when ad blocking is enabled
   */
  public async enable(): Promise<void> {
    if (!this.initialized) {
      throw new AdBlockerError(
        AdBlockerErrorType.NOT_INITIALIZED,
        'AdBlocker must be initialized before enabling'
      );
    }
    
    try {
      await AdBlockerNative.enable();
      this.enabled = true;
    } catch (error) {
      throw new AdBlockerError(
        AdBlockerErrorType.ENABLE_FAILED,
        'Failed to enable ad blocking',
        error as Error
      );
    }
  }

  /**
   * Disable ad blocking
   * @returns Promise that resolves when ad blocking is disabled
   */
  public async disable(): Promise<void> {
    try {
      await AdBlockerNative.disable();
      this.enabled = false;
    } catch (error) {
      throw new AdBlockerError(
        AdBlockerErrorType.DISABLE_FAILED,
        'Failed to disable ad blocking',
        error as Error
      );
    }
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
    if (!url || typeof url !== 'string') {
      throw new AdBlockerError(
        AdBlockerErrorType.FILTER_REQUEST_FAILED,
        'Invalid URL provided for filtering'
      );
    }

    if (!this.initialized || !this.enabled) {
      return false;
    }
    
    try {
      return await AdBlockerNative.filterRequest(url);
    } catch (error) {
      const adBlockerError = new AdBlockerError(
        AdBlockerErrorType.FILTER_REQUEST_FAILED,
        `Failed to filter request for URL: ${url}`,
        error as Error
      );
      
      console.error('Failed to filter request:', adBlockerError);
      return false; // Default to allow on error for graceful degradation
    }
  }

  /**
   * Check if a URL should be blocked with detailed result
   * @param url The URL to filter
   * @returns Promise that resolves to FilterResult with detailed information
   */
  public async filterRequestDetailed(url: string): Promise<FilterResult> {
    try {
      const shouldBlock = await this.filterRequest(url);
      return {
        shouldBlock,
        reason: shouldBlock ? 'Matched blocking rule' : 'No matching rule found'
      };
    } catch (error) {
      return {
        shouldBlock: false,
        reason: `Error during filtering: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
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
      throw new AdBlockerError(
        AdBlockerErrorType.STATUS_CHECK_FAILED,
        'Failed to get AdBlocker status',
        error as Error
      );
    }
  }

  /**
   * Update filter lists
   * @returns Promise that resolves when filters are updated
   */
  public async updateFilters(): Promise<void> {
    if (!this.initialized) {
      throw new AdBlockerError(
        AdBlockerErrorType.NOT_INITIALIZED,
        'AdBlocker must be initialized before updating filters'
      );
    }
    
    try {
      await AdBlockerNative.updateFilters();
    } catch (error) {
      throw new AdBlockerError(
        AdBlockerErrorType.UPDATE_FILTERS_FAILED,
        'Failed to update filter lists',
        error as Error
      );
    }
  }

  /**
   * Get current configuration (if supported by native module)
   * @returns Promise that resolves to current AdBlocker configuration
   */
  public async getConfig(): Promise<AdBlockerConfig | null> {
    if (!this.initialized) {
      throw new AdBlockerError(
        AdBlockerErrorType.NOT_INITIALIZED,
        'AdBlocker must be initialized before getting configuration'
      );
    }

    try {
      if (AdBlockerNative.getConfig) {
        return await AdBlockerNative.getConfig();
      }
      return null;
    } catch (error) {
      console.warn('Failed to get AdBlocker configuration:', error);
      return null;
    }
  }

  /**
   * Set configuration (if supported by native module)
   * @param config New configuration to apply
   * @returns Promise that resolves when configuration is applied
   */
  public async setConfig(config: Partial<AdBlockerConfig>): Promise<void> {
    if (!this.initialized) {
      throw new AdBlockerError(
        AdBlockerErrorType.NOT_INITIALIZED,
        'AdBlocker must be initialized before setting configuration'
      );
    }

    try {
      if (AdBlockerNative.setConfig) {
        await AdBlockerNative.setConfig(config);
      } else {
        console.warn('setConfig is not supported by the native module');
      }
    } catch (error) {
      console.error('Failed to set AdBlocker configuration:', error);
      throw error;
    }
  }

  /**
   * Get initialization status
   * @returns true if AdBlocker is initialized
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get current enabled status (cached)
   * @returns true if AdBlocker is enabled (cached value)
   */
  public isEnabledCached(): boolean {
    return this.enabled;
  }

  /**
   * Get initialization options used
   * @returns initialization options or undefined if not initialized
   */
  public getInitOptions(): AdBlockerInitOptions | undefined {
    return this.initOptions;
  }

  /**
   * Reset the AdBlocker instance (for testing purposes)
   * @internal
   */
  public reset(): void {
    this.initialized = false;
    this.enabled = false;
    this.initOptions = undefined;
  }
}

/**
 * Default export - singleton instance of AdBlockerAPI
 */
export default AdBlockerAPI.getInstance();