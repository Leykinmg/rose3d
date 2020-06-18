const { notarize } = require('electron-notarize');

module.exports = async function notarizing(context) {
    const { electronPlatformName, appOutDir } = context;

    if (electronPlatformName !== 'darwin') {
        return;
    }

    // Notarize only when running on Travis-CI and has a tag.
    const isTravis = process.env.TRAVIS;
    const tag = process.env.TRAVIS_TAG;
    if (!isTravis || !tag) {
        return;
    }

    console.log('Notarizing application...');
    return;
    // eslint-disable-next-line no-unreachable
    const appName = context.packager.appInfo.productFilename;

    const appleId = process.env.APPLEID;
    const appleIdPassword = process.env.APPLEIDPASS;

    await notarize({
        appBundleId: 'com.snapmaker.luban',
        appPath: `${appOutDir}/${appName}.app`,
        appleId,
        appleIdPassword
    });
};
