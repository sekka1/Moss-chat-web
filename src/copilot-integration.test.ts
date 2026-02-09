#!/usr/bin/env ts-node
/* eslint-disable no-console */
/**
 * Integration test for GitHub Copilot SDK
 * This script tests the actual Copilot SDK integration
 *
 * Requirements:
 * - Active GitHub Copilot subscription
 * - GitHub CLI authenticated (gh auth login)
 * - GitHub Copilot configured (gh copilot login)
 *
 * Usage:
 *   npm run test:integration
 *
 * This test will:
 * 1. Ask "what is a live moss wall?" to Copilot
 * 2. Verify we get a response
 * 3. Display the response for manual verification
 */

import { CopilotService } from './copilot-service';

async function runIntegrationTest(): Promise<void> {
  console.log('=== GitHub Copilot SDK Integration Test ===\n');

  const copilotService = new CopilotService();

  try {
    console.log('1. Initializing Copilot SDK...');
    await copilotService.initialize();
    console.log('   ✓ Copilot SDK initialized successfully\n');

    const question = 'what is a live moss wall?';
    console.log(`2. Asking Copilot: "${question}"`);

    const response = await copilotService.getResponse(question);

    console.log('\n3. Response received:');
    console.log('   ---------------------------------');
    console.log(`   ${response}`);
    console.log('   ---------------------------------\n');

    // Verify the response
    if (!response || response.length === 0) {
      throw new Error('Received empty response from Copilot');
    }

    const lowerResponse = response.toLowerCase();
    const hasRelevantContent =
      lowerResponse.includes('moss') ||
      lowerResponse.includes('wall') ||
      lowerResponse.includes('plant') ||
      lowerResponse.includes('green');

    if (!hasRelevantContent) {
      console.log('   ⚠ Warning: Response may not be relevant to moss walls');
    } else {
      console.log('   ✓ Response contains relevant content about moss walls');
    }

    console.log('\n=== Integration Test PASSED ===\n');
    process.exit(0);

  } catch (error) {
    console.error('\n=== Integration Test FAILED ===');

    if (error instanceof Error) {
      console.error(`\nError: ${error.message}\n`);

      if (error.message.includes('Copilot client is not initialized') ||
          error.message.includes('Failed to initialize Copilot client')) {
        console.error('GitHub Copilot SDK is not available. Please ensure:');
        console.error('  1. You have an active GitHub Copilot subscription');
        console.error('  2. GitHub CLI is installed and authenticated:');
        console.error('     gh auth login');
        console.error('  3. GitHub Copilot is configured:');
        console.error('     gh copilot login\n');
      }
    } else {
      console.error(error);
    }

    process.exit(1);

  } finally {
    console.log('4. Shutting down Copilot service...');
    await copilotService.shutdown();
    console.log('   ✓ Service shut down\n');
  }
}

// Run the integration test
runIntegrationTest().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
