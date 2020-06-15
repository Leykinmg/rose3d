// Metric and Imperial units
export const IMPERIAL_UNITS = 'in';
export const METRIC_UNITS = 'mm';

export const EPSILON = 1e-6;

// Controller
export const MARLIN = 'Marlin';

// Workflow State
export const WORKFLOW_STATE_RUNNING = 'running';
export const WORKFLOW_STATE_PAUSED = 'paused';
export const WORKFLOW_STATE_IDLE = 'idle';

// Workflow status
export const WORKFLOW_STATUS_UNKNOWN = 'unknown';
export const WORKFLOW_STATUS_IDLE = 'idle';
export const WORKFLOW_STATUS_RUNNING = 'running';
export const WORKFLOW_STATUS_PAUSED = 'paused';

// Head Type
export const HEAD_TYPE_UNKNOWN = 'UNKNOWN';
export const HEAD_TYPE_3DP = '3DP';
export const HEAD_TYPE_LASER = 'LASER';
export const HEAD_TYPE_CNC = 'CNC';
// Workflow State


// Connection Status
export const CONNECTION_STATUS_IDLE = 'idle';
export const CONNECTION_STATUS_CONNECTING = 'connecting';
export const CONNECTION_STATUS_CONNECTED = 'connected';

// G-code Macro
export const MODAL_NONE = 'none';
export const MODAL_ADD_MACRO = 'add';
export const MODAL_EDIT_MACRO = 'edit';
export const MODAL_RUN_MACRO = 'run';

// Stages for Laser and CNC Carving
export const STAGE_IDLE = 0;
export const STAGE_IMAGE_LOADED = 1;
export const STAGE_PREVIEWING = 2;
export const STAGE_PREVIEWED = 3;
export const STAGE_GENERATED = 4;

// Stages for 3d print
export const STAGES_3DP = {
    noModel: 10,
    modelLoaded: 11,
    gcodeRendered: 12
};

const publicPath = global.PUBLIC_PATH || '';
export const DATA_PREFIX = `${publicPath}/data/Tmp`;


export const PRINTING_GCODE_SUFFIX = '.gcode';

// Replacements for null value
export const ABSENT_VALUE = 896745231;
export const ABSENT_OBJECT = Object.freeze({});

// Experimental features
export const EXPERIMENTAL_WIFI_CONTROL = true;
export const EXPERIMENTAL_LASER_CAMERA = false;
export const EXPERIMENTAL_IMAGE_TRACING = false;
export const EXPERIMENTAL_IMAGE_TRACING_CNC = false;
export const EXPERIMENTAL_PROFILE = true;

export const PROTOCOL_TEXT = 'text';
export const PROTOCOL_SCREEN = 'screen';

export const MAX_LINE_POINTS = 300;
export const TEMPERATURE_MIN = 0;
export const TEMPERATURE_MAX = 300;
export const SPEED_FACTOR_MIN = 0;
export const SPEED_FACTOR_MAX = 500;

export const HEAD_3DP = '3dp';
export const HEAD_UNKNOWN = 'unknown';

export const CONNECTION_TYPE_SERIAL = 'serial';
export const CONNECTION_TYPE_WIFI = 'wifi';

export const LASER_PRINT_MODE_AUTO = 'auto';
export const LASER_PRINT_MODE_MANUAL = 'manual';

export const MACHINE_SERIES = {
    ORIGINAL: {
        value: 'Original',
        label: 'Rose Go',
        setting: {
            size: {
                x: 125, // width
                y: 115, // depth
                z: 125 // height
            }
        }
    },
    RoseX: {
        value: 'RoseX',
        label: 'Rose X',
        setting: {
            size: {
                x: 150,
                y: 150,
                z: 150
            }
        }
    }
};

export const MACHINE_HEAD_TYPE = {
    '3DP': {
        value: '3dp',
        label: '3D Printing',
        alias: ['3DP', '1']
    }
};


export const LASER_MOCK_PLATE_HEIGHT = 6;
