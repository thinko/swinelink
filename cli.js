#!/usr/bin/env node

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const pb = require('./porkbunClient');

let debugMode = false;

// Debug helper - logs when --debug flag is passed or SWINE_DEBUG env var is set
const debug = (...args) => {
  if (debugMode || process.env.SWINE_DEBUG) {
    console.error('[SWINE_DEBUG]', ...args);
  }
};

const handleResult = (promise) => {
  promise
    .then(response => console.log(JSON.stringify(response.data, null, 2)))
    .catch(error => console.error(JSON.stringify(error.response?.data || { error: error.message }, null, 2)));
};

// Enhanced error handler that catches both sync validation errors and async Promise rejections
const safeExecute = (fn) => {
  return (argv) => {
    try {
      debug('Executing command with args:', argv);
      const result = fn(argv);
      // If it's a Promise, handle it with handleResult
      if (result && typeof result.then === 'function') {
        handleResult(result);
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
  .command('ping', 'Test API connection', () => {}, safeExecute((argv) => {
    return pb.ping();
  }))
  .command('completion-setup [shell]', 'Show shell completion setup instructions', (yargs) => {
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
  .command('dns <command>', 'Manage DNS records', (yargs) => {
    yargs
      .command('list <domain>', 'List all DNS records for a domain', () => {}, safeExecute((argv) => {
        return pb.dnsListRecords(argv.domain);
      }))

      .command('create <domain>', 'Create a DNS record', (yargs) => {
        yargs.options({
          'type': { type: 'string', description: 'Record type', choices: ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'SRV', 'CAA'], demandOption: true },
          'content': { type: 'string', description: 'Record content', demandOption: true },
          'name': { type: 'string', description: 'Subdomain name (leave empty for root domain)', default: '' },
          'ttl': { type: 'number', description: 'Time to live in seconds', default: 600 },
          'prio': { type: 'number', description: 'Priority (for MX records)', default: 0 }
        });
      }, safeExecute((argv) => {
        const { domain, type, content, name, ttl, prio } = argv;
        const record = { type, content, name, ttl, prio };
        return pb.dnsCreateRecord(domain, record);
      }))

      .command('update <domain> <id>', 'Update a DNS record', (yargs) => {
        yargs.options({
          'type': { type: 'string', description: 'Record type', choices: ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'SRV', 'CAA'] },
          'content': { type: 'string', description: 'Record content' },
          'name': { type: 'string', description: 'Subdomain name' },
          'ttl': { type: 'number', description: 'Time to live in seconds' },
          'prio': { type: 'number', description: 'Priority (for MX records)' }
        });
      }, safeExecute((argv) => {
        const { domain, id, type, content, name, ttl, prio } = argv;
        const record = {};
        if (type) record.type = type;
        if (content) record.content = content;
        if (name !== undefined) record.name = name;
        if (ttl) record.ttl = ttl;
        if (prio !== undefined) record.prio = prio;
        return pb.dnsUpdateRecord(domain, id, record);
      }))

      .command('delete <domain> <id>', 'Delete a DNS record', () => {}, safeExecute((argv) => {
        return pb.dnsDeleteRecord(argv.domain, argv.id);
      }))

      .command('get <domain> <id>', 'Get a specific DNS record', () => {}, safeExecute((argv) => {
        return pb.dnsRetrieveRecord(argv.domain, argv.id);
      }))

      .command('get-by-type <domain> <type> [subdomain]', 'Get DNS records by type and subdomain', () => {}, safeExecute((argv) => {
        return pb.dnsRetrieveRecordByNameType(argv.domain, argv.type, argv.subdomain || '');
      }))

      .command('update-by-type <domain> <type> [subdomain]', 'Update DNS records by type and subdomain', (yargs) => {
        yargs.options({
          'content': { type: 'string', description: 'Record content', demandOption: true },
          'ttl': { type: 'number', description: 'Time to live in seconds', default: 600 },
          'prio': { type: 'number', description: 'Priority (for MX records)', default: 0 }
        });
      }, safeExecute((argv) => {
        const { domain, type, subdomain, content, ttl, prio } = argv;
        const record = { content, ttl, prio };
        return pb.dnsUpdateRecordByNameType(domain, type, record, subdomain || '');
      }))

      .command('delete-by-type <domain> <type> [subdomain]', 'Delete DNS records by type and subdomain', () => {}, safeExecute((argv) => {
        return pb.dnsDeleteRecordByNameType(argv.domain, argv.type, argv.subdomain || '');
      }))
      .strict()
      .fail(customErrorHandler)
      .demandCommand(1, '❌ Please specify a DNS command. Use --help to see available options.')
      .help();
  })
  .command('ssl <command>', 'Manage SSL certificates', (yargs) => {
    yargs
      .command('get <domain>', 'Get SSL certificate bundle for a domain', () => {}, safeExecute((argv) => {
        return pb.sslRetrieve(argv.domain);
      }))
      .strict()
      .fail(customErrorHandler)
      .demandCommand(1, '❌ Please specify an SSL command. Use --help to see available options.')
      .help();
  })
  .command('forwarding <command>', 'Manage URL forwarding', (yargs) => {
    yargs
      .command('list <domain>', 'List URL forwarding records for a domain', () => {}, safeExecute((argv) => {
        return pb.urlForwardingList(argv.domain);
      }))
      .command('create <domain>', 'Create a URL forwarding record', (yargs) => {
        yargs.options({
          'location': { type: 'string', description: 'Destination URL', demandOption: true },
          'type': { type: 'string', description: 'Forwarding type', choices: ['temporary', 'permanent'], default: 'temporary' },
          'include_path': { type: 'boolean', description: 'Include path in forwarding', default: true },
          'wildcard': { type: 'boolean', description: 'Wildcard forwarding', default: false }
        });
      }, safeExecute((argv) => {
        const { domain, location, type, include_path, wildcard } = argv;
        const record = { location, type, include_path, wildcard };
        return pb.urlForwardingCreate(domain, record);
      }))
      .command('delete <domain> <id>', 'Delete a URL forwarding record', () => {}, safeExecute((argv) => {
        return pb.urlForwardingDelete(argv.domain, argv.id);
      }))
      .strict()
      .fail(customErrorHandler)
      .demandCommand(1, '❌ Please specify a forwarding command. Use --help to see available options.')
      .help();
  })
  .command('domain <command>', 'Manage domains', (yargs) => {
    yargs
      .command('check <domain>', 'Check domain availability', () => {}, safeExecute((argv) => {
        return pb.checkAvailability(argv.domain);
      }))

      .command('list', 'List all domains in your account', () => {}, safeExecute((argv) => {
        return pb.listDomains();
      }))

      .command('pricing <domains..>', 'Get pricing for domains', () => {}, safeExecute((argv) => {
        return pb.getPricing(argv.domains);
      }))
      .strict()
      .fail(customErrorHandler)
      .demandCommand(1, '❌ Please specify a domain command. Use --help to see available options.')
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
      }, safeExecute((argv) => {
        const { domain, flags, algorithm, publickey } = argv;
        const record = { flags, algorithm, publickey };
        return pb.createDnssecRecord(domain, record);
      }))
      .command('get-records <domain>', 'Get all DNSSEC records for a domain', () => {}, safeExecute((argv) => {
        return pb.getDnssecRecords(argv.domain);
      }))
      .command('delete-record <domain> <keytag>', 'Delete a DNSSEC record by its keytag', () => {}, safeExecute((argv) => {
        return pb.deleteDnssecRecord(argv.domain, argv.keytag);
      }))
      .strict()
      .fail(customErrorHandler)
      .demandCommand(1, '❌ Please specify a DNSSEC command. Use --help to see available options.')
      .help();
  })
  .command('nameservers <command>', 'Manage nameservers', (yargs) => {
    yargs
      .command('get <domain>', 'Get nameservers for a domain', () => {}, safeExecute((argv) => {
        return pb.getNameservers(argv.domain);
      }))
      .command('update <domain> <nameservers..>', 'Update nameservers for a domain', () => {}, safeExecute((argv) => {
        return pb.updateNameservers(argv.domain, argv.nameservers);
      }))
      .strict()
      .fail(customErrorHandler)
      .demandCommand(1, '❌ Please specify a nameserver command. Use --help to see available options.')
      .help();
  })
  .command('glue <command>', 'Manage glue records', (yargs) => {
    yargs
      .command('list <domain>', 'List glue records for a domain', () => {}, safeExecute((argv) => {
        return pb.getGlueRecords(argv.domain);
      }))
      .command('create <domain> <host> <ip>', 'Create a glue record', () => {}, safeExecute((argv) => {
        return pb.createGlueRecord(argv.domain, argv.host, argv.ip);
      }))
      .command('update <domain> <host> <ip>', 'Update a glue record', () => {}, safeExecute((argv) => {
        return pb.updateGlueRecord(argv.domain, argv.host, argv.ip);
      }))
      .command('delete <domain> <host>', 'Delete a glue record', () => {}, safeExecute((argv) => {
        return pb.deleteGlueRecord(argv.domain, argv.host);
      }))
      .strict()
      .fail(customErrorHandler)
      .demandCommand(1, '❌ Please specify a glue record command. Use --help to see available options.')
      .help();
  })
  .completion('completion', 'Generate completion script')
  .option('debug', {
    type: 'boolean',
    description: 'Enable debug output',
    global: true
  })
  .middleware((argv) => {
    debugMode = argv.debug;
    debug('Debug mode enabled');
  })
  .strict()
  .fail(customErrorHandler)
  .demandCommand(1, '❌ Please specify a command. Use --help to see available options.')
  .help()
  .argv;