#import "AdBlockerManager.h"
#import "AdGuardWrapper.h"
#import <os/log.h>

@interface AdBlockerManager ()
@property (nonatomic, strong) AdGuardWrapper *adGuardWrapper;
@property (nonatomic, assign) BOOL isInitialized;
@property (nonatomic, assign) BOOL enabled;
@end

@implementation AdBlockerManager

+ (instancetype)shared {
    static AdBlockerManager *sharedInstance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        sharedInstance = [[AdBlockerManager alloc] init];
    });
    return sharedInstance;
}

- (instancetype)init {
    self = [super init];
    if (self) {
        _isInitialized = NO;
        _enabled = NO;
        _adGuardWrapper = [[AdGuardWrapper alloc] init];
    }
    return self;
}

- (BOOL)initialize {
    @try {
        os_log(OS_LOG_DEFAULT, "Initializing AdBlocker");
        
        // TODO: Initialize AdGuard Core through C++ wrapper
        BOOL success = [self.adGuardWrapper initialize];
        
        if (success) {
            self.isInitialized = YES;
            os_log(OS_LOG_DEFAULT, "AdBlocker initialized successfully");
        } else {
            os_log_error(OS_LOG_DEFAULT, "Failed to initialize AdBlocker");
        }
        
        return success;
    } @catch (NSException *exception) {
        os_log_error(OS_LOG_DEFAULT, "Exception during AdBlocker initialization: %@", exception.reason);
        return NO;
    }
}

- (void)enable {
    if (!self.isInitialized) {
        os_log(OS_LOG_DEFAULT, "AdBlocker not initialized, cannot enable");
        return;
    }
    
    self.enabled = YES;
    os_log(OS_LOG_DEFAULT, "AdBlocker enabled");
}

- (void)disable {
    self.enabled = NO;
    os_log(OS_LOG_DEFAULT, "AdBlocker disabled");
}

- (BOOL)shouldBlockURL:(NSString *)url {
    if (!self.isInitialized || !self.enabled || !url) {
        return NO;
    }
    
    @try {
        os_log(OS_LOG_DEFAULT, "Filtering URL: %@", url);
        
        // TODO: Call native filtering method through C++ wrapper
        BOOL shouldBlock = [self.adGuardWrapper shouldBlockURL:url];
        
        return shouldBlock;
    } @catch (NSException *exception) {
        os_log_error(OS_LOG_DEFAULT, "Error filtering URL %@: %@", url, exception.reason);
        return NO; // Default to allow on error
    }
}

- (BOOL)isEnabled {
    return self.enabled && self.isInitialized;
}

- (BOOL)updateFilters {
    if (!self.isInitialized) {
        os_log(OS_LOG_DEFAULT, "AdBlocker not initialized, cannot update filters");
        return NO;
    }
    
    @try {
        os_log(OS_LOG_DEFAULT, "Updating filter lists");
        
        // TODO: Update filter lists through C++ wrapper
        BOOL success = [self.adGuardWrapper updateFilters];
        
        if (success) {
            os_log(OS_LOG_DEFAULT, "Filter lists updated successfully");
        } else {
            os_log_error(OS_LOG_DEFAULT, "Failed to update filter lists");
        }
        
        return success;
    } @catch (NSException *exception) {
        os_log_error(OS_LOG_DEFAULT, "Exception during filter update: %@", exception.reason);
        return NO;
    }
}

@end