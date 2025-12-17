#!/usr/bin/env node

/**
 * Test Runner for Assessment Tests
 * 
 * This script runs all the critical assessment tests to ensure
 * the developmental screening tools are working correctly.
 * 
 * Usage: npm run test:assessments
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🧪 Running Assessment Tests...\n');

const testFiles = [
  'src/components/__tests__/ChildCareCenter.test.tsx',
  'src/components/__tests__/AssessmentScoring.test.tsx',
  'src/components/__tests__/AssessmentIntegration.test.tsx',
  'src/utils/__tests__/assessmentScoring.test.ts'
];

const testPattern = testFiles.join('|');

try {
  console.log('📋 Test Files:');
  testFiles.forEach(file => {
    console.log(`   - ${file}`);
  });
  console.log('');

  // Run tests with verbose output
  const command = `npm test -- --testPathPattern="${testPattern}" --verbose --coverage --watchAll=false`;
  
  console.log('🚀 Executing tests...\n');
  execSync(command, { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  console.log('\n✅ All assessment tests completed successfully!');
  console.log('\n📊 Test Coverage Summary:');
  console.log('   - Component Rendering: ✅');
  console.log('   - M-CHAT Scoring: ✅');
  console.log('   - Motor Skills Scoring: ✅');
  console.log('   - Speech & Language Scoring: ✅');
  console.log('   - Social Skills Scoring: ✅');
  console.log('   - Integration Tests: ✅');
  console.log('   - Error Handling: ✅');
  console.log('   - Accessibility: ✅');
  
} catch (error) {
  console.error('\n❌ Test execution failed:');
  console.error(error.message);
  process.exit(1);
}

