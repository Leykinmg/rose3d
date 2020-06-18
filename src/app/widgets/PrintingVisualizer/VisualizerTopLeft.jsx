import React, { PureComponent } from 'react';
import Uri from 'jsuri';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18next from 'i18next';
import Select from 'react-select';
import { actions as machineActions } from '../../flux/machine';
import Anchor from '../../components/Anchor';
import styles from './styles.styl';
import MachineSelectModal from '../../modals/modal-machine-select';
import { actions as printingActions } from '../../flux/printing';

const LANGUAGE_OPTIONS = [
    { value: 'zh-cn', label: '简体中文' },
    { value: 'en', label: 'English' }
];

const getOption = (lang) => {
    if (lang === 'en') {
        return { value: 'en', label: 'English' };
    }
    if (lang === 'zh-cn') {
        return { value: 'zh-cn', label: '简体中文' };
    }
    return { value: 'en', label: 'English' };
};

class VisualizerTopLeft extends PureComponent {
    static propTypes = {
        canUndo: PropTypes.bool.isRequired,
        canRedo: PropTypes.bool.isRequired,
        undo: PropTypes.func.isRequired,
        redo: PropTypes.func.isRequired,
        series: PropTypes.string.isRequired,
        headType: PropTypes.string,

        updateMachineState: PropTypes.func.isRequired

    };

    fileInput = React.createRef();

    state = {
        // language
        lang: i18next.language
    };

    actions = {
        undo: () => {
            this.props.undo();
        },
        redo: () => {
            this.props.redo();
        },
        selectLanguage: (selectedOption) => {
            if (!selectedOption) {
                return;
            }
            const lang = selectedOption.value;
            this.setState(
                { lang }
            );
            if (lang !== i18next.language) {
                i18next.changeLanguage(lang, () => {
                    const uri = new Uri(window.location.search);
                    uri.replaceQueryParam('lang', lang);
                    window.location.search = uri.toString();
                });
            }
        },
        onClick: () => {
            const { series, headType } = this.props;
            MachineSelectModal({
                series,
                headType,
                onConfirm: (seriesT, headTypeT) => {
                    this.props.updateMachineState({
                        series: seriesT,
                        headType: headTypeT
                    });
                }
            });
        }
    };

    render() {
        const actions = this.actions;
        const { canUndo, canRedo } = this.props;
        const langOption = getOption(this.state.lang);
        // select use: https://github.com/JedWatson/react-select/blob/v1.x/examples/src/components/States.js
        return (
            <React.Fragment>
                <Anchor className={styles['rose-icon']} onClick>
                    <img src="/images/rose/rose.png" width="30" height="30" alt="rose" />
                </Anchor>
                <Anchor
                    componentClass="button"
                    className={styles['btn-top-left']}
                    onClick={actions.undo}
                    disabled={!canUndo}
                >
                    <div className={styles['btn-undo']} />
                </Anchor>
                <Anchor
                    componentClass="button"
                    className={styles['btn-top-left']}
                    onClick={actions.redo}
                    disabled={!canRedo}
                >
                    <div className={styles['btn-redo']} />
                </Anchor>
                <Select
                    className={styles['btn-select']}
                    style={{ height: '30px' }}
                    searchable={false}
                    clearable={false}
                    value={langOption}
                    onChange={actions.selectLanguage}
                    options={LANGUAGE_OPTIONS}
                    onBlurResetsInput={false}
                />
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => {
    const printing = state.printing;
    const { canUndo, canRedo } = printing;

    const { series, headType } = state.machine;
    return {
        series,
        headType,
        canUndo,
        canRedo
    };
};

const mapDispatchToProps = (dispatch) => ({
    uploadModel: (file) => dispatch(printingActions.uploadModel(file)),
    undo: () => dispatch(printingActions.undo()),
    redo: () => dispatch(printingActions.redo()),
    updateMachineState: (state) => dispatch(machineActions.updateMachineState(state))
});


export default connect(mapStateToProps, mapDispatchToProps)(VisualizerTopLeft);
