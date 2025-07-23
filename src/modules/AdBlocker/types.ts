/**
 * AdBlocker error types and interfaces
 */

/**
 * AdBlocker specific error types
 */
export enum AdBlockerErrorType {
  INITIALIZATION_FAILED = 'INITIALIZATION_FAILED',
  NOT_INITIALIZED = 'NOT_INITIALIZED',
  NATIVE_MODULE_UNAVAILABLE = 'NATIVE_MODULE_UNAVAILABLE',
  FILTER_REQUEST_FAILED = 'FILTER_REQUEST_FAILED',
  ENABLE_FAILED = 'ENABLE_FAILED',
  DISABLE_FAILED = 'DISABLE_FAILED',
  UPDATE_FILTERS_FAILED = 'UPDATE_FILTERS_FAILED',
  STATUS_CHECK_FAILED = 'STATUS_CHECK_FAILED',
}

/**
 * Custom AdBlocker error class
 */
export class AdBlockerError extends Error {
  public readonly type: AdBlockerErrorType;
  public readonly originalError?: Error;

  constructor(type: AdBlockerErrorType, message: string, originalError?: Error) {
    super(message);
    this.name = 'AdBlockerError';
    this.type = type;
    this.originalError = originalError;
  }
}

/**
 * Filter rule interface
 */
export interface FilterRule {
  id: string;
  pattern: string;
  type: 'block' | 'allow' | 'redirect';
  domains?: string[];
  contentTypes?: string[];
  isEnabled: boolean;
}

/**
 * Filter list interface
 */
export interface FilterList {
  id: string;
  name: string;
  url: string;
  version: string;
  lastUpdated: Date;
  rules: FilterRule[];
  isEnabled: boolean;
}

/**
 * AdBlocker configuration interface
 */
export interface AdBlockerConfig {
  isEnabled: boolean;
  filterLists: FilterList[];
  customRules: FilterRule[];
  whitelistedDomains: string[];
  performanceMode: 'balanced' | 'aggressive' | 'minimal';
}

/**
 * AdBlocker initialization options
 */
export interface AdBlockerInitOptions {
  enableLogging?: boolean;
  performanceMode?: 'balanced' | 'aggressive' | 'minimal';
  customFilterLists?: string[];
}

/**
 * Filter request result interface
 */
export interface FilterResult {
  shouldBlock: boolean;
  matchedRule?: FilterRule;
  reason?: string;
}