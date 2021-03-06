/* eslint import/no-unresolved: 0 */
import 'babel-polyfill';
import { app, Menu, BrowserWindow, ipcMain, dialog } from 'electron';
import { configureWindow } from './electron-app/window';
import getMenuTemplate from './electron-app/Menu';
import launchServer from './server-cli';
import DataStorage from './DataStorage';
import pkg from './package.json';


let windowInstance = null;
let lastURL = null;
const options = {
    width: 1280,
    height: 768,
    title: `${pkg.name} ${pkg.version}`
};

function openBrowserWindow(url) {
    const window = new BrowserWindow({
        ...options,
        show: false,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        }
    });

    configureWindow(window);

    // Ignore proxy settings
    // https://electronjs.org/docs/api/session#sessetproxyconfig-callback
    const session = window.webContents.session;
    session.setProxy({ proxyRules: 'direct://' }).then(() => {
        window.loadURL(url);
        window.show();
    });

    return window;
}

const onReady = async () => {
    try {
        // TODO: parse command arguments
        // TODO: create server
        // TODO: start services
        DataStorage.init();

        const data = await launchServer();

        const { address, port, routes } = { ...data };

        // Menu
        const template = getMenuTemplate({ address, port, routes });
        const menu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(menu);

        const url = `http://${address}:${port}`;
        windowInstance = openBrowserWindow(url);

        lastURL = url;
    } catch (err) {
        console.error('Error: ', err);
    }
};

const main = () => {
    // https://github.com/electron/electron/blob/master/docs/api/app.md#apprequestsingleinstancelock
    /*
    // Electron 4
    const gotTheLock = app.requestSingleInstanceLock();

    if (!gotTheLock) {
        app.quit();
        return;
    }

    app.on('second-instance', (event, commandLine, workingDirectory) => {
        // Someone tried to run a second instance, we should focus our window.
        if (!windowManager) {
            return;
        }

        const myWindow = windowManager.getWindow();
        if (myWindow) {
            if (myWindow.isMinimized()) {
                myWindow.restore();
            }
            myWindow.focus();
        }
    });
    */

    // Electron 2
    // Allow multiple instances for controlling more machines
    /*
    const shouldQuit = app.makeSingleInstance(() => {
        if (window) {
            if (window.isMinimized()) {
                window.restore();
            }
            window.focus();
        }
    });

    if (shouldQuit) {
        app.quit();
        return;
    }
    */

    // Allow max 4G memory usage
    if (process.arch === 'x64') {
        app.commandLine.appendSwitch('--js-flags', '--max-old-space-size=4096');
    }

    ipcMain.on('save-gcode', (event, path) => {
        dialog.showSaveDialog({
            title: '导出gcode',
            defaultPath: path,
            filters: [{
                name: 'gcode文件',
                extensions: ['gcode']
            }]
        }).then((filename) => {
            event.sender.send('saved-gcode', filename, path);
        });
    });

    ipcMain.on('save-model', (event, path, output) => {
        dialog.showSaveDialog({
            title: '导出模型',
            defaultPath: path,
            filters: [{
                name: '模型文件stl/obj',
                extensions: ['stl', 'obj']
            }]
        }).then((filename) => {
            event.sender.send('saved-model', filename, output);
        });
    });

    ipcMain.on('save-config', (event) => {
        const uploadPath = `${DataStorage.configDir}/active_final.def.json`;
        dialog.showSaveDialog({
            title: '导出配置',
            defaultPath: uploadPath,
            filters: [{
                name: '切片配置',
                extensions: ['json']
            }]
        }).then((filename) => {
            event.sender.send('saved-config', filename, uploadPath);
        });
    });

    app.commandLine.appendSwitch('ignore-gpu-blacklist');
    app.on('ready', onReady);

    // https://github.com/electron/electron/blob/master/docs/api/app.md#event-activate-os-x
    // Emitted when the application is activated, which usually happens
    // when the user clicks on the application's dock icon.
    app.on('activate', () => {
        if (!windowInstance) {
            openBrowserWindow(lastURL);
        }
    });

    // https://github.com/electron/electron/blob/master/docs/api/app.md#event-window-all-closed
    // Emitted when all windows have been closed.
    // This event is only emitted when the application is not going to quit.
    // If the user pressed Cmd + Q, or the developer called app.quit(), Electron
    // will first try to close all the windows and then emit the will-quit event,
    // and in this case the window-all-closed event would not be emitted.
    app.on('window-all-closed', () => {
        DataStorage.clear();
        app.quit();
    });
};

main();
