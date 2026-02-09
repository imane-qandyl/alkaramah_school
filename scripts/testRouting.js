/**
 * Test script to verify routing configuration
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Expo Router Configuration...\n');

// Check if root layout exists
const rootLayoutPath = path.join(__dirname, '..', 'app', '_layout.tsx');
const rootLayoutExists = fs.existsSync(rootLayoutPath);
console.log(`${rootLayoutExists ? '✅' : '❌'} Root Layout (_layout.tsx): ${rootLayoutExists ? 'EXISTS' : 'MISSING'}`);

// Check if create-profile exists
const createProfilePath = path.join(__dirname, '..', 'app', 'create-profile.tsx');
const createProfileExists = fs.existsSync(createProfilePath);
console.log(`${createProfileExists ? '✅' : '❌'} Create Profile Route: ${createProfileExists ? 'EXISTS' : 'MISSING'}`);

// Check if tabs layout exists
const tabsLayoutPath = path.join(__dirname, '..', 'app', '(tabs)', '_layout.tsx');
const tabsLayoutExists = fs.existsSync(tabsLayoutPath);
console.log(`${tabsLayoutExists ? '✅' : '❌'} Tabs Layout: ${tabsLayoutExists ? 'EXISTS' : 'MISSING'}`);

// Check if student detail route exists
const studentDetailPath = path.join(__dirname, '..', 'app', 'student-detail', '[id].tsx');
const studentDetailExists = fs.existsSync(studentDetailPath);
console.log(`${studentDetailExists ? '✅' : '❌'} Student Detail Route: ${studentDetailExists ? 'EXISTS' : 'MISSING'}`);

// Check package.json configuration
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const hasExpoRouterEntry = packageJson.main === 'expo-router/entry';
console.log(`${hasExpoRouterEntry ? '✅' : '❌'} Package.json Entry Point: ${hasExpoRouterEntry ? 'CORRECT' : 'INCORRECT'}`);

// Check app.json configuration
const appJsonPath = path.join(__dirname, '..', 'app.json');
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
const hasExpoRouterPlugin = appJson.expo.plugins && appJson.expo.plugins.includes('expo-router');
console.log(`${hasExpoRouterPlugin ? '✅' : '❌'} App.json Plugin: ${hasExpoRouterPlugin ? 'CONFIGURED' : 'MISSING'}`);

// Summary
const allChecks = [
  rootLayoutExists,
  createProfileExists,
  tabsLayoutExists,
  studentDetailExists,
  hasExpoRouterEntry,
  hasExpoRouterPlugin
];

const allPassed = allChecks.every(Boolean);
console.log(`\n${allPassed ? '🎉' : '⚠️'} Overall Status: ${allPassed ? 'ROUTING CONFIGURED CORRECTLY' : 'ISSUES DETECTED'}`);

if (allPassed) {
  console.log('✅ All routing checks passed! The "unmatched route" error should be resolved.');
  console.log('📱 You should now be able to navigate to the create profile screen.');
} else {
  console.log('❌ Some routing issues detected. Please check the failed items above.');
}

console.log('\n📋 Expected Route Structure:');
console.log('- / (root with tabs)');
console.log('- /(tabs)/students (students list)');
console.log('- /create-profile (manual profile creation)');
console.log('- /student-detail/[id] (profile details)');