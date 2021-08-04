"use strict";

import { getInputs, Input } from 'easymidi';
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
  
  let orthoremote = {};
  orthoremote.errors = 0;
  orthoremote.volume_steps = 127.0;
  
  function update_status() {
    if (orthoremote.input) {
      svc_status.set_status('Ortho remote connected', false);
    } else {
      svc_status.set_status('Ortho remote disconnected', true)
    }
  }
  
  function setup_orthoremote() {
    if (orthoremote.input) {
      orthoremote.input.close();
      delete (orthoremote.input);
    }
  
    try {
      orthoremote.input = new Input(getInputs().filter(i => i.includes('ortho'))[0]);
      orthoremote.input.on('noteon', ev_playpause);
      orthoremote.input.on('cc', ev_volume);
      orthoremote.input.on('reset', () => {
        delete (orthoremote.input);
        update_status();
      });
      orthoremote.errors = 0;
      update_status();

    } catch (e) {
      if (orthoremote.errors % 100 == 0) {
        console.log(e.message);
        orthoremote.errors = 0;
      }
      orthoremote.errors += 1;
    }
  }

  function ev_playpause(e) {
    if (e.note === 60) {
      console.log('ortho remote button pressed');
      core.services.RoonApiTransport.control(mysettings.zone, 'playpause');
    } else {
      console.log('ortho remote button pressed with an unexpected value', e);
    }
  }
  
  function ev_volume(e) {
    const value = e.value;
    console.log('ortho remote volume requested', value);

    // how to get the Output object??
    //console.log('outputs:', core.services.RoonApiTransport.get_outputs(console.log));

    //const outputVolume = mysettings.zone.outputs[0].volume;
    const outputVolume = { type: 'db', min: -70, max: 0 };
    if (outputVolume.type === 'db' || outputVolume.type === 'number') {
      let stepSize = (outputVolume.max - outputVolume.min) / orthoremote.volume_steps;
      let newVolume = new Number((stepSize * value).toFixed(0)) + outputVolume.min;
      console.log('set volume to', newVolume);
      core.services.RoonApiTransport.change_volume(mysettings.zone, 'absolute', newVolume);
    }
  }
  
  setup_orthoremote();
  update_status();
  setInterval(() => { if (!orthoremote.input) setup_orthoremote(); }, 1000);
  
  roon.start_discovery();
  