module.exports = ClientConfig;
function ClientConfig(options) {
  options = options || {};

  this.ip           = options.ip || '192.168.1.1';
  this.multicastIp  = options.multicastIp || '224.1.1.1';
  this.navDataPort  = options.navDataPort || 5554;
  this.videoPort    = options.videoPort || 5555;
  this.cmdPort      = options.cmdPort || 5556;
  this.sendInterval = 30;
}
