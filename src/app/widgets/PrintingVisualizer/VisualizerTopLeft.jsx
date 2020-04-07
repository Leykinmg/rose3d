import React, { PureComponent } from 'react';
import Uri from 'jsuri';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18next from 'i18next';
import Select from 'react-select';
import Anchor from '../../components/Anchor';
import i18n from '../../lib/i18n';
import styles from './styles.styl';
import { actions as printingActions } from '../../flux/printing';
import modal from '../../lib/modal';

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
        uploadModel: PropTypes.func.isRequired,
        undo: PropTypes.func.isRequired,
        redo: PropTypes.func.isRequired
    };

    fileInput = React.createRef();

    state = {
        // language
        lang: i18next.language
    };

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
            console.log(lang);
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
        }
    };

    render() {
        const actions = this.actions;
        const { canUndo, canRedo } = this.props;
        const langOption = getOption(this.state.lang);
        //select use: https://github.com/JedWatson/react-select/blob/v1.x/examples/src/components/States.js
        return (
            <React.Fragment>
                <input
                    ref={this.fileInput}
                    type="file"
                    accept=".stl, .obj"
                    style={{ display: 'none' }}
                    multiple={false}
                    onChange={actions.onChangeFile}
                />
                <button
                    type="button"
                    className="sm-btn-small sm-btn-primary"
                    style={{ float: 'left' }}
                    title={i18n._('Open File')}
                    onClick={actions.onClickToUpload}
                >
                    {i18n._('Open File')}
                </button>
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
                <Anchor
                    componentClass="button"
                    className={styles['btn-top-left']}
                    onClick={actions.redo}
                    disabled={!canRedo}
                >
                    <div className={styles['btn-redo']} />
                </Anchor>
                <div style={{ width: '110px', position: 'absolute', left: '305px', top: '0px' }}>
                    <Select
                        searchable={false}
                        clearable={false}
                        value={langOption}
                        onChange={actions.selectLanguage}
                        options={LANGUAGE_OPTIONS}
                        onBlurResetsInput={false}
                    />
                </div>
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => {
    const printing = state.printing;
    const { canUndo, canRedo } = printing;

    return {
        canUndo,
        canRedo
    };
};

const mapDispatchToProps = (dispatch) => ({
    uploadModel: (file) => dispatch(printingActions.uploadModel(file)),
    undo: () => dispatch(printingActions.undo()),
    redo: () => dispatch(printingActions.redo())
});


export default connect(mapStateToProps, mapDispatchToProps)(VisualizerTopLeft);
