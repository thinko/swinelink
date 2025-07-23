# 🖥️ CLI Usage Guide

Comprehensive guide to using the Swinelink CLI like a pro pig wrangler!

## Command Structure Overview

Swinelink CLI supports both full commands and abbreviations:
- **Full commands**: `swinelink domain check example.com`
- **Abbreviated commands**: `swinelink do ch example.com`
- **Ultra-short commands**: `swinelink do ch example.com -j -r`

## Command Abbreviations

Type only enough characters to make commands unique:

### Top-Level Commands

| Full Command | Abbreviations | Description |
|-------------|---------------|-------------|
| `ping` | `pin`, `pi` | Test API connection |
| `config` | `conf`, `co` | Setup or view configuration |
| `domain` | `dom`, `do` | Manage domains |
| `pricing` | `pr` | Get domain pricing information |
| `dns` | `dn` | Manage DNS records |
| `ssl` | `ss` | Manage SSL certificates |
| `forwarding` | `forward`, `fwd`, `fw` | Manage URL forwarding |
| `dnssec` | `sec` | Manage DNSSEC records |
| `nameservers` | `ns` | Manage nameservers |
| `glue` | `gl` | Manage glue records |
| `version` | `ver`, `ve`, `v` | Show version information |

### Subcommands

| Full Subcommand | Abbreviations | Description |
|-----------------|---------------|-------------|
| `check` | `ch` | Check domain availability |
| `list` | `li`, `l` | List items |
| `create` | `cr`, `c` | Create new item |
| `update` | `up`, `u` | Update existing item |
| `delete` | `del`, `d` | Delete item |
| `get` | `g` | Retrieve item(s) |

## Output Control Options

All options support single-letter aliases:

```bash
-f, --friendly                # Human-readable output (default: true)  
-j, --json                    # Force JSON output (overrides friendly mode)
-b, --basic-text              # Basic text output (no emojis, colors, or special formatting)
-r, --hide-rate-limit         # Hide rate limit information
-a, --acknowledge-pricing     # Hide pricing disclaimers (you accept terms)
-l, --hide-pb-search-links    # Remove Porkbun purchase/search links
-t, --only-tlds="com,net"     # Filter TLD results to specific extensions
-d, --debug                   # Enable detailed debug output
```

## Domain Management

### Check Domain Availability

```bash
# Full command
swinelink domain check example.com

# Abbreviated
swinelink do ch example.com

# Ultra-short with options
swinelink do ch example.com -j       # JSON output
```

### List Your Domains

```bash
# Full command
swinelink domain list

# Abbreviated
swinelink do l

# With custom output
swinelink do l -j                    # JSON format
swinelink do l -b -r                 # Basic text, no rate limits
```

### Get Domain Pricing

```bash
# Get all TLD pricing (new top-level command)
swinelink pricing get
swinelink pr g                       # Ultra-short

# Legacy form (still works)
swinelink domain pricing

# Filter to specific TLDs
swinelink pr g com net org
swinelink pr g com net -t "com,net"          # With explicit filter
swinelink pr g -t "com,net,org,io,co" -a -j  # JSON, filtered, acknowledged

# Flexible input parsing
swinelink pr g com net org .io "co.uk,.ca"
swinelink domain pricing "com net mysite.org .io;domain.ca"
```

## DNS Management

### List DNS Records

```bash
# Full command
swinelink dns list mydomain.com

# Abbreviated
swinelink dn l mydomain.com

# With output control
swinelink dn l mydomain.com -j       # JSON format
swinelink dn l mydomain.com -b -r    # Basic text, no rate limits
```

### Create DNS Records

```bash
# Create A record (full command)
swinelink dns create mydomain.com --type A --name www --content 192.168.1.1 --ttl 300

# Abbreviated
swinelink dn c mydomain.com --type A --name www --content 192.168.1.1 --ttl 300

# Create CNAME record
swinelink dn c mydomain.com --type CNAME --name blog --content www.mydomain.com

# Create with JSON output
swinelink dn c mydomain.com --type A --name www --content 192.168.1.1 -j
```

### Get DNS Records

#### By ID (New Structure)

```bash
# Full command
swinelink dns get id mydomain.com 12345

# Abbreviated
swinelink dn g id mydomain.com 12345

# Legacy alias (still works)
swinelink dns retrieve mydomain.com 12345
```

#### By Type and Subdomain (New Structure)

```bash
# Full command
swinelink dns get type mydomain.com A www

# Abbreviated
swinelink dn g type mydomain.com A www

# Legacy alias (still works)
swinelink dns get-by-type mydomain.com A www
```

### Update DNS Records

#### By ID

```bash
# Full command
swinelink dns update mydomain.com 12345 --content 192.168.1.100

# Abbreviated
swinelink dn u mydomain.com 12345 --content 192.168.1.100
```

#### By Type and Subdomain

```bash
# Full command
swinelink dns update type mydomain.com A www --content 192.168.1.200

# Abbreviated
swinelink dn u type mydomain.com A www --content 192.168.1.200

# Legacy alias
swinelink dns update-by-type mydomain.com A www --content 192.168.1.200
```

### Delete DNS Records

#### By ID

```bash
# Full command
swinelink dns delete mydomain.com 12345

# Abbreviated
swinelink dn d mydomain.com 12345
```

#### By Type and Subdomain

```bash
# Full command
swinelink dns delete type mydomain.com A www

# Abbreviated
swinelink dn d type mydomain.com A www

# Legacy alias
swinelink dns delete-by-type mydomain.com A www
```

## SSL Certificate Management

```bash
# Get SSL certificate bundle (full)
swinelink ssl get mydomain.com

# Abbreviated
swinelink ss g mydomain.com

# With custom output
swinelink ss g mydomain.com -j       # JSON format
```

## URL Forwarding

### List Forwarding Rules

```bash
# Full command
swinelink forwarding list mydomain.com

# Abbreviated
swinelink fw l mydomain.com
```

### Create Forwarding Rule

```bash
# Full command
swinelink forwarding create mydomain.com --location https://newsite.com --type permanent

# Abbreviated
swinelink fw c mydomain.com --location https://newsite.com --type permanent

# With custom options
swinelink fw c mydomain.com --location https://newsite.com --include-path true --wildcard false
```

### Delete Forwarding Rule

```bash
# Full command
swinelink forwarding delete mydomain.com 12345

# Abbreviated
swinelink fw d mydomain.com 12345
```

## DNSSEC Management

### Create DNSSEC Record

```bash
# Full command
swinelink dnssec create-record mydomain.com --flags 257 --algorithm 8 --publickey "ABC123..."

# Abbreviated
swinelink sec c mydomain.com --flags 257 --algorithm 8 --publickey "ABC123..."
```

### Get DNSSEC Records

```bash
# Full command
swinelink dnssec get-records mydomain.com

# Abbreviated
swinelink sec g mydomain.com

# Alternative abbreviated forms
swinelink sec l mydomain.com         # Using 'list' alias
```

### Delete DNSSEC Record

```bash
# Full command
swinelink dnssec delete-record mydomain.com 12345

# Abbreviated
swinelink sec d mydomain.com 12345
```

## Nameserver Management

### Get Nameservers

```bash
# Full command
swinelink nameservers get mydomain.com

# Abbreviated
swinelink ns g mydomain.com
```

### Update Nameservers

```bash
# Full command
swinelink nameservers update mydomain.com ns1.example.com ns2.example.com

# Abbreviated
swinelink ns u mydomain.com ns1.example.com ns2.example.com

# With output control
swinelink ns u mydomain.com ns1.example.com ns2.example.com -e -r
```

## Glue Record Management

### List Glue Records

```bash
# Full command
swinelink glue list mydomain.com

# Abbreviated
swinelink gl l mydomain.com
```

### Create Glue Record

```bash
# Full command
swinelink glue create mydomain.com ns1.mydomain.com 192.168.1.10

# Abbreviated
swinelink gl c mydomain.com ns1.mydomain.com 192.168.1.10
```

### Update Glue Record

```bash
# Full command
swinelink glue update mydomain.com ns1.mydomain.com 192.168.1.11

# Abbreviated
swinelink gl u mydomain.com ns1.mydomain.com 192.168.1.11
```

### Delete Glue Record

```bash
# Full command
swinelink glue delete mydomain.com ns1.mydomain.com

# Abbreviated
swinelink gl d mydomain.com ns1.mydomain.com
```

## Output Customization Examples

### Script-Friendly Output

Perfect for automation and scripts:

```bash
# Clean JSON output with no extras
swinelink do ch example.com -j -r -l

# Acknowledge pricing warnings once
swinelink pr g com net -j -a

# Pipe to other tools
swinelink dn l mydomain.com -j | jq '.records[0]'
swinelink pr g com net -j | grep -o '"registration":"[^"]*"'
```

### Human-Friendly Output

Perfect for interactive terminal use:

```bash
# Default friendly output with all the charm
swinelink do ch example.com

# Explicit friendly mode
swinelink pr g -f

# Friendly with custom filtering
swinelink pr g -t "com,net,org" -f
```

### Mixed Output Scenarios

```bash
# JSON overrides friendly (precedence)
swinelink pr g com net -f -j          # Results in JSON despite -f

# Combination examples
swinelink dn l mydomain.com -f -b     # Friendly output, basic text
swinelink do ch example.com -j -r     # JSON output, no rate limits
swinelink pr g -t "com,net" -a -f     # Filtered, acknowledged, friendly
```

## Debug Mode

### Enable Debug Output

```bash
# Using CLI flag
swinelink -d domain check example.com
swinelink --debug pr g com net

# Using environment variable
SWINE_DEBUG=1 swinelink domain list
```

### Debug Information Includes

- Configuration loading details
- API request/response details
- Rate limiting information
- Error details and stack traces

## Shell Completion

### Setup Shell Completion

```bash
# Bash
eval "$(swinelink completion)"

# Get setup instructions for different shells
swinelink completion-setup bash
swinelink completion-setup zsh
swinelink completion-setup fish
```

### Using Tab Completion

```bash
# Tab completion examples
swinelink <TAB>              # Shows all top-level commands
swinelink dns <TAB>          # Shows DNS subcommands
swinelink do <TAB>           # Shows domain subcommands
swinelink pr <TAB>           # Shows pricing subcommands
```

## Advanced Usage Patterns

### Chaining Commands

```bash
# Check multiple domains
for domain in example.com test.org; do
  swinelink do ch $domain -j
done

# Batch DNS operations
swinelink dn l mydomain.com -j | jq -r '.records[].id' | while read id; do
  swinelink dn g id mydomain.com $id -j
done
```

### Configuration Combinations

```bash
# Override config for specific commands
swinelink pr g -t "com,net,org" -a    # Temporary TLD filter
swinelink dn l mydomain.com -b        # Temporary basic text
swinelink do ch example.com -j -r     # Temporary JSON + no rate limits
```

### Progressive Learning Path

1. **Start with full commands**: `swinelink domain check example.com`
2. **Learn top-level abbreviations**: `swinelink do check example.com`
3. **Add subcommand abbreviations**: `swinelink do ch example.com`
4. **Add single-letter options**: `swinelink do ch example.com -j -r`
5. **Master ultra-efficient combinations**: `swinelink pr g com net -t "com,net" -a -j`