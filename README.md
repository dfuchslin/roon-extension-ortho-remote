# Roon volume remote with Teenage Engineering OR-1 ortho remote

Volume control for roon.

work in progress... 


ortho remote guide:
https://teenage.engineering/guides/or-1


Problems with midi:
https://github.com/justinlatimer/node-midi/issues/118

### HID did not work as the device seems to report with the BLE MIDI profile/setting/characteristics

Pair the remote:

```
sudo bluetoothctl --agent=NoInputNoOutput
power on
agent on
scan on
```
hold down button until flashing blue
```
...
[NEW] Device E4:A1:28:94:CB:1A ortho remote
...

trust aa:bb:cc:dd:ee:ff
pair aa:bb:cc:dd:ee:ff
connect aa:bb:cc:dd:ee:ff
info aa:bb:cc:dd:ee:ff
```

[bluetooth]# scan on
Discovery started
[CHG] Controller B8:27:EB:30:06:FB Discovering: yes
[CHG] Device 20:A6:91:21:FE:92 RSSI: -74
[CHG] Device 7C:49:31:9B:41:C4 RSSI: -66
[CHG] Device 7C:49:31:9B:41:C4 TxPower: 6
[NEW] Device E9:17:83:53:85:F2 ortho remote
[CHG] Device 7E:E5:C2:DE:D0:E9 RSSI: -92
[CHG] Device 58:8F:17:B1:6A:D5 RSSI: -54
[CHG] Device 58:8F:17:B1:6A:D5 TxPower: 12
[CHG] Device 58:8F:17:B1:6A:D5 ManufacturerData Key: 0x004c
[CHG] Device 58:8F:17:B1:6A:D5 ManufacturerData Value:
  10 06 03 1e a5 31 0a 48                          .....1.H
[CHG] Device C8:69:CD:52:9D:9E RSSI: -74
[CHG] Device C8:69:CD:52:9D:9E TxPower: 12
[CHG] Device 5D:A4:48:C1:85:CF RSSI: -62
[CHG] Device 6B:12:40:E4:63:C4 RSSI: -57
[CHG] Device 6B:12:40:E4:63:C4 TxPower: 12
[CHG] Device 6C:25:B5:DA:45:AE RSSI: -72
[CHG] Device 6C:25:B5:DA:45:AE TxPower: 12
[CHG] Device 66:6A:4F:ED:DB:23 RSSI: -57
[CHG] Device 66:6A:4F:ED:DB:23 TxPower: 12
[CHG] Device 36:F0:4B:B9:6C:C1 RSSI: -76
[CHG] Device 59:EB:28:64:93:6B RSSI: -52
[CHG] Device 59:EB:28:64:93:6B ManufacturerData Key: 0x004c
[CHG] Device 59:EB:28:64:93:6B ManufacturerData Value:
  0c 0e 08 2c 6b 48 e6 b8 55 52 1e 88 ae f9 90 c7  ...,kH..UR......
[CHG] Device 40:CB:C0:E0:6D:A2 RSSI: -78
[CHG] Device 40:CB:C0:E0:6D:A2 TxPower: 12
[CHG] Device DC:A9:04:96:9B:DC RSSI: -51
[CHG] Device 42:BF:22:C4:63:AE RSSI: -64
[CHG] Device 42:BF:22:C4:63:AE TxPower: 24
[CHG] Device 77:47:7C:97:80:9E RSSI: -63
[bluetooth]# connect E9:17:83:53:85:F2
Attempting to connect to E9:17:83:53:85:F2
[bluetooth]# trust E9:17:83:53:85:F2
[CHG] Device E9:17:83:53:85:F2 Trusted: yes
Changing E9:17:83:53:85:F2 trust succeeded
[CHG] Device E9:17:83:53:85:F2 Connected: yes
Connection successful
[ortho remote]# pair E9:17:83:53:85:F2
Attempting to pair with E9:17:83:53:85:F2
Request authorization
[agent] Accept pairing (yes/no): [NEW] Primary Service
	/org/bluez/hci0/dev_E9_17_83_53_85_F2/service0008
	00001801-0000-1000-8000-00805f9b34fb
	Generic Attribute Profile
[NEW] Primary Service
	/org/bluez/hci0/dev_E9_17_83_53_85_F2/service0009
	0000180a-0000-1000-8000-00805f9b34fb
	Device Information
[NEW] Characteristic
	/org/bluez/hci0/dev_E9_17_83_53_85_F2/service0009/char000a
	00002a29-0000-1000-8000-00805f9b34fb
	Manufacturer Name String
[NEW] Characteristic
	/org/bluez/hci0/dev_E9_17_83_53_85_F2/service0009/char000c
	00002a25-0000-1000-8000-00805f9b34fb
	Serial Number String
[NEW] Characteristic
	/org/bluez/hci0/dev_E9_17_83_53_85_F2/service0009/char000e
	00002a27-0000-1000-8000-00805f9b34fb
	Hardware Revision String
[NEW] Characteristic
	/org/bluez/hci0/dev_E9_17_83_53_85_F2/service0009/char0010
	00002a28-0000-1000-8000-00805f9b34fb
	Software Revision String
[NEW] Characteristic
	/org/bluez/hci0/dev_E9_17_83_53_85_F2/service0009/char0012
	00002a50-0000-1000-8000-00805f9b34fb
	PnP ID
[NEW] Primary Service
	/org/bluez/hci0/dev_E9_17_83_53_85_F2/service0029
	20454c45-4354-5241-2052-554c45532120
	Vendor specific
[NEW] Characteristic
	/org/bluez/hci0/dev_E9_17_83_53_85_F2/service0029/char002a
	20454c46-4354-5241-2052-554c45532120
	Vendor specific
[CHG] Device E9:17:83:53:85:F2 UUIDs: 00001800-0000-1000-8000-00805f9b34fb
[CHG] Device E9:17:83:53:85:F2 UUIDs: 00001801-0000-1000-8000-00805f9b34fb
[CHG] Device E9:17:83:53:85:F2 UUIDs: 0000180a-0000-1000-8000-00805f9b34fb
[CHG] Device E9:17:83:53:85:F2 UUIDs: 0000180f-0000-1000-8000-00805f9b34fb
[CHG] Device E9:17:83:53:85:F2 UUIDs: 00001812-0000-1000-8000-00805f9b34fb
[CHG] Device E9:17:83:53:85:F2 UUIDs: 03b80e5a-ede8-4b33-a751-6ce34ec4c700
[CHG] Device E9:17:83:53:85:F2 UUIDs: 20454c45-4354-5241-2052-554c45532120
[CHG] Device E9:17:83:53:85:F2 ServicesResolved: yes
yes
[CHG] Device E9:17:83:53:85:F2 Modalias: bluetooth:v0450p0004d0110
[CHG] Device E9:17:83:53:85:F2 Paired: yes
Pairing successful
[ortho remote]# info E9:17:83:53:85:F2
Device E9:17:83:53:85:F2 (random)
	Name: ortho remote
	Alias: ortho remote
	Appearance: 0x0180
	Paired: yes
	Trusted: yes
	Blocked: no
	Connected: yes
	LegacyPairing: no
	UUID: Generic Access Profile    (00001800-0000-1000-8000-00805f9b34fb)
	UUID: Generic Attribute Profile (00001801-0000-1000-8000-00805f9b34fb)
	UUID: Device Information        (0000180a-0000-1000-8000-00805f9b34fb)
	UUID: Battery Service           (0000180f-0000-1000-8000-00805f9b34fb)
	UUID: Human Interface Device    (00001812-0000-1000-8000-00805f9b34fb)
	UUID: Vendor specific           (03b80e5a-ede8-4b33-a751-6ce34ec4c700)
	UUID: Vendor specific           (20454c45-4354-5241-2052-554c45532120)
	Modalias: bluetooth:v0450p0004d0110
	ManufacturerData Key: 0x0450
	ManufacturerData Value:
  01 04 52 39 43 4b 49 32 4d 36                    ..R9CKI2M6
	RSSI: -52
	TxPower: 4
[CHG] Device 66:6A:4F:ED:DB:23 RSSI: -47
[CHG] Device 59:EB:28:64:93:6B ManufacturerData Key: 0x004c
[CHG] Device 59:EB:28:64:93:6B ManufacturerData Value:
  0c 0e 08 2e 6b e9 42 cb 8d ac a3 de 4f 5a 04 b8  ....k.B.....OZ..
[CHG] Device 6B:12:40:E4:63:C4 RSSI: -70
[CHG] Device 59:EB:28:64:93:6B ManufacturerData Key: 0x004c
[CHG] Device 59:EB:28:64:93:6B ManufacturerData Value:
  0c 0e 08 2f 6b 79 5b 30 9d c8 37 2a 29 a1 10 aa  .../ky[0..7*)...
[CHG] Device 58:8F:17:B1:6A:D5 ManufacturerData Key: 0x004c
[CHG] Device 58:8F:17:B1:6A:D5 ManufacturerData Value:
  10 06 03 1e a5 31 0a 4c                          .....1.L







```
dmesg:

[  151.812895] input: ortho remote as /devices/virtual/misc/uhid/0005:0450:0004.0001/input/input0
[  151.813770] hid-generic 0005:0450:0004.0001: input,hidraw0: BLUETOOTH HID v1.10 Device [ortho remote] on B8:27:EB:30:06:FB
```

```
cat /proc/bus/input/devices
I: Bus=0005 Vendor=0450 Product=0004 Version=0110
N: Name="ortho remote"
P: Phys=B8:27:EB:30:06:FB
S: Sysfs=/devices/virtual/misc/uhid/0005:0450:0004.0001/input/input0
U: Uniq=E9:17:83:53:85:F2
H: Handlers=kbd event0
B: PROP=0
B: EV=1b
B: KEY=4038 0 c0000 0 0 0
B: ABS=1 0
B: MSC=10
```


Verify node-hid can find the device, https://github.com/node-hid/node-hid#installation

$ npm install node-hid
$ npx hid-showdevices hidraw
driverType: hidraw
devices: [
  {
    vendorId: 1104,
    productId: 4,
    path: '/dev/hidraw0',
    serialNumber: 'E9:17:83:53:85:F2',
    manufacturer: '',
    product: 'ortho remote',
    release: 0,
    interface: -1,
    usagePage: 12,
    usage: 1
  }
]


Make sure users in the `input` group can read /dev/hidraw* (or use sudo): 

/etc/udev/rules.d/95-hidraw.rules

KERNEL=="hidraw*", GROUP="input", MODE="0660"

sudo udevadm trigger (or reboot)



install bluez:

wget www.kernel.org/pub/linux/bluetooth/bluez-5.56.tar.xz
sudo apt-get install libdbus-1-dev libglib2.0-dev libudev-dev libical-dev libreadline-dev -y
tar xvf bluez-5.56.tar.xz && cd bluez-5.56
cat configure
cat configure | grep midi
./configure --prefix=/usr --mandir=/usr/share/man --sysconfdir=/etc --localstatedir=/var --enable-experimental --enable-midi
make -j4
sudo dpkg -r --force-depends "bluez"
sudo make install
bluetoothctl --version

masked:
sudo rm /etc/systemd/system/bluetooth.service
sudo systemctl unmask bluetooth.service
sudo systemctl enable bluetooth.service
sudo systemctl restart bluetooth
sudo systemctl status bluetooth



ls -l /lib/udev/rules.d
cat /lib/udev/rules.d/97-hid2hci.rules
sudo cat /var/log/syslog | grep -i bluetooth
sudo systemctl start bluetooth
sudo systemctl enable bluetooth
ls -l /lib/systemd/system/bluetooth.
ls -l /lib/systemd/system/bluetooth.*
sudo systemctl daemon-reload
sudo systemctl enable bluetooth
sudo systemctl is-enabled bluetooth
file /lib/systemd/system/bluetooth.service
cat /lib/systemd/system/bluetooth.target
cat /lib/systemd/system/bluetooth.service
sudo systemctl enable bluetooth
ls -l /etc/systemd/system


Docs: https://docs.silabs.com/bluetooth/latest/code-examples/applications/midi-over-ble
