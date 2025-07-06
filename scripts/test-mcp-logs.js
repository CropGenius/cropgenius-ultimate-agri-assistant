#!/usr/bin/env node

/**
 * Test MCP connection to Supabase and attempt to retrieve logs
 */

import { spawn } from 'child_process';

const PROJECT_REF = 'bapqlyvfwxsichlyjxpd';
const ACCESS_TOKEN = 'sbp_9aa135978c9f007ac4aefed74a6ccb1ad34b8661';

console.log('🔍 Testing MCP Supabase Log Access...\n');

const testMCPConnection = () => {
  return new Promise((resolve) => {
    const server = spawn('npx', ['@supabase/mcp-server-supabase'], {
      env: {
        ...process.env,
        SUPABASE_PROJECT_REF: PROJECT_REF,
        SUPABASE_ACCESS_TOKEN: ACCESS_TOKEN
      },
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // MCP initialization message
    const initMsg = JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "test-client", version: "1.0.0" }
      }
    }) + '\n';

    // Request to list available tools/resources
    const listToolsMsg = JSON.stringify({
      jsonrpc: "2.0",
      id: 2,
      method: "tools/list"
    }) + '\n';

    server.stdin.write(initMsg);
    setTimeout(() => server.stdin.write(listToolsMsg), 1000);

    let output = '';
    server.stdout.on('data', (data) => {
      output += data.toString();
    });

    setTimeout(() => {
      server.kill();
      resolve(output);
    }, 3000);
  });
};

try {
  const result = await testMCPConnection();
  console.log('📋 MCP Server Response:');
  console.log(result || 'No response received');
  
  console.log('\n💡 To check Supabase logs through MCP:');
  console.log('1. Use an MCP client (Claude Desktop, Cline, etc.)');
  console.log('2. Configure it with .mcp/mcp.json');
  console.log('3. Ask the client to "check Supabase logs" or "show recent database activity"');
  console.log('4. The MCP server should provide access to Supabase management functions');
} catch (error) {
  console.log('❌ MCP Test Failed:', error.message);
}