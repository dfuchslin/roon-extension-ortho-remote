import { DeviceDiscoveryManager } from 'ortho-remote'

const OrthoRemoteWrapper = async () => {
  console.log('Starting Ortho Remote discovery')
  const manager = DeviceDiscoveryManager.defaultManager
  const session = manager.startDiscoverySession({ timeoutMs: 10000 })

  var device = undefined;
  var connected = false;

  /*
  setTimeout(() => {
    if (!device) {
      throw new Error('No device found within timeout!');
    }
    if (!connected) {
      throw new Error('Device not connected within timeout!');
    }
  }, 5000);
  */

  console.log('Waiting for device...')
  device = await session.waitForFirstDevice()

  console.log(`Found device '${device.id}'`)
  console.log('Connecting...')

  connected = await device.connect();
  if (connected) {
    console.log('Connected')
    return device;
  }
  throw new Error('connect unsuccessful')
}

export { OrthoRemoteWrapper }
// module.exports = OrthoRemote;