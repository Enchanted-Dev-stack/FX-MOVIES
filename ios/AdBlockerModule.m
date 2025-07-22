#import "AdBlockerModule.h"
#import "AdBlockerManager.h"

@implementation AdBlockerModule

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(init:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        @try {
            BOOL success = [[AdBlockerManager shared] initialize];
            dispatch_async(dispatch_get_main_queue(), ^{
                if (success) {
                    resolve(@(YES));
                } else {
                    reject(@"INIT_ERROR", @"Failed to initialize AdBlocker", nil);
                }
            });
        } @catch (NSException *exception) {
            dispatch_async(dispatch_get_main_queue(), ^{
                reject(@"INIT_ERROR", @"Failed to initialize AdBlocker", nil);
            });
        }
    });
}

RCT_EXPORT_METHOD(enable:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    @try {
        [[AdBlockerManager shared] enable];
        resolve([NSNull null]);
    } @catch (NSException *exception) {
        reject(@"ENABLE_ERROR", @"Failed to enable AdBlocker", nil);
    }
}

RCT_EXPORT_METHOD(disable:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    @try {
        [[AdBlockerManager shared] disable];
        resolve([NSNull null]);
    } @catch (NSException *exception) {
        reject(@"DISABLE_ERROR", @"Failed to disable AdBlocker", nil);
    }
}

RCT_EXPORT_METHOD(filterRequest:(NSString *)url
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    @try {
        BOOL shouldBlock = [[AdBlockerManager shared] shouldBlockURL:url];
        resolve(@(shouldBlock));
    } @catch (NSException *exception) {
        reject(@"FILTER_ERROR", @"Failed to filter request", nil);
    }
}

RCT_EXPORT_METHOD(isEnabled:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    @try {
        BOOL enabled = [[AdBlockerManager shared] isEnabled];
        resolve(@(enabled));
    } @catch (NSException *exception) {
        reject(@"STATUS_ERROR", @"Failed to get AdBlocker status", nil);
    }
}

RCT_EXPORT_METHOD(updateFilters:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        @try {
            BOOL success = [[AdBlockerManager shared] updateFilters];
            dispatch_async(dispatch_get_main_queue(), ^{
                if (success) {
                    resolve([NSNull null]);
                } else {
                    reject(@"UPDATE_ERROR", @"Failed to update filters", nil);
                }
            });
        } @catch (NSException *exception) {
            dispatch_async(dispatch_get_main_queue(), ^{
                reject(@"UPDATE_ERROR", @"Failed to update filters", nil);
            });
        }
    });
}

@end