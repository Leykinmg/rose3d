/* eslint react/no-set-state: 0 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import { Button } from '@trendmicro/react-buttons';
import i18n from '../lib/i18n';
import Modal from '../components/Modal';
import { MACHINE_HEAD_TYPE, MACHINE_SERIES } from '../constants';
import Anchor from '../components/Anchor';
import styles from './styles.styl';

class MachineSelectModal extends PureComponent {
    static propTypes = {
        ...Modal.propTypes,
        series: PropTypes.string,
        headType: PropTypes.string,

        onConfirm: PropTypes.func
    };

    static defaultProps = {
        ...Modal.defaultProps
    };

    state = {
        series: this.props.series || MACHINE_SERIES.ORIGINAL.value,
        headType: this.props.headType || MACHINE_HEAD_TYPE['3DP'].value
    };

    actions = {
        onChangeSeries: (v) => {
            this.setState({
                series: v.value
            });
        },
        onChangeHeadType: (v) => {
            this.setState({
                headType: v.value
            });
        }
    };

    handleClose = () => {
        setTimeout(() => {
            this.removeContainer();
        });
    };

    handleConfirm = () => {
        setTimeout(() => {
            this.removeContainer();
            this.props.onConfirm && this.props.onConfirm(this.state.series, this.state.headType);
        });
    };

    removeContainer() {
        const { container } = this.props;
        ReactDOM.unmountComponentAtNode(container);
        container.remove();
    }

    render() {
        const state = this.state;
        const actions = this.actions;

        const machineSeriesOptions = [
            {
                value: MACHINE_SERIES.ORIGINAL.value,
                label: MACHINE_SERIES.ORIGINAL.label,
                img: 'images/rose/rose.png'
            },
            {
                value: MACHINE_SERIES.RoseX.value,
                label: MACHINE_SERIES.RoseX.label,
                img: 'images/rose-logo-256x256.png'
            }
        ];

        return (
            <Modal disableOverlay showCloseButton={false} size="md" onClose={this.handleClose}>
                <Modal.Header>
                    <Modal.Title>
                        {/* TODO 加翻译 删除原本的翻译*/}
                        <div className={styles['which-model']}>{i18n._('Which Machine wants to choose?')}
                        </div>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className={styles['select-tools']}>
                        { machineSeriesOptions.map(v => {
                            return (
                                <div key={v.value} className={styles['select-tool']}>
                                    <Anchor
                                        className={classNames(styles.selectToolBtn, { [styles.selected]: state.series === v.value })}
                                        onClick={() => actions.onChangeSeries(v)}
                                    >
                                        <img
                                            src={v.img}
                                            role="presentation"
                                            alt="V-Bit"
                                        />
                                    </Anchor>
                                    <span className={styles.selectToolText}>{i18n._(v.label)}</span>
                                </div>
                            );
                        })}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        btnStyle="default"
                        onClick={this.handleConfirm}
                    >
                        {i18n._('Choose')}
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default (options) => new Promise((resolve) => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const props = {
        ...options,
        onClose: () => {
            resolve();
        },
        container: container
    };

    ReactDOM.render(<MachineSelectModal {...props} />, container);
});
