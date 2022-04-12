const { Plugin } = require('powercord/entities');
const { getModule, FluxDispatcher } = require('powercord/webpack');
const { getVoiceChannelId } = getModule([ 'getVoiceChannelId' ], false);
const { selectVoiceChannel } = getModule([ 'selectVoiceChannel' ], false);

const Settings = require('./components/settings.jsx');

module.exports = class VCReconnect extends Plugin {
  constructor () {
    super();
    this.pingCheckEnabled = true;
  }

  /* Entry Point */
  startPlugin () {
    this.checkPing = this.checkPing.bind(this);

    FluxDispatcher.subscribe('RTC_CONNECTION_PING', this.checkPing);

    powercord.api.settings.registerSettings(this.entityID, {
      category: this.entityID,
      label: this.manifest.name,
      render: Settings
    });
  }

  checkPing (arg) {
    if (!this.pingCheckEnabled) {
      return;
    }

    const lastPing = arg.pings.pop().value;
    const pingThreshold = this.settings.get('PingThreshold');

    if (lastPing > pingThreshold) {
      console.log(`[VC Reconnect] Ping higher than set threshold! Attempting to rejoin VC. ${lastPing} > ${pingThreshold}`);
      this.reconnect();
    }
  }

  reconnect () {
    const setPing = () => {
      this.pingCheckEnabled = !this.pingCheckEnabled;
    };

    const voiceId = getVoiceChannelId();
    FluxDispatcher.subscribe('RTC_CONNECTION_STATE', function func (e) {
      if (e.state === 'DISCONNECTED') {
        selectVoiceChannel(voiceId);

        setTimeout(() => {
          setPing();
          FluxDispatcher.unsubscribe('RTC_CONNECTION_STATE', func);
        }, 10000);
      }
    });

    setPing();
    selectVoiceChannel(null);
  }

  /* Unsubscribe/Unregister when unloading the plugin */
  pluginWillUnload () {
    powercord.api.settings.unregisterSettings(this.entityID);
    FluxDispatcher.unsubscribe('RTC_CONNECTION_PING', this.checkPing);
  }
};
