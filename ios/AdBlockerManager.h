#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

/**
 * Core filtering logic manager for AdBlocker on iOS
 * Handles communication with native AdGuard Core library
 */
@interface AdBlockerManager : NSObject

+ (instancetype)shared;

/**
 * Initialize the AdGuard Core library
 * @return YES if initialization successful
 */
- (BOOL)initialize;

/**
 * Enable ad blocking functionality
 */
- (void)enable;

/**
 * Disable ad blocking functionality
 */
- (void)disable;

/**
 * Check if a URL should be blocked
 * @param url The URL to check
 * @return YES if the URL should be blocked
 */
- (BOOL)shouldBlockURL:(NSString *)url;

/**
 * Check if ad blocking is currently enabled
 * @return YES if enabled
 */
- (BOOL)isEnabled;

/**
 * Update filter lists
 * @return YES if update successful
 */
- (BOOL)updateFilters;

@end

NS_ASSUME_NONNULL_END