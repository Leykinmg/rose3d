import React from 'react';
import PropTypes from 'prop-types';
import ControlWidget from './Control/index';
import ScreenConnectionWidget from './ScreenConnection';
import ConsoleWidget from './Console';
import GCodeWidget from './GCode';
import MacroWidget from './Macro';
import MarlinWidget from './Marlin';
import WebcamWidget from './Webcam';
import PrintingMaterialWidget from './PrintingMaterial';
import PrintingConfigurationsWidget from './PrintingConfigurations';
import PrintingOutputWidget from './PrintingOutput';


const getWidgetByName = (name) => {
    const Widget = {
        'control': ControlWidget,
        'connectionPanel': ScreenConnectionWidget,
        'console': ConsoleWidget,
        'gcode': GCodeWidget,
        'macro': MacroWidget,
        'macroPanel': MacroWidget,
        'marlin': MarlinWidget,
        'webcam': WebcamWidget,
        '3dp-material': PrintingMaterialWidget,
        '3dp-configurations': PrintingConfigurationsWidget,
        '3dp-output': PrintingOutputWidget
    }[name];
    if (!Widget) {
        throw new Error(`Unknown Widget ${name}`);
    }
    return Widget;
};

/**
 * Widget Wrapper for getting Widget from widget id.
 */
const Widget = (props) => {
    const { widgetId } = props;

    if (typeof widgetId !== 'string') {
        return null;
    }

    const name = widgetId.split(':')[0];
    const Component = getWidgetByName(name);

    return (
        <Component {...props} />
    );
};

Widget.propTypes = {
    widgetId: PropTypes.string.isRequired
};

export default Widget;
