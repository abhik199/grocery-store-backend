const os = require("os");

function getIpAddress() {
  const networkInterfaces = os.networkInterfaces();

  let ipAddress = null;
  for (const interfaceName in networkInterfaces) {
    const interfaceArray = networkInterfaces[interfaceName];
    for (const iface of interfaceArray) {
      if (
        iface.family === "IPv4" &&
        !iface.internal &&
        iface.address.startsWith("192.168.")
      ) {
        ipAddress = iface.address;
        break;
      }
    }
    if (ipAddress) {
      break;
    }
  }

  return ipAddress;
}

module.exports = {
  ipAddress: getIpAddress,
};
