import { getInputs, Input } from 'easymidi';
import RoonApi from 'node-roon-api';
import RoonApiSettings from 'node-roon-api-settings';
import RoonApiStatus from 'node-roon-api-status';
import RoonApiTransport from 'node-roon-api-transport';

let playingstate = '';
let core;
const roon = new RoonApi({
  extension_id: 'com.gyttja.orthoremote.controller',
  display_name: 'Ortho Remote volume controller test',
  display_version: '0.0.1',
  publisher: 'gyttja',
  email: 'david',
  website: 'https://github.com/dfuchslin/',

  core_paired(core_) {
    core = core_;

    const transport = core.services.RoonApiTransport;
    transport.subscribe_zones((cmd, data) => {
      try {
        if (cmd === 'Changed' && data.zones_changed) {
          data.zones_changed.forEach((z) => {
            if (z.outputs) {
              let found = false;
              z.outputs.forEach((o) => {
                console.log(o.output_id, mysettings.zone.output_id);
                found = found || o.output_id === mysettings.zone.output_id;
              });
              if (found) {
                if (playingstate !== z.state) {
                  playingstate = z.state;
                  // update_led()
                }
              }
            }
          });
        }
      } catch (e) {
        console.error(e);
      }
    });
  },
  core_unpaired(core_) {
    core = undefined;
  },
});

let mysettings = {
  zone: null,
  pressaction: 'togglemute',
  longpressaction: 'stop',
  longpresstimeout: 500,
  rotateaction: 'volume',
  led: 'on',
  seekamount: 5,
  rotationdampener: 1,
  ...roon.load_config('settings') || {},
};

function makelayout(settings) {
  const l = {
    values: settings,
    layout: [],
    has_error: false,
  };

  l.layout.push({
    type: 'zone',
    title: 'Zone',
    setting: 'zone',
  });

  if (settings.rotateaction !== 'none') {
    l.layout.push({
      type: 'dropdown',
      title: 'Rotation Dampener',
      values: [
        { title: 'None', value: 1 },
        { title: 'Some', value: 3 },
        { title: 'More', value: 5 },
        { title: 'Most', value: 7 },
      ],
      setting: 'rotationdampener',
    });
  }

  return l;
}

const svcSettings = new RoonApiSettings(roon, {
  get_settings(cb) {
    cb(makelayout(mysettings));
  },
  save_settings(req, isdryrun, settings) {
    const l = makelayout(settings.values);
    req.send_complete(l.has_error ? 'NotValid' : 'Success', { settings: l });

    if (!isdryrun && !l.has_error) {
      mysettings = l.values;
      svcSettings.update_settings(l);
      roon.save_config('settings', mysettings);
    }
  },
});

const svcStatus = new RoonApiStatus(roon);

roon.init_services({
  required_services: [RoonApiTransport],
  provided_services: [svcSettings, svcStatus],
});

const orthoremote = {};
orthoremote.volumeSteps = 127.0;
orthoremote.errors = {};

function getInputHandle() {
  return getInputs().find((i) => i.includes('ortho'));
}

function onPlayPause(e) {
  if (e.note === 60) {
    console.log('ortho remote button pressed');
    core.services.RoonApiTransport.control(mysettings.zone, 'playpause');
  } else {
    console.log('ortho remote button pressed with an unexpected value', e);
  }
}

function onVolumeChange(e) {
  const { value } = e;
  console.log('ortho remote volume requested', value);

  /*
  // how to get the Output object??
  // console.log('outputs:', core.services.RoonApiTransport.get_outputs(console.log));
  const output = Object.keys(core.services.RoonApiTransport._zones)
    .map((k) => core.services.RoonApiTransport._zones[k].outputs)
    .flat()
    .find((o) => o.output_id === mysettings.zone.output_id)
  */

  // const outputVolume = mysettings.zone.outputs[0].volume;
  const outputVolume = { type: 'db', min: -70, max: 0 };
  if (outputVolume.type === 'db' || outputVolume.type === 'number') {
    const stepSize = (outputVolume.max - outputVolume.min) / orthoremote.volumeSteps;
    const newVolume = new Number((stepSize * value).toFixed(0)) + outputVolume.min;
    console.log('set volume to', newVolume);
    core.services.RoonApiTransport.change_volume(mysettings.zone, 'absolute', newVolume);
  }
}

function updateStatus() {
  if (orthoremote.input) {
    svcStatus.set_status('Ortho remote connected', false);
  } else {
    svcStatus.set_status('Ortho remote disconnected', true);
  }
}

function resetErrors() {
  orthoremote.errors = {};
}

function backoffLogging(e) {
  const msg = e.message;
  const numOfLoggedErrors = Object.keys(orthoremote.errors)
    .map((k) => orthoremote.errors[k])
    .reduce((acc, cur) => acc + cur, 0);
  if (numOfLoggedErrors < 1) {
    updateStatus();
    console.log(msg);
  } else if (numOfLoggedErrors > 1000) {
    console.log('mulitple errors', orthoremote.errors);
    resetErrors();
  }

  if (!orthoremote.errors[msg]) {
    orthoremote.errors[msg] = 0;
  }
  orthoremote.errors[msg] += 1;
}

function setupOrthoremote() {
  // if already open close it
  if (orthoremote.input) {
    orthoremote.input.close();
    delete (orthoremote.input);
  }

  try {
    const inputHandle = getInputHandle(true);
    if (!inputHandle) {
      throw new Error('Ortho remote not connected, no midi device found');
    }
    orthoremote.input = new Input(inputHandle);
    orthoremote.input.on('noteon', onPlayPause);
    orthoremote.input.on('cc', onVolumeChange);
    resetErrors();
    updateStatus();
  } catch (e) {
    backoffLogging(e);
  }
}

setupOrthoremote();
setInterval(() => { if (!getInputHandle() || !orthoremote.input) setupOrthoremote(); }, 100);

roon.start_discovery();
