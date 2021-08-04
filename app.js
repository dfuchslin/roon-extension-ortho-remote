"use strict";

import { DeviceDiscoveryManager } from 'ortho-remote'
import RoonApi from "node-roon-api";
import RoonApiSettings from 'node-roon-api-settings';
import RoonApiStatus from 'node-roon-api-status';
import RoonApiTransport from 'node-roon-api-transport';

var playingstate = '';
var core;
var roon = new RoonApi({
  extension_id: 'com.gyttja.orthoremote.controller',
  display_name: 'Teenage Engineering Ortho Remote volume controller',
  display_version: "0.0.1",
  publisher: 'gyttja',
  email: 'david',
  website: 'https://github.com/dfuchslin/',

  core_paired: function (core_) {
    core = core_;

    let transport = core.services.RoonApiTransport;
    transport.subscribe_zones(function (cmd, data) {
      try {
        if (cmd == "Changed" && data['zones_changed']) {
          data.zones_changed.forEach(z => {
            if (z.outputs) {
              let found = false;
              z.outputs.forEach(o => { console.log(o.output_id, mysettings.zone.output_id); found = found || o.output_id == mysettings.zone.output_id; });
              if (found) {
                if (playingstate != z.state) {
                  playingstate = z.state;
                }
              }
            }
          });
        }
      } catch (e) {
      }
    });
  },
  core_unpaired: function (core_) {
    core = undefined;
  }
});

var mysettings = Object.assign({
  zone: null,
}, roon.load_config("settings") || {});

function makelayout(settings) {
  var l = {
    values: settings,
    layout: [],
    has_error: false
  };

  l.layout.push({
    type: "zone",
    title: "Zone",
    setting: "zone",
  });

  return l;
}

var svc_settings = new RoonApiSettings(roon, {
  get_settings: function (cb) {
    cb(makelayout(mysettings));
  },
  save_settings: function (req, isdryrun, settings) {
    let l = makelayout(settings.values);
    req.send_complete(l.has_error ? "NotValid" : "Success", { settings: l });

    if (!isdryrun && !l.has_error) {
      mysettings = l.values;
      svc_settings.update_settings(l);
      roon.save_config("settings", mysettings);
    }
  }
});

var svc_status = new RoonApiStatus(roon);

roon.init_services({
  required_services: [RoonApiTransport],
  provided_services: [svc_settings, svc_status],
});

var remote_status = 'neverconnected';
var orthoremote = undefined;

function update_status() {
  switch (remote_status) {
    case 'neverconnected':
      svc_status.set_status('Looking for Ortho Remote', true)
      break;
    case 'connected':
      svc_status.set_status('Ortho Remote connected', false);
      break;
    case 'disconnected':
      svc_status.set_status('Ortho Remote disconnected: wake the remote to reconnect', true)
      break;
    case 'connecting':
      svc_status.set_status('Ortho Remote found, connecting', true);
      break;
  }
}

async function setup_remote() {
  try {
    update_status();

    console.log(`remote_status=${remote_status}`);
    if (remote_status === 'neverconnected') {
      console.log('connecting remote first time');
      const manager = DeviceDiscoveryManager.defaultManager
      const session = manager.startDiscoverySession({ timeoutMs: 10000 })

      console.log('awaiting first device');
      orthoremote = await session.waitForFirstDevice()
      console.log('device found');
      remote_status = 'connecting';
      update_status();
    }

    if (await orthoremote.connect()) {
      remote_status = 'connected';

      orthoremote.on('click', () => { ev_playpause() });
      orthoremote.on('rotate', (rotation) => {
        const volume = parseInt(90 * rotation);
        core.services.RoonApiTransport.change_volume(mysettings.zone, 'absolute', volume);
      })

      orthoremote.on('connect', () => {
        remote_status = 'connected';
        update_status();
      });

      orthoremote.on('disconnect', async () => {
        remote_status = 'disconnected';
        update_status();
      });

    } else {
      remote_status = 'neverconnected';
    }

    update_status();

  } catch (e) {
    console.log(e.message);
    remote_status = 'neverconnected';
    update_status();
  }
}

function ev_playpause() {
  core.services.RoonApiTransport.control(mysettings.zone, 'playpause');
}


setup_remote();
update_status();
/*setInterval(() => {
  if (remote_status === 'disconnected') setup_remote();
}, 1000);*/

roon.start_discovery();
