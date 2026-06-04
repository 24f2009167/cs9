// Force Node.js to use public DNS resolvers (fixes MongoDB querySrv failures
// on networks/Windows where the default system resolver mishandles SRV records).
import dns from 'node:dns'
dns.setServers(['1.1.1.1', '8.8.8.8', '8.8.4.4'])
