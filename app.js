"use strict";

import { OrthoRemoteWrapper } from "./ortho-remote-wrapper.js";
import RoonApi from "node-roon-api";
import RoonApiSettings from 'node-roon-api-settings';
import RoonApiStatus from 'node-roon-api-status';
import RoonApiTransport from 'node-roon-api-transport';

var playingstate = '';
var core;
var roon = new RoonApi({
  extension_id: 'com.gyttja.beosoundessence.controller',
  display_name: 'BeoSound Essence remote volume controller',
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
                  update_led();
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
  pressaction: "togglemute",
  longpressaction: "stop",
  longpresstimeout: 500,
  rotateaction: "volume",
  led: "on",
  seekamount: 5,
  rotationdampener: 1
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

  if (settings.rotateaction != "none") {
    l.layout.push({
      type: "dropdown",
      title: "Rotation Dampener",
      values: [
        { title: "None", value: 1 },
        { title: "Some", value: 3 },
        { title: "More", value: 5 },
        { title: "Most", value: 7 },
      ],
      setting: "rotationdampener",
    });
  }

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

var orthoremote = undefined;

function update_status() {
  if (orthoremote) {
    svc_status.set_status('Ortho Remote connected', false);
  } else {
    svc_status.set_status('Ortho Remote disconnected', true)
  }
}

async function setup_remote() {
  if (orthoremote) {
    orthoremote.disconnect();
    orthoremote = undefined;
  }

  try {
    orthoremote = await OrthoRemoteWrapper();

    orthoremote.on('click', () => { ev_playpause() });
    orthoremote.on('rotate', (rotation) => {
      var volume = parseInt(90 * rotation);
      console.log(`set volume to ${volume}`);
      core.services.RoonApiTransport.change_volume(mysettings.zone, 'absolute', volume);
    })

    orthoremote.on('disconnect', () => {
      orthoremote = undefined;
      update_status();
    });
    update_status();
  } catch (e) {
    if (new Date().getMinutes() % 5 === 0 && new Date().getSeconds() % 60 === 0) {
      console.log(e.message);
    }
  }
}

function ev_playpause() {
  core.services.RoonApiTransport.control(mysettings.zone, 'playpause');
}

function ev_stop() {
  // core.services.RoonApiTransport.control(mysettings.zone, 'stop');
}

function ev_previous() {

}

function ev_next() {

}


let wheelpostime = 0;
let wheelpos = 0;
function ev_wheelturn(delta) {
  let now = (new Date()).getTime();
  if (!wheelpostime || (now - wheelpostime) > 750) {
    wheelpos = delta;
  } else {
    wheelpos += delta;
  }
  wheelpostime = now;

  let t = wheelpos / mysettings.rotationdampener;
  if (t >= 1 || t <= -1) {
    if (t > 0)
      t = Math.floor(t);
    else
      t = Math.ceil(t);
    wheelpos -= t * mysettings.rotationdampener;

    console.log('powermate turned', t);
    if (!core) return;
    if (!mysettings.zone) return;
    //if (mysettings.rotateaction == "volume") core.services.RoonApiTransport.change_volume(mysettings.zone, 'relative_step', t);
    //else if (mysettings.rotateaction == "seek") core.services.RoonApiTransport.seek(mysettings.zone, 'relative', t * mysettings.seekamount);
    core.services.RoonApiTransport.change_volume(mysettings.zone, 'relative_step', t);
  }
}


setup_remote();
update_status();
/*setInterval(() => {
  if (!orthoremote) setup_remote();
}, 1000);*/

roon.start_discovery();
