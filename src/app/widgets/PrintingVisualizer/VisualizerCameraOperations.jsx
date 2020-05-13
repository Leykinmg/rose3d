import React, { PureComponent } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import Anchor from '../../components/Anchor';
import styles from './styles.styl';


class VisualizerCameraOperations extends PureComponent {
    static propTypes = {
        actions: PropTypes.shape({
            toLeft: PropTypes.func.isRequired,
            toTop: PropTypes.func.isRequired,
            toBottom: PropTypes.func.isRequired,
            toRight: PropTypes.func.isRequired,
            autoFocus: PropTypes.func.isRequired
        })
    };

    render() {
        const actions = this.props.actions;
        return (
            <React.Fragment>
                <div style={{ display: 'inline-block', float: 'left' }}>
                    <Anchor
                        className={classNames(styles['turn-left'])}
                        onClick={actions.toLeft}
                    />
                </div>
                <div style={{ display: 'inline-block', float: 'left' }}>
                    <Anchor
                        className={classNames(styles['turn-up'])}
                        onClick={actions.toTop}
                    />
                    <Anchor
                        className={classNames(styles['camera-reset'])}
                        onClick={actions.autoFocus}
                    />
                    <Anchor
                        className={classNames(styles['turn-down'])}
                        onClick={actions.toBottom}
                    />
                </div>
                <div style={{ display: 'inline-block', float: 'left' }}>
                    <Anchor
                        className={classNames(styles['turn-right'])}
                        onClick={actions.toRight}
                    />
                </div>
            </React.Fragment>
        );
    }
}

export default VisualizerCameraOperations;
