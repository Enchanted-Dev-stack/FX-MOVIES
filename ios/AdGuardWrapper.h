#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

/**
 * Objective-C++ wrapper for AdGuard Core C++ library
 * Provides a bridge between Objective-C and C++ code
 */
@interface AdGuardWrapper : NSObject

/**
 * Initialize the AdGuard Core library
 * @return YES if initialization successful
 */
- (BOOL)initialize;

/**
 * Check if a URL should be blocked
 * @param url The URL to check
 * @return YES if the URL should be blocked
 */
- (BOOL)shouldBlockURL:(NSString *)url;

/**
 * Update filter lists
 * @return YES if update successful
 */
- (BOOL)updateFilters;

/**
 * Cleanup AdGuard Core resources
 */
- (void)cleanup;

@end

NS_ASSUME_NONNULL_END