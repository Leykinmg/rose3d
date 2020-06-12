import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Redirect, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { actions as machineActions } from '../flux/machine';
import { actions as developToolsActions } from '../flux/develop-tools';
import { actions as keyboardShortcutActions } from '../flux/keyboardShortcut';
import { actions as printingActions } from '../flux/printing';
import { actions as textActions } from '../flux/text';
import api from '../api';
import Printing from './Printing';
import Settings from './Settings';
import styles from './App.styl';


class App extends PureComponent {
    static propTypes = {
        ...withRouter.propTypes,

        machineInfo: PropTypes.object.isRequired,
        machineInit: PropTypes.func.isRequired,
        developToolsInit: PropTypes.func.isRequired,
        keyboardShortcutInit: PropTypes.func.isRequired,
        printingInit: PropTypes.func.isRequired,
        textInit: PropTypes.func.isRequired
    };

    state = {
        platform: 'unknown'
    };


    componentDidMount() {
        // disable select text on document
        document.onselectstart = () => {
            return false;
        };


        // get platform
        api.utils.getPlatform().then(res => {
            const { platform } = res.body;
            this.setState({ platform: platform });
        });

        // init machine module
        this.props.machineInit();
        this.props.developToolsInit();
        // init keyboard shortcut
        this.props.keyboardShortcutInit();

        this.props.printingInit();
        this.props.textInit();
    }

    render() {
        const { location } = this.props;
        const accepted = ([
            '/',
            '/settings',
            '/developTools',
            '/caselibrary',
            '/settings/general',
            '/settings/machine',
            '/settings/config'
        ].indexOf(location.pathname) >= 0);

        if (!accepted) {
            return (
                <Redirect
                    to={{
                        pathname: '/',
                        state: {
                            from: location
                        }
                    }}
                />
            );
        }

        return (
            <div>
                <div className={styles.main}>
                    <div className={styles.content}>
                        {(this.state.platform !== 'unknown' && this.state.platform !== 'win32') && (
                            <Printing
                                {...this.props}
                                hidden={location.pathname !== '/'}
                            />
                        )}

                        {location.pathname.indexOf('/settings') === 0 && (
                            <Settings {...this.props} />
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const machineInfo = state.machine;
    return {
        machineInfo
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        machineInit: () => dispatch(machineActions.init()),
        developToolsInit: () => dispatch(developToolsActions.init()),
        keyboardShortcutInit: () => dispatch(keyboardShortcutActions.init()),
        printingInit: () => dispatch(printingActions.init()),
        textInit: () => dispatch(textActions.init())
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));
