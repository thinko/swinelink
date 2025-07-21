#!/usr/bin/env node

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const pb = require('./porkbunClient');

const handleResult = (promise) => {
  promise
    .then(response => console.log(JSON.stringify(response.data, null, 2)))
    .catch(error => console.error(JSON.stringify(error.response?.data || { error: error.message }, null, 2)));
};

yargs(hideBin(process.argv))
  .command('ping', 'Test authentication to the Porkbun API', () => {}, (argv) => {
    handleResult(pb.ping());
  })
  .command('dns <command>', 'Manage DNS records', (yargs) => {
    yargs
      .command('create <domain>', 'Create a DNS record', (yargs) => {
        return yargs.options({
          'name': { type: 'string', description: 'Subdomain, or blank for root record', default: '' },
          'type': { type: 'string', description: 'Record type (A, CNAME, etc.)', demandOption: true },
          'content': { type: 'string', description: 'Record content (e.g., IP address)', demandOption: true },
          'ttl': { type: 'number', description: 'Time-to-live in seconds', default: 300 },
          'prio': { type: 'number', description: 'Priority for MX records' }
        });
      }, (argv) => {
        const { domain, name, type, content, ttl, prio } = argv;
        const record = { name, type, content, ttl, prio };
        Object.keys(record).forEach(key => record[key] === undefined && delete record[key]);
        handleResult(pb.dnsCreateRecord(domain, record));
      })
      .command('list <domain>', 'List all DNS records for a domain', () => {}, (argv) => {
        handleResult(pb.dnsListRecords(argv.domain));
      })
      .command('retrieve <domain> <id>', 'Retrieve a specific DNS record by its ID', () => {}, (argv) => {
        handleResult(pb.dnsRetrieveRecord(argv.domain, argv.id));
      })
      .command('retrieve-by-name-type <domain> <type> [subdomain]', 'Retrieve DNS records by name and type', () => {}, (argv) => {
        handleResult(pb.dnsRetrieveRecordByNameType(argv.domain, argv.type, argv.subdomain));
      })
      .command('update <domain> <id>', 'Update a DNS record by its ID', (yargs) => {
        return yargs.options({
            'name': { type: 'string', description: 'Subdomain, or blank for root record' },
            'type': { type: 'string', description: 'Record type (A, CNAME, etc.)' },
            'content': { type: 'string', description: 'Record content (e.g., IP address)' },
            'ttl': { type: 'number', description: 'Time-to-live in seconds' },
            'prio': { type: 'number', description: 'Priority for MX records' }
        });
      }, (argv) => {
        const { domain, id, name, type, content, ttl, prio } = argv;
        const record = { name, type, content, ttl, prio };
        Object.keys(record).forEach(key => record[key] === undefined && delete record[key]);
        handleResult(pb.dnsUpdateRecord(domain, id, record));
      })
      .command('update-by-name-type <domain> <type> [subdomain]', 'Update DNS records by name and type', (yargs) => {
        return yargs.options({
            'content': { type: 'string', description: 'Record content (e.g., IP address)', demandOption: true },
            'ttl': { type: 'number', description: 'Time-to-live in seconds', default: 300 },
            'prio': { type: 'number', description: 'Priority for MX records' }
        });
      }, (argv) => {
        const { domain, type, subdomain, content, ttl, prio } = argv;
        const record = { content, ttl, prio };
        Object.keys(record).forEach(key => record[key] === undefined && delete record[key]);
        handleResult(pb.dnsUpdateRecordByNameType(argv.domain, argv.type, record, argv.subdomain));
      })
      .command('delete <domain> <id>', 'Delete a DNS record by its ID', () => {}, (argv) => {
        handleResult(pb.dnsDeleteRecord(argv.domain, argv.id));
      })
      .command('delete-by-name-type <domain> <type> [subdomain]', 'Delete DNS records by name and type', () => {}, (argv) => {
        handleResult(pb.dnsDeleteRecordByNameType(argv.domain, argv.type, argv.subdomain));
      })
      .demandCommand(1, 'You need at least one command before moving on')
      .help();
  })
  .command('ssl <command>', 'Manage SSL certificates', (yargs) => {
    yargs
      .command('retrieve <domain>', 'Retrieve SSL certificate bundle for a domain', () => {}, (argv) => {
        handleResult(pb.sslRetrieve(argv.domain));
      })
      .demandCommand(1, 'You need at least one command before moving on')
      .help();
  })
  .command('forward <command>', 'Manage domain forwarding', (yargs) => {
    yargs
      .command('list <domain>', 'List all URL forwarding records for a domain', () => {}, (argv) => {
        handleResult(pb.urlForwardingList(argv.domain));
      })
      .command('create <domain>', 'Create a URL forwarding record', (yargs) => {
        return yargs.options({
          'location': { type: 'string', description: 'Destination URL', demandOption: true },
          'type': { type: 'string', description: 'Forwarding type (temporary, permanent, etc.)', default: 'temporary' },
          'include_path': { type: 'boolean', description: 'Include path in forwarding', default: true },
          'https': { type: 'boolean', description: 'Use HTTPS for forwarding', default: true }
        });
      }, (argv) => {
        const { domain, location, type, include_path, https } = argv;
        const record = { location, type, include_path, https };
        handleResult(pb.urlForwardingCreate(domain, record));
      })
      .command('delete <domain> <id>', 'Delete a URL forwarding record by its ID', () => {}, (argv) => {
        handleResult(pb.urlForwardingDelete(argv.domain, argv.id));
      })
      .demandCommand(1, 'You need at least one command before moving on')
      .help();
  })
  .command('domain <command>', 'Manage domains', (yargs) => {
    yargs
      .command('check <domain>', 'Check domain availability', () => {}, (argv) => {
        handleResult(pb.checkAvailability(argv.domain));
      })
      .command('register <domain>', 'Register a domain', (yargs) => {
        return yargs.options({
          'years': { type: 'number', description: 'Number of years to register', default: 1 },
        });
      }, (argv) => {
        // Note: Contact information must be configured in your Porkbun account.
        handleResult(pb.registerDomain(argv.domain, argv.years));
      })
      .command('list', 'List all domains in your account', () => {}, (argv) => {
        handleResult(pb.listDomains());
      })
      .command('details <domain>', 'Get domain details', () => {}, (argv) => {
        handleResult(pb.domainDetails(argv.domain));
      })
      .command('pricing <domains..>', 'Get pricing for domains', () => {}, (argv) => {
        handleResult(pb.getPricing(argv.domains));
      })
      .demandCommand(1, 'You need at least one command before moving on')
      .help();
  })
  .command('dnssec <command>', 'Manage DNSSEC', (yargs) => {
    yargs
      .command('enable <domain>', 'Enable DNSSEC for a domain', () => {}, (argv) => {
        handleResult(pb.enableDnssec(argv.domain));
      })
      .command('disable <domain>', 'Disable DNSSEC for a domain', () => {}, (argv) => {
        handleResult(pb.disableDnssec(argv.domain));
      })
      .command('get <domain>', 'Get DNSSEC status for a domain', () => {}, (argv) => {
        handleResult(pb.getDnssec(argv.domain));
      })
      .command('create-record <domain>', 'Create a DNSSEC record', (yargs) => {
        return yargs.options({
          'algorithm': { type: 'string', description: 'DNSSEC algorithm', demandOption: true },
          'digest_type': { type: 'string', description: 'Digest type', demandOption: true },
          'digest': { type: 'string', description: 'Digest', demandOption: true },
          'keytag': { type: 'string', description: 'Keytag', demandOption: true },
        });
      }, (argv) => {
        const { domain, algorithm, digest_type, digest, keytag } = argv;
        const record = { algorithm, digest_type, digest, keytag };
        handleResult(pb.createDnssecRecord(domain, record));
      })
      .command('get-records <domain>', 'Get all DNSSEC records for a domain', () => {}, (argv) => {
        handleResult(pb.getDnssecRecords(argv.domain));
      })
      .command('delete-record <domain> <keytag>', 'Delete a DNSSEC record by its keytag', () => {}, (argv) => {
        handleResult(pb.deleteDnssecRecord(argv.domain, argv.keytag));
      })
      .demandCommand(1, 'You need at least one command before moving on')
      .help();
  })
  .command('nameserver <command>', 'Manage nameservers', (yargs) => {
    yargs
      .command('get <domain>', 'Get nameservers for a domain', () => {}, (argv) => {
        handleResult(pb.getNameservers(argv.domain));
      })
      .command('update <domain> <nameservers..>', 'Update nameservers for a domain', () => {}, (argv) => {
        handleResult(pb.updateNameservers(argv.domain, argv.nameservers));
      })
      .demandCommand(1, 'You need at least one command before moving on')
      .help();
  })
  .command('glue <command>', 'Manage glue records', (yargs) => {
    yargs
      .command('create <domain> <host> <ip>', 'Create a glue record', () => {}, (argv) => {
        handleResult(pb.createGlueRecord(argv.domain, argv.host, argv.ip));
      })
      .command('update <domain> <host> <ip>', 'Update a glue record', () => {}, (argv) => {
        handleResult(pb.updateGlueRecord(argv.domain, argv.host, argv.ip));
      })
      .command('delete <domain> <host>', 'Delete a glue record', () => {}, (argv) => {
        handleResult(pb.deleteGlueRecord(argv.domain, argv.host));
      })
      .command('list <domain>', 'List all glue records for a domain', () => {}, (argv) => {
        handleResult(pb.getGlueRecords(argv.domain));
      })
      .demandCommand(1, 'You need at least one command before moving on')
      .help();
  })
  .demandCommand(1, 'You need at least one command before moving on')
  .help()
  .argv;