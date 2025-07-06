# 🔗 Supabase MCP Server Integration

## Overview

The CropGenius project is now configured with Supabase MCP (Model Context Protocol) server integration, enabling direct database operations through MCP-compatible clients.

## Configuration Details

- **Package**: `@supabase/mcp-server-supabase@0.4.5` (latest)
- **Project Reference**: `bapqlyvfwxsichlyjxpd`
- **Access Token**: Configured (secured)
- **Configuration File**: `.roo/mcp.json`

## MCP Server Configuration

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["@supabase/mcp-server-supabase"],
      "env": {
        "SUPABASE_PROJECT_REF": "bapqlyvfwxsichlyjxpd",
        "SUPABASE_ACCESS_TOKEN": "sbp_9aa135978c9f007ac4aefed74a6ccb1ad34b8661"
      }
    }
  }
}
```

## Available Capabilities

The Supabase MCP server provides the following capabilities:

### Database Operations
- **Query Execution**: Run SQL queries against the CropGenius database
- **Table Management**: Create, modify, and manage database tables
- **Data Manipulation**: Insert, update, delete records
- **Schema Inspection**: View table structures and relationships

### CropGenius-Specific Tables
- `profiles` - User profiles and farm information
- `farms` - Farm details and locations
- `fields` - Individual field data with crop information
- `weather_data` - Weather records and forecasts
- `tasks` - Farm management tasks
- `market_listings` - Market price data

## Usage with MCP Clients

### Claude Desktop
1. Add the `.roo/mcp.json` configuration to your Claude Desktop settings
2. Restart Claude Desktop
3. The Supabase server will be available for database operations

### Cline (VS Code Extension)
1. Configure Cline to use the MCP server
2. Reference the Supabase server in your prompts
3. Execute database queries through natural language

### Other MCP Clients
Use the configuration from `.roo/mcp.json` in your MCP client settings.

## Security Considerations

- Access token is configured with appropriate permissions
- Row Level Security (RLS) is enabled on all tables
- Database operations respect user authentication context
- Sensitive data is protected through Supabase security policies

## Testing

Run the verification script to ensure proper setup:

```bash
node scripts/verify-mcp-setup.js
```

## Troubleshooting

### Common Issues

1. **MCP Server Not Found**
   - Ensure `@supabase/mcp-server-supabase` is installed
   - Check that `npx` can locate the package

2. **Authentication Errors**
   - Verify the access token is correct
   - Check project reference matches your Supabase project

3. **Connection Issues**
   - Ensure your MCP client is properly configured
   - Restart the MCP client after configuration changes

### Fallback to Version 0.4.4

If the latest version causes compatibility issues:

```bash
npm uninstall @supabase/mcp-server-supabase
npm install @supabase/mcp-server-supabase@0.4.4 --save-dev
```

## Integration Benefits

- **Direct Database Access**: Query CropGenius data through natural language
- **Real-time Operations**: Execute database operations in real-time
- **Agricultural Intelligence**: Combine MCP with AI for smart farming insights
- **Development Efficiency**: Streamlined database operations during development

## Next Steps

1. Configure your preferred MCP client
2. Test database operations through MCP
3. Integrate MCP capabilities into development workflow
4. Explore advanced database operations for agricultural intelligence

---

**Status**: ✅ Ready for Production Use
**Last Updated**: January 2025
**Maintained By**: CropGenius Development Team