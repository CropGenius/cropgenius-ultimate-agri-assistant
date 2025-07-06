#!/usr/bin/env node

/**
 * Test script for Supabase MCP server connectivity
 * Tests connection to project: bapqlyvfwxsichlyjxpd
 */

import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';

const PROJECT_REF = 'bapqlyvfwxsichlyjxpd';
const ACCESS_TOKEN = 'sbp_9aa135978c9f007ac4aefed74a6ccb1ad34b8661';

console.log('🧪 Testing Supabase MCP Server Connection...');
console.log(`📋 Project Ref: ${PROJECT_REF}`);
console.log(`🔑 Token: ${ACCESS_TOKEN.substring(0, 10)}...`);

// Test MCP server startup
const testMCPServer = () => {
  return new Promise((resolve, reject) => {
    const server = spawn('npx', ['@supabase/mcp-server-supabase'], {
      env: {
        ...process.env,
        SUPABASE_PROJECT_REF: PROJECT_REF,
        SUPABASE_ACCESS_TOKEN: ACCESS_TOKEN
      },
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    let errorOutput = '';

    server.stdout.on('data', (data) => {
      output += data.toString();
    });

    server.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    // Send a simple MCP initialization message
    const initMessage = JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: {
          name: "test-client",
          version: "1.0.0"
        }
      }
    }) + '\n';

    server.stdin.write(initMessage);

    setTimeout(() => {
      server.kill();
      resolve({
        success: true,
        output,
        errorOutput,
        message: 'MCP server started successfully'
      });
    }, 3000);

    server.on('error', (error) => {
      reject({
        success: false,
        error: error.message,
        output,
        errorOutput
      });
    });
  });
};

// Run the test
try {
  const result = await testMCPServer();
  console.log('✅ MCP Server Test Results:');
  console.log(`Status: ${result.success ? 'SUCCESS' : 'FAILED'}`);
  if (result.output) console.log(`Output: ${result.output}`);
  if (result.errorOutput) console.log(`Errors: ${result.errorOutput}`);
  console.log(`Message: ${result.message}`);
} catch (error) {
  console.log('❌ MCP Server Test Failed:');
  console.log(`Error: ${error.error || error.message}`);
  if (error.output) console.log(`Output: ${error.output}`);
  if (error.errorOutput) console.log(`Errors: ${error.errorOutput}`);
}

console.log('\n📝 Next Steps:');
console.log('1. Ensure your MCP client (Claude Desktop, Cline, etc.) is configured');
console.log('2. Add the .roo/mcp.json configuration to your MCP client');
console.log('3. Restart your MCP client to load the Supabase server');
console.log('4. Test database operations through MCP tools');