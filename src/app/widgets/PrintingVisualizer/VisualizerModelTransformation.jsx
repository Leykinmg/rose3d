import React, { PureComponent } from 'react';
// import Slider from 'rc-slider';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import * as THREE from 'three';
import Radio from '@material-ui/core/Radio';
// import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import { toFixed } from '../../lib/numeric-utils';
import Anchor from '../../components/Anchor';
import { NumberInput as Input } from '../../components/Input';
import styles from './styles.styl';
import { actions as workspaceActions } from '../../flux/workspace';
import { actions as printingActions } from '../../flux/printing';
import modal from '../../lib/modal';
import i18n from '../../lib/i18n';


class VisualizerModelTransformation extends PureComponent {
    static propTypes = {
        size: PropTypes.object.isRequired,
        selectedModelID: PropTypes.string,
        hasModel: PropTypes.bool.isRequired,
        transformMode: PropTypes.string.isRequired,
        uploadModel: PropTypes.func.isRequired,
        extruder: PropTypes.string,
        series: PropTypes.string,
        isStick: PropTypes.bool,
        selectedCount: PropTypes.number,
        transformation: PropTypes.shape({
            positionX: PropTypes.number,
            positionZ: PropTypes.number,
            positionY: PropTypes.number,
            rotationX: PropTypes.number,
            rotationY: PropTypes.number,
            rotationZ: PropTypes.number,
            scaleX: PropTypes.number,
            scaleY: PropTypes.number,
            scaleZ: PropTypes.number
        }).isRequired,

        onModelAfterTransform: PropTypes.func.isRequired,
        updateSelectedModelTransformation: PropTypes.func.isRequired,
        setTransformMode: PropTypes.func.isRequired,
        layFlatSelectedModel: PropTypes.func.isRequired,
        setModelextruder: PropTypes.func.isRequired,
        setModelstick: PropTypes.func.isRequired
    };

    fileInput = React.createRef();

    actions = {
        onClickToUpload: () => {
            this.fileInput.current.value = null;
            this.fileInput.current.click();
        },
        onChangeFile: async (event) => {
            const file = event.target.files[0];
            try {
                await this.props.uploadModel(file);
            } catch (e) {
                modal({
                    title: i18n._('Failed to upload model'),
                    body: e.message
                });
            }
        },
        onModelTransform: (type, value) => {
            // const { size } = this.props;
            const transformation = {};
            switch (type) {
                case 'moveX':
                    // value = Math.min(Math.max(value, -size.x / 2), size.x / 2);
                    transformation.positionX = value;
                    break;
                case 'moveZ':
                    // value = Math.min(Math.max(value, -size.z / 2), size.z / 2);
                    transformation.positionZ = value;
                    break;
                case 'moveY':
                    // value = Math.min(Math.max(value, -size.z / 2), size.z / 2);
                    transformation.positionY = value;
                    break;
                case 'scaleX':
                    transformation.scaleX = value;
                    break;
                case 'scaleY':
                    transformation.scaleY = value;
                    break;
                case 'scaleZ':
                    transformation.scaleZ = value;
                    break;
                case 'rotateX':
                    transformation.rotationX = value;
                    break;
                case 'rotateY':
                    transformation.rotationY = value;
                    break;
                case 'rotateZ':
                    transformation.rotationZ = value;
                    break;
                default:
                    break;
            }
            this.props.updateSelectedModelTransformation(transformation);
        },
        onModelAfterTransform: () => {
            this.props.onModelAfterTransform();
        },
        setTransformMode: (value) => {
            this.props.setTransformMode(value);
        },
        layFlatSelectedModel: () => {
            this.props.layFlatSelectedModel();
        },
        setModelextruder: (extruder) => {
            this.props.setModelextruder(extruder);
        },
        setModelstick: (isStick) => {
            this.props.setModelstick(isStick);
        }
    };

    state = {
        isStick: false,
        extruder: '0'
    }

    // eslint-disable-next-line camelcase
    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.isStick !== this.props.isStick) {
            this.setState({
                isStick: nextProps.isStick
            });
        }

        if (nextProps.extruder !== this.props.extruder) {
            this.setState({
                extruder: nextProps.extruder
            });
        }
    }

    render() {
        const actions = this.actions;
        // eslint-disable-next-line no-unused-vars
        const { size, selectedModelID, hasModel, transformMode, extruder, isStick, selectedCount, series } = this.props;
        const { positionX, positionZ, positionY, rotationX, rotationY, rotationZ, scaleX, scaleY, scaleZ } = this.props.transformation;
        const disabled = !(selectedCount && selectedModelID && hasModel);
        const moveX = Number(toFixed(positionX, 3));
        const moveZ = Number(toFixed(positionZ, 3));
        const moveY = Number(toFixed(positionY, 3));
        const scaleXPercent = Number(toFixed((scaleX * 100), 1));
        const scaleYPercent = Number(toFixed((scaleY * 100), 1));
        const scaleZPercent = Number(toFixed((scaleZ * 100), 1));
        const rotateX = Number(toFixed(THREE.Math.radToDeg(rotationX), 1));
        const rotateY = Number(toFixed(THREE.Math.radToDeg(rotationY), 1));
        const rotateZ = Number(toFixed(THREE.Math.radToDeg(rotationZ), 1));
        return (
            <React.Fragment>
                <div className={classNames(styles['model-transformation__open'])}>
                    <Anchor
                        componentClass="button"
                        className={classNames(
                            styles['model-operation'],
                            styles['operation-open']
                        )}
                        onClick={() => {
                            actions.onClickToUpload();
                        }}
                    />
                    <input
                        ref={this.fileInput}
                        type="file"
                        accept=".stl, .obj"
                        style={{ display: 'none' }}
                        multiple={false}
                        onChange={actions.onChangeFile}
                    />
                </div>
                <div className={classNames(styles['model-transformation__container'])}>
                    <Anchor
                        componentClass="button"
                        className={classNames(
                            styles['model-operation'],
                            styles['operation-move'],
                            {
                                [styles.selected]: transformMode === 'translate'
                            }
                        )}
                        onClick={() => {
                            actions.setTransformMode('translate');
                        }}
                        disabled={disabled}
                    />
                    <Anchor
                        componentClass="button"
                        className={classNames(
                            styles['model-operation'],
                            styles['operation-scale'],
                            {
                                [styles.selected]: transformMode === 'scale'
                            }
                        )}
                        onClick={() => {
                            actions.setTransformMode('scale');
                        }}
                        disabled={disabled}
                    />
                    <Anchor
                        componentClass="button"
                        className={classNames(
                            styles['model-operation'],
                            styles['operation-rotate'],
                            {
                                [styles.selected]: transformMode === 'rotate'
                            }
                        )}
                        onClick={() => {
                            actions.setTransformMode('rotate');
                        }}
                        disabled={disabled}
                    />
                </div>
                {series === 'RoseX' && (
                    <div className={classNames(styles['model-extruder__select'])}>
                        <FormControlLabel
                            value="0"
                            control={(
                                <Radio
                                    disabled={disabled}
                                    checked={this.state.extruder === '0'}
                                    onChange={() => {
                                        actions.setModelextruder('0');
                                        actions.onModelAfterTransform();
                                    }}
                                    value="0"
                                    name="extruder0"
                                />
                            )}
                            label="extruder0"
                        />
                        <FormControlLabel
                            value="1"
                            control={(
                                <Radio
                                    disabled={disabled}
                                    checked={this.state.extruder === '1'}
                                    onChange={() => {
                                        actions.setModelextruder('1');
                                        actions.onModelAfterTransform();
                                    }}
                                    value="1"
                                    name="extruder0"
                                />
                            )}
                            label="extruder1"
                        />
                    </div>
                )}
                <div className={classNames(styles['model-isStick'])}>
                    <FormControlLabel
                        control={(
                            <Switch
                                disabled={disabled}
                                checked={this.state.isStick}
                                onChange={() => {
                                    actions.setModelstick(!isStick);
                                    actions.onModelAfterTransform();
                                }}
                                name="isStick"
                            />
                        )}
                        label="isStick"
                    />
                </div>
                {!disabled && transformMode === 'translate' && (
                    <div className={classNames(styles.panel, styles['move-panel'])}>
                        <div className={styles.axis}>
                            <span className={classNames(styles['axis-label'], styles['axis-red'])}>X</span>
                            <span className={styles['axis-input-1']}>
                                <Input
                                    value={moveX}
                                    onChange={(value) => {
                                        actions.onModelTransform('moveX', value);
                                        actions.onModelAfterTransform();
                                    }}
                                />
                            </span>
                            <span className={styles['axis-unit-1']}>mm</span>
                        </div>
                        <div className={styles.axis}>
                            <span className={classNames(styles['axis-label'], styles['axis-green'])}>Y</span>
                            <span className={styles['axis-input-1']}>
                                <Input
                                    value={moveZ}
                                    onChange={(value) => {
                                        actions.onModelTransform('moveZ', value);
                                        actions.onModelAfterTransform();
                                    }}
                                />
                            </span>
                            <span className={styles['axis-unit-1']}>mm</span>
                        </div>
                        <div className={styles.axis}>
                            <span className={classNames(styles['axis-label'], styles['axis-blue'])}>Z</span>
                            <span className={styles['axis-input-1']}>
                                <Input
                                    value={moveY}
                                    onChange={(value) => {
                                        actions.onModelTransform('moveY', value);
                                        actions.onModelAfterTransform();
                                    }}
                                />
                            </span>
                            <span className={styles['axis-unit-1']}>mm</span>
                        </div>
                    </div>
                )}
                {!disabled && transformMode === 'scale' && (
                    <div className={classNames(styles.panel, styles['scale-panel'])}>
                        <div className={styles.axis}>
                            <span className={classNames(styles['axis-label'], styles['axis-red'])}>X</span>
                            <span className={styles['axis-input-2']}>
                                <Input
                                    min={0}
                                    value={scaleXPercent}
                                    onChange={(value) => {
                                        actions.onModelTransform('scaleX', value / 100);
                                        actions.onModelAfterTransform();
                                    }}
                                />
                            </span>
                            <span className={styles['axis-unit-2']}>%</span>
                        </div>
                        <div className={styles.axis}>
                            <span className={classNames(styles['axis-label'], styles['axis-green'])}>Y</span>
                            <span className={styles['axis-input-2']}>
                                <Input
                                    min={0}
                                    value={scaleZPercent}
                                    onChange={(value) => {
                                        actions.onModelTransform('scaleZ', value / 100);
                                        actions.onModelAfterTransform();
                                    }}
                                />
                            </span>
                            <span className={styles['axis-unit-2']}>%</span>
                        </div>
                        <div className={styles.axis}>
                            <span className={classNames(styles['axis-label'], styles['axis-blue'])}>Z</span>
                            <span className={styles['axis-input-2']}>
                                <Input
                                    min={0}
                                    value={scaleYPercent}
                                    onChange={(value) => {
                                        actions.onModelTransform('scaleY', value / 100);
                                        actions.onModelAfterTransform();
                                    }}
                                />
                            </span>
                            <span className={styles['axis-unit-2']}>%</span>
                        </div>
                    </div>
                )}
                {!disabled && transformMode === 'rotate' && (
                    <div className={classNames(styles.panel, styles['rotate-panel'])}>
                        <div className={styles.axis}>
                            <span className={classNames(styles['axis-label'], styles['axis-red'])}>X</span>
                            <span className={styles['axis-input-3']}>
                                <Input
                                    min={-180}
                                    max={180}
                                    value={rotateX}
                                    onChange={(degree) => {
                                        actions.onModelTransform('rotateX', THREE.Math.degToRad(degree));
                                        actions.onModelAfterTransform();
                                    }}
                                />
                            </span>
                            <span className={styles['axis-unit-3']}>°</span>
                            {/* <span className={styles['axis-slider']}>*/}
                            {/*    <Slider*/}
                            {/*        handleStyle={{*/}
                            {/*            borderColor: 'white',*/}
                            {/*            backgroundColor: '#e83100'*/}
                            {/*        }}*/}
                            {/*        trackStyle={{*/}
                            {/*            backgroundColor: '#e9e9e9'*/}
                            {/*        }}*/}
                            {/*        value={rotateX}*/}
                            {/*        min={-180}*/}
                            {/*        max={180}*/}
                            {/*        step={0.1}*/}
                            {/*        onChange={(degree) => {*/}
                            {/*            actions.onModelTransform('rotateX', THREE.Math.degToRad(degree));*/}
                            {/*        }}*/}
                            {/*        onAfterChange={() => {*/}
                            {/*            actions.onModelAfterTransform();*/}
                            {/*        }}*/}
                            {/*    />*/}
                            {/* </span>*/}
                        </div>
                        <div className={styles.axis}>
                            <span className={classNames(styles['axis-label'], styles['axis-green'])}>Y</span>
                            <span className={styles['axis-input-3']}>
                                <Input
                                    min={-180}
                                    max={180}
                                    value={rotateZ}
                                    onChange={(degree) => {
                                        actions.onModelTransform('rotateZ', THREE.Math.degToRad(degree));
                                        actions.onModelAfterTransform();
                                    }}
                                />
                            </span>
                            <span className={styles['axis-unit-3']}>°</span>
                            {/* <span className={styles['axis-slider']}>*/}
                            {/*    <Slider*/}
                            {/*        handleStyle={{*/}
                            {/*            borderColor: 'white',*/}
                            {/*            backgroundColor: '#22ac38'*/}
                            {/*        }}*/}
                            {/*        trackStyle={{*/}
                            {/*            backgroundColor: '#e9e9e9'*/}
                            {/*        }}*/}
                            {/*        value={rotateZ}*/}
                            {/*        min={-180}*/}
                            {/*        max={180}*/}
                            {/*        step={0.1}*/}
                            {/*        onChange={(degree) => {*/}
                            {/*            actions.onModelTransform('rotateZ', THREE.Math.degToRad(degree));*/}
                            {/*        }}*/}
                            {/*        onAfterChange={() => {*/}
                            {/*            actions.onModelAfterTransform();*/}
                            {/*        }}*/}
                            {/*    />*/}
                            {/* </span>*/}
                        </div>
                        <div className={styles.axis}>
                            <span className={classNames(styles['axis-label'], styles['axis-blue'])}>Z</span>
                            <span className={styles['axis-input-3']}>
                                <Input
                                    min={-180}
                                    max={180}
                                    value={rotateY}
                                    onChange={(degree) => {
                                        actions.onModelTransform('rotateY', THREE.Math.degToRad(degree));
                                        actions.onModelAfterTransform();
                                    }}
                                />
                            </span>
                            <span className={styles['axis-unit-3']}>°</span>
                            {/* <span className={styles['axis-slider']}>*/}
                            {/*    <Slider*/}
                            {/*        handleStyle={{*/}
                            {/*            borderColor: 'white',*/}
                            {/*            backgroundColor: '#00b7ee'*/}
                            {/*        }}*/}
                            {/*        trackStyle={{*/}
                            {/*            backgroundColor: '#e9e9e9'*/}
                            {/*        }}*/}
                            {/*        value={rotateY}*/}
                            {/*        min={-180}*/}
                            {/*        max={180}*/}
                            {/*        step={0.1}*/}
                            {/*        onChange={(degree) => {*/}
                            {/*            actions.onModelTransform('rotateY', THREE.Math.degToRad(degree));*/}
                            {/*        }}*/}
                            {/*        onAfterChange={() => {*/}
                            {/*            actions.onModelAfterTransform();*/}
                            {/*        }}*/}
                            {/*    />*/}
                            {/* </span>*/}
                        </div>
                        <div className={styles.axis}>
                            <Anchor
                                componentClass="button"
                                className={styles['btn-lay']}
                                onClick={() => {
                                    actions.layFlatSelectedModel();
                                }}
                                disabled={disabled}
                            >
                                {i18n._('layflat')}
                            </Anchor>
                        </div>
                    </div>
                )}
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => {
    const machine = state.machine;
    const printing = state.printing;
    const {
        selectedModelID,
        hasModel,
        transformMode,
        transformation,
        extruder,
        isStick,
        selectedCount
    } = printing;

    return {
        size: machine.size,
        series: machine.series,
        selectedModelID,
        hasModel,
        transformMode,
        transformation,
        extruder,
        isStick,
        selectedCount
    };
};

const mapDispatchToProps = (dispatch) => ({
    clearGcode: () => dispatch(workspaceActions.clearGcode()),
    uploadModel: (file) => dispatch(printingActions.uploadModel(file)),
    onModelAfterTransform: () => dispatch(printingActions.onModelAfterTransform()),
    updateSelectedModelTransformation: (transformation) => dispatch(printingActions.updateSelectedModelTransformation(transformation)),
    setTransformMode: (value) => dispatch(printingActions.setTransformMode(value)),
    layFlatSelectedModel: () => dispatch(printingActions.layFlatSelectedModel()),
    setModelextruder: (extruder) => dispatch(printingActions.setModelextruder(extruder)),
    setModelstick: (isStick) => dispatch(printingActions.setModelstick(isStick))
});


export default connect(mapStateToProps, mapDispatchToProps)(VisualizerModelTransformation);
