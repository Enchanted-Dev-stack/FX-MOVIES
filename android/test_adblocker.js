/**
 * Simple test script to demonstrate AdBlocker functionality
 * This can be run in a React Native environment to test the integration
 */

import { AdBlocker } from '../src/modules/AdBlocker';

async function testAdBlockerIntegration() {
    console.log('🚀 Starting AdBlocker integration test...');
    
    try {
        // Test initialization
        console.log('📋 Testing initialization...');
        const initResult = await AdBlocker.init();
        console.log(`✅ Initialization result: ${initResult}`);
        
        if (initResult) {
            // Test enable/disable
            console.log('🔧 Testing enable/disable...');
            await AdBlocker.enable();
            const isEnabled = await AdBlocker.isEnabled();
            console.log(`✅ Enabled: ${isEnabled}`);
            
            // Test URL filtering
            console.log('🔍 Testing URL filtering...');
            const testUrls = [
                'https://doubleclick.net/ads/script.js',
                'https://example.com/content/article.html',
                'https://googleadservices.com/pagead/ads',
                'https://github.com/user/repo',
                'https://googlesyndication.com/safeframe/ads',
                'https://google-analytics.com/analytics.js',
                'https://facebook.com/tr?id=123456',
                'https://stackoverflow.com/questions/123'
            ];
            
            for (const url of testUrls) {
                const shouldBlock = await AdBlocker.filterRequest(url);
                const status = shouldBlock ? '🚫 BLOCKED' : '✅ ALLOWED';
                console.log(`${status} ${url}`);
            }
            
            // Test filter updates
            console.log('🔄 Testing filter updates...');
            await AdBlocker.updateFilters();
            console.log('✅ Filter update completed');
            
            // Test disable
            console.log('⏹️ Testing disable...');
            await AdBlocker.disable();
            const isDisabled = !(await AdBlocker.isEnabled());
            console.log(`✅ Disabled: ${isDisabled}`);
            
            console.log('🎉 AdBlocker integration test completed successfully!');
            
        } else {
            console.log('❌ AdBlocker initialization failed');
        }
        
    } catch (error) {
        console.error('❌ AdBlocker integration test failed:', error);
    }
}

// Export for use in React Native app
export { testAdBlockerIntegration };

// Auto-run if this script is executed directly
if (typeof require !== 'undefined' && require.main === module) {
    testAdBlockerIntegration();
}