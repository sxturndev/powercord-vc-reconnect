const { React } = require('powercord/webpack');
const { SliderInput } = require('powercord/components/settings');

module.exports = class settings extends React.PureComponent {
  render () {
    const { getSetting, updateSetting } = this.props;

    return (
      <div>
        <SliderInput
          minValue={300}
          maxValue={5000}
          markers={[ 300, 500, 1000, 4999 ]}
          initialValue={ getSetting('PingThreshold', 500)}
          onValueChange={val =>
            updateSetting('PingThreshold', val)
          }
          stickToMarkers={true}
          required={true}
          note="Set the threshold when the plugin should try to rejoin a VC."
        >
          Ping Threshold
        </SliderInput>
      </div>
    );
  }
};
