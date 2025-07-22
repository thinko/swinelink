#!/usr/bin/env node

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const pbClient = require('./porkbunClient');

let debugMode = false;
let friendlyMode = false;

// Debug helper - logs when --debug flag is passed or SWINE_DEBUG env var is set
const debug = (...args: any[]) => {
  if (debugMode || process.env.SWINE_DEBUG) {
    console.error('[SWINE_DEBUG]', ...args);
  }
};

// Friendly output formatters for different response types
const formatters = {
  // Domain availability check
  checkAvailability: (data) => {
    const { response } = data;
    const available = response.avail === 'yes';
    const premium = response.premium === 'yes';
    
    let output = `🔍 Domain: ${data.queriedDomain || response.domain || 'N/A'}\n`;
    output += `🏷️  TLD: ${data.recognizedTLD ? `.${data.recognizedTLD}` : 'N/A'}\n`;
    output += `📍 Status: ${available ? '✅ Available' : '❌ Not Available'}\n`;
    
    if (available) {
      output += `💰 Price: $${response.price}${premium ? ' (Premium Domain)' : ''}\n`;
      if (response.firstYearPromo === 'yes') {
        output += `🎉 First year promotional pricing available!\n`;
      }
      if (response.additional) {
        output += `🔄 Renewal: $${response.additional.renewal?.price}\n`;
        output += `📦 Transfer: $${response.additional.transfer?.price}\n`;
      }
    }
    
    if (data.limits) {
      const { used, limit, TTL } = data.limits;
      output += `⏱️  Rate Limit: ${used}/${limit} checks (${TTL}s cooldown)\n`;
    }
    
    if (data.pricingDisclaimer) {
      output += `\n⚠️  ${data.pricingDisclaimer}\n`;
    }
    
    return output;
  },

  // Domain listing
  listDomains: (data) => {
    if (!data.domains || data.domains.length === 0) {
      return '📋 No domains found in your account.\n';
    }
    
    let output = `📋 Your Domains (${data.domains.length}):\n\n`;
    data.domains.forEach((domain, index) => {
      output += `${index + 1}. ${domain.domain}\n`;
      output += `   📅 Created: ${domain.createDate || 'N/A'}\n`;
      output += `   📅 Expires: ${domain.expireDate || 'N/A'}\n`;
      output += `   🔒 Status: ${domain.status || 'N/A'}\n`;
      if (domain.autoRenew === 'yes') output += `   🔄 Auto-renew enabled\n`;
      output += '\n';
    });
    
    return output;
  },

  // DNS records listing
  dnsListRecords: (data) => {
    if (!data.records || data.records.length === 0) {
      return '📋 No DNS records found for this domain.\n';
    }
    
    let output = `📋 DNS Records (${data.records.length}):\n\n`;
    
    // Group by type for better readability
    const recordsByType = {};
    data.records.forEach(record => {
      if (!recordsByType[record.type]) {
        recordsByType[record.type] = [];
      }
      recordsByType[record.type].push(record);
    });
    
    Object.keys(recordsByType).sort().forEach(type => {
      output += `🏷️  ${type} Records:\n`;
      recordsByType[type].forEach(record => {
        const name = record.name || '@';
        output += `   ${name} → ${record.content}`;
        if (record.ttl) output += ` (TTL: ${record.ttl}s)`;
        if (record.prio) output += ` (Priority: ${record.prio})`;
        output += `\n`;
      });
      output += '\n';
    });
    
    return output;
  },

  // Pricing information
  getPricing: (data: any, filterTlds = [], params: any = {}) => {
    if (!data.pricing || Object.keys(data.pricing).length === 0) {
      return '💰 No pricing information available.\n';
    }
    
    const debugMode = params.debugMode;
    
    // Helper function to intelligently extract TLD using the actual pricing data
    const extractTld = (input, validTlds) => {
      if (!input || typeof input !== 'string') return null;
      
      // Remove leading dots and trim
      let domain = input.trim().replace(/^\.+/, '');
      if (!domain) return null;
      
      // If input is already just a TLD (no dots or single label), check if it's valid
      if (!domain.includes('.') || domain.split('.').length === 1) {
        const result = validTlds.includes(domain) ? domain : null;
        return result;
      }
      
      // For domains like "example.co.uk", "test.com.mx", etc.
      // Find the longest matching TLD suffix
      const parts = domain.split('.');
      
      // Try progressively longer suffixes (co.uk, then uk)
      for (let i = 1; i < parts.length; i++) {
        const candidateTld = parts.slice(i).join('.');
        if (validTlds.includes(candidateTld)) {
          return candidateTld;
        }
      }
      
      // If no multi-label TLD found, try the last part
      const lastPart = parts[parts.length - 1];
      const result = validTlds.includes(lastPart) ? lastPart : null;
      return result;
    };
    
    // Helper function to parse TLD input with complex delimiters and intelligent TLD extraction
    const parseTlds = (input) => {
      if (!input || input.length === 0) return [];
      
      // Get all valid TLDs from pricing data for intelligent extraction
      const validTlds = Object.keys(data.pricing);
      
      // Join all arguments into one string, then split by various delimiters
      const combined = Array.isArray(input) ? input.join(' ') : String(input);
      const rawInputs = combined
        .split(/[,;\\s]+/)  // Split by comma, semicolon, or whitespace
        .map(item => item.trim())
        .filter(item => item.length > 0);
      
      // Extract TLDs using intelligent parsing
      const extractedTlds = rawInputs
        .map(item => extractTld(item, validTlds))
        .filter(tld => tld !== null);
      
      // Remove duplicates and return
      return [...new Set(extractedTlds)];
    };
    
    // Helper function to create ASCII table
    const createTable = (pricingData) => {
      const tlds = Object.keys(pricingData).sort();
      if (tlds.length === 0) {
        return '💰 No TLDs match your filter criteria.\n';
      }
      
      // Calculate column widths
      const maxTldWidth = Math.max(4, ...tlds.map(tld => tld.length + 1)); // +1 for leading dot
      const regWidth = 12;
      const renewWidth = 10; 
      const transferWidth = 10;
      
      // Build table
      const separator = `|${'-'.repeat(maxTldWidth + 2)}|${'-'.repeat(regWidth + 2)}|${'-'.repeat(renewWidth + 2)}|${'-'.repeat(transferWidth + 2)}|`;
      const header = `| ${'TLD'.padEnd(maxTldWidth)} | ${'Registration'.padEnd(regWidth)} | ${'Renewal'.padEnd(renewWidth)} | ${'Transfer'.padEnd(transferWidth)} |`;
      
      let table = '';
      table += `💰 Domain Pricing Table (${tlds.length} TLDs):\n\n`;
      table += separator + '\n';
      table += header + '\n';
      table += separator + '\n';
      
      // Data rows
      tlds.forEach(tld => {
        const pricing = pricingData[tld];
        const reg = pricing.registration ? `$${pricing.registration}` : 'N/A';
        const renewal = pricing.renewal ? `$${pricing.renewal}` : 'N/A';
        const transfer = pricing.transfer ? `$${pricing.transfer}` : 'N/A';
        
        const row = `| ${('.'+tld).padEnd(maxTldWidth)} | ${reg.padEnd(regWidth)} | ${renewal.padEnd(renewWidth)} | ${transfer.padEnd(transferWidth)} |`;
        table += row + '\n';
      });
      
      table += separator + '\n';
      return table;
    };
    
    // Apply filtering if requested
    let filteredPricing = data.pricing;
    if (filterTlds.length > 0) {
      const requestedTlds = parseTlds(filterTlds);
      if (requestedTlds.length > 0) {
        filteredPricing = {};
        requestedTlds.forEach(tld => {
          if (data.pricing[tld]) {
            filteredPricing[tld] = data.pricing[tld];
          }
        });
        
        // Show warning for missing TLDs
        const foundTlds = Object.keys(filteredPricing);
        const missingTlds = requestedTlds.filter(tld => !foundTlds.includes(tld));
        if (missingTlds.length > 0) {
          return createTable(filteredPricing) + 
                 `\n⚠️  Warning: The following TLDs were not found: ${missingTlds.map(t => '.'+t).join(', ')}\n`;
        }
      }
    }
    
    let result = createTable(filteredPricing);
    
    // Add pricing disclaimer if available
    if (data.pricingDisclaimer) {
      result += `\n⚠️  ${data.pricingDisclaimer}\n`;
    }
    
    return result;
  },

  // SSL certificate info
  sslRetrieve: (data) => {
    let output = '🔒 SSL Certificate Information:\n\n';
    if (data.certificatechain) {
      output += `📋 Certificate chain available (${data.certificatechain.length} characters)\n`;
    }
    if (data.privatekey) {
      output += `🔑 Private key available (${data.privatekey.length} characters)\n`;
    }
    if (data.publickey) {
      output += `🔓 Public key available (${data.publickey.length} characters)\n`;
    }
    output += '💡 Use --json for full certificate data\n';
    return output;
  },

  // Generic ping response
  ping: (data) => {
    let output = '🏓 API Connection Test:\n\n';
    output += `✅ Status: ${data.status}\n`;
    if (data.yourIp) {
      output += `🌐 Your IP: ${data.yourIp}\n`;
    }
    return output;
  },

  // Generic success/error handler
  default: (data) => {
    if (data.status === 'SUCCESS') {
      return '✅ Operation completed successfully!\n';
    } else if (data.status === 'ERROR') {
      return `❌ Error: ${data.message || 'Unknown error'}\n`;
    } else {
      // Fallback to JSON for unknown response types
      return JSON.stringify(data, null, 2);
    }
  }
};

const handleResult = (promise: any, command = 'default', formatterParams: any = {}) => {
  promise
    .then(response => {
      if (friendlyMode) {
        const formatter = formatters[command] || formatters.default;
        // Pass formatterParams as spread arguments, including debug mode
        const params = { ...formatterParams, debugMode: debugMode || process.env.SWINE_DEBUG };
        if (command === 'getPricing' && formatterParams.filterTlds) {
          console.log(formatter(response.data, formatterParams.filterTlds, params));
        } else {
          console.log(formatter(response.data, params));
        }
      } else {
        console.log(JSON.stringify(response.data, null, 2));
      }
    })
    .catch(error => {
      const errorData = error.response?.data || { error: error.message };
      if (friendlyMode) {
        if (errorData.status === 'ERROR') {
          console.error(`❌ ${errorData.message || 'Unknown error'}\n`);
        } else {
          console.error(`❌ ${errorData.error || 'Request failed'}\n`);
        }
      } else {
        console.error(JSON.stringify(errorData, null, 2));
      }
    });
};

// Enhanced error handler that catches both sync validation errors and async Promise rejections
const safeExecuteCLI = (fn: any, commandName = 'default', formatterParamsOrFn = {}) => {
  return (argv) => {
    try {
      debug('Executing command with args:', argv);
      const result = fn(argv);
      // If it's a Promise, handle it with handleResult
      if (result && typeof result.then === 'function') {
        const formatterParams = typeof formatterParamsOrFn === 'function' 
          ? formatterParamsOrFn(argv) 
          : formatterParamsOrFn;
        handleResult(result, commandName, formatterParams);
      }
    } catch (error) {
      debug('Caught error in safeExecute:', error.message);
      // Catch synchronous validation errors (like domain validation)
      if (error.message && error.message.includes('Domain')) {
        console.error(`\n❌ Domain Validation Error: ${error.message}\n`);
        console.error(`💡 Please check your domain format and try again.\n`);
      } else {
        console.error(`\n❌ Error: ${error.message}\n`);
      }
      process.exit(1);
    }
  };
};

// Custom error handler for better user feedback
const customErrorHandler = (msg, err, yargs) => {
  if (msg) {
    console.error(`\n❌ Error: ${msg}\n`);
  }
  if (err) {
    console.error(`❌ ${err.message}\n`);
  }
  
  // Show help for the current context
  console.error(yargs.help());
  process.exit(1);
};

yargs(hideBin(process.argv))
  .command('version', 'Show version information', () => {}, (argv: any) => {
    const packageInfo = require('../package.json');
    console.log(`${packageInfo.name} v${packageInfo.version}`);
    console.log(packageInfo.description);
    console.log('');
    console.log('DISCLAIMER:');
    console.log('This project is not connected to or created by Porkbun, LLC.');
    console.log('This is an independent third-party client for the Porkbun API.');
    console.log('');
    console.log('API data attribution: Porkbun, LLC (https://porkbun.com)');
    console.log('');
    console.log('The Porkbun API is provided WITHOUT ANY WARRANTY; without even the');
    console.log('implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.');
  })
  
  .command('ping', 'Test API connection', () => {}, safeExecuteCLI((argv: any) => {
    return pbClient.ping();
  }, 'ping'))
  
  .command('config', 'Setup or view configuration', (yargs: any) => {
    return yargs
      .command('init', 'Create initial user config file', () => {}, (argv: any) => {
        const config = require('./config');
        const configPath = config.createDefaultUserConfig();
        
        if (configPath) {
          console.log('✅ Created default config file at:', configPath);
          console.log('');
          console.log('📝 Please edit this file and add your Porkbun API credentials:');
          console.log('   Get them from: https://porkbun.com/account/api');
          console.log('');
          console.log('🔧 You can also set environment variables instead:');
          console.log('   export PORKBUN_API_KEY="your_key"');
          console.log('   export PORKBUN_SECRET_KEY="your_secret"');
        } else {
          console.log('ℹ️  Config file already exists at:', config.getUserConfigPath());
          console.log('📝 Edit it to update your credentials.');
        }
      })
      .command('show', 'Show current configuration', () => {}, (argv: any) => {
        const config = require('./config');
        console.log('🔧 Current Configuration:');
        console.log('');
        console.log('📁 Config file locations (in priority order):');
        console.log('   1. Environment variables (PORKBUN_API_KEY, PORKBUN_SECRET_KEY)');
        console.log('   2.', config.getUserConfigPath());
        console.log('   3. Project .env file (development only)');
        console.log('');
        console.log('🔑 Current values:');
        console.log('   API Key:', config.apiKey ? `${config.apiKey.substring(0, 8)}...` : '❌ Not set');
        console.log('   Secret Key:', config.secretKey ? `${config.secretKey.substring(0, 8)}...` : '❌ Not set');
        console.log('   Base URL:', config.baseURL);
        console.log('   Port:', config.port);
      })
      .demandCommand(1, '❌ Please specify a config command. Use --help to see available options.')
      .help();
  })
  .command('completion-setup [shell]', false, (yargs) => {
    return yargs
      .positional('shell', {
        describe: 'Shell to show instructions for',
        choices: ['bash', 'zsh', 'fish'],
        default: 'bash'
      });
  }, (argv) => {
    const { shell } = argv;
    
    console.log(`Installation instructions for ${shell} completion:\n`);
    
    switch (shell) {
      case 'bash':
        console.log('# Add this to your ~/.bashrc or ~/.bash_profile:');
        console.log('eval "$(swinelink completion)"');
        console.log('\n# Or save to a file and source it:');
        console.log('swinelink completion > ~/.swinelink-completion.bash');
        console.log('echo "source ~/.swinelink-completion.bash" >> ~/.bashrc');
        break;
      case 'zsh':
        console.log('# Add this to your ~/.zshrc:');
        console.log('eval "$(swinelink completion)"');
        console.log('\n# Or save to a file in your fpath:');
        console.log('swinelink completion > "${fpath[1]}/_swinelink"');
        console.log('\n# You may need to restart your shell or run:');
        console.log('autoload -U compinit && compinit');
        break;
      case 'fish':
        console.log('# For fish shell, you can use bash completion:');
        console.log('# Install bash completion first, then:');
        console.log('swinelink completion > ~/.config/fish/completions/swinelink.fish');
        console.log('\n# Or add to ~/.config/fish/config.fish:');
        console.log('# Note: Fish may require additional setup for bash-style completions');
        break;
    }
    
    console.log('\n# To test completion after setup:');
    console.log('# Type "swinelink " and press TAB to see available commands');
  })
  .command('domain <command>', 'Manage domains', (yargs) => {
    yargs
      .command('check <domain>', 'Check domain availability', () => {}, safeExecuteCLI((argv) => {
        return pbClient.checkAvailability(argv.domain);
      }, 'checkAvailability'))

      .command('list', 'List all domains in your account', () => {}, safeExecuteCLI((argv) => {
        return pbClient.listDomains();
      }, 'listDomains'))

      .command('pricing [tlds..]', 'Get pricing for all TLDs (optionally filter by specific TLDs)', () => {}, safeExecuteCLI((argv) => {
        return pbClient.getPricing();
      }, 'getPricing', (argv) => ({ filterTlds: argv.tlds || [] })))
      .strict()
      .fail(customErrorHandler)
      .demandCommand(1, '❌ Please specify a domain command. Use --help to see available options.')
      .help();
  })
  .command('dns <command>', 'Manage DNS records', (yargs) => {
    yargs
      .command('list <domain>', 'List all DNS records for a domain', () => {}, safeExecuteCLI((argv: any) => {
        return pbClient.dnsListRecords(argv.domain);
      }, 'dnsListRecords'))

      .command('create <domain>', 'Create a DNS record', (yargs) => {
        yargs.options({
          'type': { type: 'string', description: 'Record type', choices: ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'SRV', 'CAA'], demandOption: true },
          'content': { type: 'string', description: 'Record content', demandOption: true },
          'name': { type: 'string', description: 'Subdomain name (leave empty for root domain)', default: '' },
          'ttl': { type: 'number', description: 'Time to live in seconds', default: 600 },
          'prio': { type: 'number', description: 'Priority (for MX records)', default: 0 }
        });
      }, safeExecuteCLI((argv) => {
        const { domain, type, content, name, ttl, prio } = argv;
        const record = { type, content, name, ttl, prio };
        return pbClient.dnsCreateRecord(domain, record);
      }, 'dns create'))

      .command('update <domain> <id>', 'Update a DNS record', (yargs) => {
        yargs.options({
          'type': { type: 'string', description: 'Record type', choices: ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'SRV', 'CAA'] },
          'content': { type: 'string', description: 'Record content' },
          'name': { type: 'string', description: 'Subdomain name' },
          'ttl': { type: 'number', description: 'Time to live in seconds' },
          'prio': { type: 'number', description: 'Priority (for MX records)' }
        });
      }, safeExecuteCLI((argv) => {
        const { domain, id, type, content, name, ttl, prio } = argv;
        const record: any = {};
        if (type) record.type = type;
        if (content) record.content = content;
        if (name !== undefined) record.name = name;
        if (ttl) record.ttl = ttl;
        if (prio !== undefined) record.prio = prio;
        return pbClient.dnsUpdateRecord(domain, id, record);
      }, 'dns update'))

      .command('delete <domain> <id>', 'Delete a DNS record', () => {}, safeExecuteCLI((argv) => {
        return pbClient.dnsDeleteRecord(argv.domain, argv.id);
      }, 'dns delete'))

      .command('get <domain> <id>', 'Get a specific DNS record', () => {}, safeExecuteCLI((argv) => {
        return pbClient.dnsRetrieveRecord(argv.domain, argv.id);
      }, 'dns get'))

      .command('get-by-type <domain> <type> [subdomain]', 'Get DNS records by type and subdomain', () => {}, safeExecuteCLI((argv) => {
        return pbClient.dnsRetrieveRecordByNameType(argv.domain, argv.type, argv.subdomain || '');
      }, 'dns get-by-type'))

      .command('update-by-type <domain> <type> [subdomain]', 'Update DNS records by type and subdomain', (yargs) => {
        yargs.options({
          'content': { type: 'string', description: 'Record content', demandOption: true },
          'ttl': { type: 'number', description: 'Time to live in seconds', default: 600 },
          'prio': { type: 'number', description: 'Priority (for MX records)', default: 0 }
        });
      }, safeExecuteCLI((argv) => {
        const { domain, type, subdomain, content, ttl, prio } = argv;
        const record = { content, ttl, prio };
        return pbClient.dnsUpdateRecordByNameType(domain, type, record, subdomain || '');
      }, 'dns update-by-type'))

      .command('delete-by-type <domain> <type> [subdomain]', 'Delete DNS records by type and subdomain', () => {}, safeExecuteCLI((argv) => {
        return pbClient.dnsDeleteRecordByNameType(argv.domain, argv.type, argv.subdomain || '');
      }, 'dns delete-by-type'))
      .strict()
      .fail(customErrorHandler)
      .demandCommand(1, '❌ Please specify a DNS command. Use --help to see available options.')
      .help();
  })
  .command('ssl <command>', 'Manage SSL certificates', (yargs) => {
    yargs
      .command('get <domain>', 'Get SSL certificate bundle for a domain', () => {}, safeExecuteCLI((argv) => {
        return pbClient.sslRetrieve(argv.domain);
      }, 'sslRetrieve'))
      .strict()
      .fail(customErrorHandler)
      .demandCommand(1, '❌ Please specify an SSL command. Use --help to see available options.')
      .help();
  })
  .command('forwarding <command>', 'Manage URL forwarding', (yargs) => {
    yargs
      .command('list <domain>', 'List URL forwarding records for a domain', () => {}, safeExecuteCLI((argv) => {
        return pbClient.urlForwardingList(argv.domain);
      }, 'forwarding list'))
      .command('create <domain>', 'Create a URL forwarding record', (yargs) => {
        yargs.options({
          'location': { type: 'string', description: 'Destination URL', demandOption: true },
          'type': { type: 'string', description: 'Forwarding type', choices: ['temporary', 'permanent'], default: 'temporary' },
          'include_path': { type: 'boolean', description: 'Include path in forwarding', default: true },
          'wildcard': { type: 'boolean', description: 'Wildcard forwarding', default: false }
        });
      }, safeExecuteCLI((argv) => {
        const { domain, location, type, include_path, wildcard } = argv;
        const record = { location, type, include_path, wildcard };
        return pbClient.urlForwardingCreate(domain, record);
      }, 'forwarding create'))
      .command('delete <domain> <id>', 'Delete a URL forwarding record', () => {}, safeExecuteCLI((argv) => {
        return pbClient.urlForwardingDelete(argv.domain, argv.id);
      }, 'forwarding delete'))
      .strict()
      .fail(customErrorHandler)
      .demandCommand(1, '❌ Please specify a forwarding command. Use --help to see available options.')
      .help();
  })
  .command('dnssec <command>', 'Manage DNSSEC records', (yargs) => {
    yargs
      .command('create-record <domain>', 'Create a DNSSEC record', (yargs) => {
        yargs.options({
          'flags': { type: 'number', description: 'DNSSEC flags', demandOption: true },
          'algorithm': { type: 'number', description: 'Algorithm number', demandOption: true },
          'publickey': { type: 'string', description: 'Public key', demandOption: true }
        });
      }, safeExecuteCLI((argv) => {
        const { domain, flags, algorithm, publickey } = argv;
        const record = { flags, algorithm, publickey };
        return pbClient.createDnssecRecord(domain, record);
      }, 'dnssec create-record'))
      .command('get-records <domain>', 'Get all DNSSEC records for a domain', () => {}, safeExecuteCLI((argv) => {
        return pbClient.getDnssecRecords(argv.domain);
      }, 'dnssec get-records'))
      .command('delete-record <domain> <keytag>', 'Delete a DNSSEC record by its keytag', () => {}, safeExecuteCLI((argv) => {
        return pbClient.deleteDnssecRecord(argv.domain, argv.keytag);
      }, 'dnssec delete-record'))
      .strict()
      .fail(customErrorHandler)
      .demandCommand(1, '❌ Please specify a DNSSEC command. Use --help to see available options.')
      .help();
  })
  .command('nameservers <command>', 'Manage nameservers', (yargs) => {
    yargs
      .command('get <domain>', 'Get nameservers for a domain', () => {}, safeExecuteCLI((argv) => {
        return pbClient.getNameservers(argv.domain);
      }, 'nameservers get'))
      .command('update <domain> <nameservers..>', 'Update nameservers for a domain', () => {}, safeExecuteCLI((argv) => {
        return pbClient.updateNameservers(argv.domain, argv.nameservers);
      }, 'nameservers update'))
      .strict()
      .fail(customErrorHandler)
      .demandCommand(1, '❌ Please specify a nameserver command. Use --help to see available options.')
      .help();
  })
  .command('glue <command>', 'Manage glue records', (yargs) => {
    yargs
      .command('list <domain>', 'List glue records for a domain', () => {}, safeExecuteCLI((argv) => {
        return pbClient.getGlueRecords(argv.domain);
      }, 'glue list'))
      .command('create <domain> <host> <ip>', 'Create a glue record', () => {}, safeExecuteCLI((argv) => {
        return pbClient.createGlueRecord(argv.domain, argv.host, argv.ip);
      }, 'glue create'))
      .command('update <domain> <host> <ip>', 'Update a glue record', () => {}, safeExecuteCLI((argv) => {
        return pbClient.updateGlueRecord(argv.domain, argv.host, argv.ip);
      }, 'glue update'))
      .command('delete <domain> <host>', 'Delete a glue record', () => {}, safeExecuteCLI((argv) => {
        return pbClient.deleteGlueRecord(argv.domain, argv.host);
      }, 'glue delete'))
      .strict()
      .fail(customErrorHandler)
      .demandCommand(1, '❌ Please specify a glue record command. Use --help to see available options.')
      .help();
  })
  .completion('completion', false)
  .option('debug', {
    type: 'boolean',
    description: 'Enable debug output',
    global: true
  })
  .option('friendly', {
    type: 'boolean',  
    description: 'Enable human-readable output instead of JSON',
    global: true
  })
  .middleware((argv) => {
    debugMode = argv.debug;
    friendlyMode = argv.friendly;
    debug('Debug mode enabled');
  })
  .strict()
  .fail(customErrorHandler)
  .demandCommand(1, '❌ Please specify a command. Use --help to see available options.')
  .epilog('DISCLAIMER: This project is not affiliated with Porkbun, LLC. Visit https://porkbun.com for official services.')
  .help()
  .argv;