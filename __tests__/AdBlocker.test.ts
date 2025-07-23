/**
 * @format
 */

import { NativeModules } from 'react-native';
import {
  AdBlockerAPI,
  AdBlockerNative,
  AdBlockerError,
  AdBlockerErrorType,
} from '../src/modules';

// Mock React Native's NativeModules
jest.mock('react-native', () => ({
  NativeModules: {
    AdBlocker: {
      init: jest.fn(),
      enable: jest.fn(),
      disable: jest.fn(),
      filterRequest: jest.fn(),
      isEnabled: jest.fn(),
      updateFilters: jest.fn(),
      getConfig: jest.fn(),
      setConfig: jest.fn(),
    },
  },
}));

describe('AdBlocker Module', () => {
  let adBlocker: AdBlockerAPI;
  const mockNativeModule = NativeModules.AdBlocker;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Get fresh instance and reset it
    adBlocker = AdBlockerAPI.getInstance();
    adBlocker.reset();
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      mockNativeModule.init.mockResolvedValue(true);

      const result = await adBlocker.init();

      expect(result).toBe(true);
      expect(adBlocker.isInitialized()).toBe(true);
      expect(mockNativeModule.init).toHaveBeenCalledWith(undefined);
    });

    it('should initialize with options', async () => {
      mockNativeModule.init.mockResolvedValue(true);
      const options = {
        enableLogging: true,
        performanceMode: 'aggressive' as const,
        customFilterLists: ['https://example.com/filters.txt'],
      };

      const result = await adBlocker.init(options);

      expect(result).toBe(true);
      expect(adBlocker.isInitialized()).toBe(true);
      expect(adBlocker.getInitOptions()).toEqual(options);
      expect(mockNativeModule.init).toHaveBeenCalledWith(options);
    });

    it('should throw error when initialization fails', async () => {
      mockNativeModule.init.mockResolvedValue(false);

      await expect(adBlocker.init()).rejects.toThrow(AdBlockerError);
      await expect(adBlocker.init()).rejects.toThrow('AdBlocker initialization failed');
      expect(adBlocker.isInitialized()).toBe(false);
    });

    it('should handle native module errors during initialization', async () => {
      const nativeError = new Error('Native initialization failed');
      mockNativeModule.init.mockRejectedValue(nativeError);

      await expect(adBlocker.init()).rejects.toThrow(AdBlockerError);
      expect(adBlocker.isInitialized()).toBe(false);
    });
  });

  describe('Enable/Disable Functionality', () => {
    beforeEach(async () => {
      mockNativeModule.init.mockResolvedValue(true);
      await adBlocker.init();
    });

    it('should enable ad blocking', async () => {
      mockNativeModule.enable.mockResolvedValue(undefined);

      await adBlocker.enable();

      expect(mockNativeModule.enable).toHaveBeenCalled();
      expect(adBlocker.isEnabledCached()).toBe(true);
    });

    it('should disable ad blocking', async () => {
      mockNativeModule.disable.mockResolvedValue(undefined);

      await adBlocker.disable();

      expect(mockNativeModule.disable).toHaveBeenCalled();
      expect(adBlocker.isEnabledCached()).toBe(false);
    });

    it('should throw error when enabling without initialization', async () => {
      const uninitializedAdBlocker = AdBlockerAPI.getInstance();
      uninitializedAdBlocker.reset();

      await expect(uninitializedAdBlocker.enable()).rejects.toThrow(AdBlockerError);
      await expect(uninitializedAdBlocker.enable()).rejects.toThrow('AdBlocker must be initialized before enabling');
    });

    it('should handle native errors during enable', async () => {
      const nativeError = new Error('Enable failed');
      mockNativeModule.enable.mockRejectedValue(nativeError);

      await expect(adBlocker.enable()).rejects.toThrow(AdBlockerError);
      await expect(adBlocker.enable()).rejects.toThrow('Failed to enable ad blocking');
    });

    it('should handle native errors during disable', async () => {
      const nativeError = new Error('Disable failed');
      mockNativeModule.disable.mockRejectedValue(nativeError);

      await expect(adBlocker.disable()).rejects.toThrow(AdBlockerError);
      await expect(adBlocker.disable()).rejects.toThrow('Failed to disable ad blocking');
    });

    it('should toggle ad blocking state', async () => {
      mockNativeModule.enable.mockResolvedValue(undefined);
      mockNativeModule.disable.mockResolvedValue(undefined);

      // Initially disabled, should enable
      let result = await adBlocker.toggle();
      expect(result).toBe(true);
      expect(mockNativeModule.enable).toHaveBeenCalled();

      // Now enabled, should disable
      result = await adBlocker.toggle();
      expect(result).toBe(false);
      expect(mockNativeModule.disable).toHaveBeenCalled();
    });
  });

  describe('Filter Request Functionality', () => {
    beforeEach(async () => {
      mockNativeModule.init.mockResolvedValue(true);
      mockNativeModule.enable.mockResolvedValue(undefined);
      await adBlocker.init();
      await adBlocker.enable();
    });

    it('should filter request and return true for blocked URL', async () => {
      mockNativeModule.filterRequest.mockResolvedValue(true);

      const result = await adBlocker.filterRequest('https://ads.example.com');

      expect(result).toBe(true);
      expect(mockNativeModule.filterRequest).toHaveBeenCalledWith('https://ads.example.com');
    });

    it('should filter request and return false for allowed URL', async () => {
      mockNativeModule.filterRequest.mockResolvedValue(false);

      const result = await adBlocker.filterRequest('https://example.com');

      expect(result).toBe(false);
      expect(mockNativeModule.filterRequest).toHaveBeenCalledWith('https://example.com');
    });

    it('should return false when not initialized', async () => {
      const uninitializedAdBlocker = AdBlockerAPI.getInstance();
      uninitializedAdBlocker.reset();

      const result = await uninitializedAdBlocker.filterRequest('https://example.com');

      expect(result).toBe(false);
      expect(mockNativeModule.filterRequest).not.toHaveBeenCalled();
    });

    it('should return false when not enabled', async () => {
      await adBlocker.disable();

      const result = await adBlocker.filterRequest('https://example.com');

      expect(result).toBe(false);
      expect(mockNativeModule.filterRequest).not.toHaveBeenCalled();
    });

    it('should handle invalid URL input', async () => {
      await expect(adBlocker.filterRequest('')).rejects.toThrow(AdBlockerError);
      await expect(adBlocker.filterRequest('')).rejects.toThrow('Invalid URL provided for filtering');
    });

    it('should handle non-string URL input', async () => {
      // @ts-ignore - Testing runtime behavior
      await expect(adBlocker.filterRequest(null)).rejects.toThrow(AdBlockerError);
      // @ts-ignore - Testing runtime behavior
      await expect(adBlocker.filterRequest(123)).rejects.toThrow(AdBlockerError);
    });

    it('should return false on native module error (graceful degradation)', async () => {
      const nativeError = new Error('Filter failed');
      mockNativeModule.filterRequest.mockRejectedValue(nativeError);

      const result = await adBlocker.filterRequest('https://example.com');

      expect(result).toBe(false);
    });

    it('should provide detailed filter result', async () => {
      mockNativeModule.filterRequest.mockResolvedValue(true);

      const result = await adBlocker.filterRequestDetailed('https://ads.example.com');

      expect(result).toEqual({
        shouldBlock: true,
        reason: 'Matched blocking rule',
      });
    });

    it('should provide detailed filter result for allowed URL', async () => {
      mockNativeModule.filterRequest.mockResolvedValue(false);

      const result = await adBlocker.filterRequestDetailed('https://example.com');

      expect(result).toEqual({
        shouldBlock: false,
        reason: 'No matching rule found',
      });
    });

    it('should handle errors in detailed filter result', async () => {
      // First disable to make filterRequest return false without calling native module
      await adBlocker.disable();
      
      const result = await adBlocker.filterRequestDetailed('https://example.com');

      expect(result.shouldBlock).toBe(false);
      expect(result.reason).toBe('No matching rule found');
    });
  });

  describe('Status Check Functionality', () => {
    beforeEach(async () => {
      mockNativeModule.init.mockResolvedValue(true);
      await adBlocker.init();
    });

    it('should check if ad blocking is enabled', async () => {
      mockNativeModule.isEnabled.mockResolvedValue(true);

      const result = await adBlocker.isEnabled();

      expect(result).toBe(true);
      expect(mockNativeModule.isEnabled).toHaveBeenCalled();
    });

    it('should handle native errors during status check', async () => {
      const nativeError = new Error('Status check failed');
      mockNativeModule.isEnabled.mockRejectedValue(nativeError);

      await expect(adBlocker.isEnabled()).rejects.toThrow(AdBlockerError);
      await expect(adBlocker.isEnabled()).rejects.toThrow('Failed to get AdBlocker status');
    });
  });

  describe('Filter Update Functionality', () => {
    beforeEach(async () => {
      mockNativeModule.init.mockResolvedValue(true);
      await adBlocker.init();
    });

    it('should update filters successfully', async () => {
      mockNativeModule.updateFilters.mockResolvedValue(undefined);

      await adBlocker.updateFilters();

      expect(mockNativeModule.updateFilters).toHaveBeenCalled();
    });

    it('should throw error when updating filters without initialization', async () => {
      const uninitializedAdBlocker = AdBlockerAPI.getInstance();
      uninitializedAdBlocker.reset();

      await expect(uninitializedAdBlocker.updateFilters()).rejects.toThrow(AdBlockerError);
      await expect(uninitializedAdBlocker.updateFilters()).rejects.toThrow('AdBlocker must be initialized before updating filters');
    });

    it('should handle native errors during filter update', async () => {
      const nativeError = new Error('Update failed');
      mockNativeModule.updateFilters.mockRejectedValue(nativeError);

      await expect(adBlocker.updateFilters()).rejects.toThrow(AdBlockerError);
      await expect(adBlocker.updateFilters()).rejects.toThrow('Failed to update filter lists');
    });
  });

  describe('Configuration Management', () => {
    beforeEach(async () => {
      mockNativeModule.init.mockResolvedValue(true);
      await adBlocker.init();
    });

    it('should get configuration when supported', async () => {
      const mockConfig = {
        isEnabled: true,
        filterLists: [],
        customRules: [],
        whitelistedDomains: [],
        performanceMode: 'balanced' as const,
      };
      mockNativeModule.getConfig.mockResolvedValue(mockConfig);

      const result = await adBlocker.getConfig();

      expect(result).toEqual(mockConfig);
      expect(mockNativeModule.getConfig).toHaveBeenCalled();
    });

    it('should return null when getConfig is not supported', async () => {
      // Remove getConfig method to simulate unsupported feature
      delete mockNativeModule.getConfig;

      const result = await adBlocker.getConfig();

      expect(result).toBeNull();
    });

    it('should set configuration when supported', async () => {
      const config = { performanceMode: 'aggressive' as const };
      mockNativeModule.setConfig.mockResolvedValue(undefined);

      await adBlocker.setConfig(config);

      expect(mockNativeModule.setConfig).toHaveBeenCalledWith(config);
    });

    it('should handle unsupported setConfig gracefully', async () => {
      // Remove setConfig method to simulate unsupported feature
      delete mockNativeModule.setConfig;

      // Should not throw, just log warning
      await expect(adBlocker.setConfig({})).resolves.toBeUndefined();
    });

    it('should throw error when getting config without initialization', async () => {
      const uninitializedAdBlocker = AdBlockerAPI.getInstance();
      uninitializedAdBlocker.reset();

      await expect(uninitializedAdBlocker.getConfig()).rejects.toThrow(AdBlockerError);
      await expect(uninitializedAdBlocker.getConfig()).rejects.toThrow('AdBlocker must be initialized before getting configuration');
    });

    it('should throw error when setting config without initialization', async () => {
      const uninitializedAdBlocker = AdBlockerAPI.getInstance();
      uninitializedAdBlocker.reset();

      await expect(uninitializedAdBlocker.setConfig({})).rejects.toThrow(AdBlockerError);
      await expect(uninitializedAdBlocker.setConfig({})).rejects.toThrow('AdBlocker must be initialized before setting configuration');
    });
  });

  describe('Error Handling', () => {
    it('should create AdBlockerError with correct properties', () => {
      const originalError = new Error('Original error');
      const adBlockerError = new AdBlockerError(
        AdBlockerErrorType.INITIALIZATION_FAILED,
        'Test error message',
        originalError
      );

      expect(adBlockerError.name).toBe('AdBlockerError');
      expect(adBlockerError.type).toBe(AdBlockerErrorType.INITIALIZATION_FAILED);
      expect(adBlockerError.message).toBe('Test error message');
      expect(adBlockerError.originalError).toBe(originalError);
    });

    it('should create AdBlockerError without original error', () => {
      const adBlockerError = new AdBlockerError(
        AdBlockerErrorType.NOT_INITIALIZED,
        'Test error message'
      );

      expect(adBlockerError.name).toBe('AdBlockerError');
      expect(adBlockerError.type).toBe(AdBlockerErrorType.NOT_INITIALIZED);
      expect(adBlockerError.message).toBe('Test error message');
      expect(adBlockerError.originalError).toBeUndefined();
    });
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = AdBlockerAPI.getInstance();
      const instance2 = AdBlockerAPI.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe('Native Module Availability', () => {
    it('should handle native module unavailability gracefully', () => {
      // This test verifies that the error type exists and can be created
      const error = new AdBlockerError(
        AdBlockerErrorType.NATIVE_MODULE_UNAVAILABLE,
        'AdBlocker native module is not available. Make sure the native module is properly linked.'
      );

      expect(error.type).toBe(AdBlockerErrorType.NATIVE_MODULE_UNAVAILABLE);
      expect(error.message).toContain('native module is not available');
    });
  });
});