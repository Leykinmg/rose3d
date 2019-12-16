import path from 'path';
import fs from 'fs';
import mv from 'mv';
import jimp from 'jimp';
import async from 'async';
import logger from '../../lib/logger';
import SVGParser from '../../lib/SVGParser';
import imageProcess from '../../lib/image-process';
import { pathWithRandomSuffix } from '../../lib/random-utils';
import stockRemap from '../../lib/stock-remap';
import trace from '../../lib/image-trace';
import { ERR_INTERNAL_SERVER_ERROR } from '../../constants';
import DataStorage from '../../DataStorage';
import { stitch, stitchEach } from '../../lib/image-stitch';
import { calibrationPhoto, getCameraCalibration, getPhoto, setMatrix, takePhoto } from '../../lib/image-getPhoto';


const log = logger('api:image');

export const set = (req, res) => {
    const file = req.files.image;
    const originalName = path.basename(file.name);

    const uploadName = pathWithRandomSuffix(originalName);
    const uploadPath = `${DataStorage.tmpDir}/${uploadName}`;

    console.log('inside set ', file.path, uploadPath);
    async.series([
        (next) => {
            mv(file.path, uploadPath, () => {
                next();
            });
        },
        async (next) => {
            if (path.extname(uploadName) === '.svg') {
                const svgParser = new SVGParser();
                const svg = await svgParser.parseFile(uploadPath);

                res.send({
                    originalName: originalName,
                    uploadName: uploadName,
                    width: svg.width,
                    height: svg.height
                });

                next();
            } else {
                jimp.read(uploadPath).then((image) => {
                    res.send({
                        originalName: originalName,
                        uploadName: uploadName,
                        width: image.bitmap.width,
                        height: image.bitmap.height
                    });
                    next();
                }).catch((err) => {
                    next(err);
                });
            }
        }
    ], (err) => {
        if (err) {
            log.error(`Failed to read image ${uploadName}`);
            res.status(ERR_INTERNAL_SERVER_ERROR).end();
        } else {
            res.end();
        }
    });
};

export const laserCaseImage = (req, res) => {
    const { name, casePath } = req.body;
    const originalName = path.basename(name);

    const uploadName = pathWithRandomSuffix(originalName);
    const uploadPath = `${DataStorage.tmpDir}/${uploadName}`;

    async.series([
        (next) => {
            console.log('inside series', path.resolve(casePath, name), uploadPath);
            fs.copyFile(path.resolve(casePath, name), uploadPath, () => {
                next();
            });
        },
        async (next) => {
            if (path.extname(uploadName) === '.svg') {
                const svgParser = new SVGParser();
                const svg = await svgParser.parseFile(uploadPath);

                res.send({
                    originalName: originalName,
                    uploadName: uploadName,
                    width: svg.width,
                    height: svg.height
                });
                console.log('inside svg>>>>>>>>>>>>', res);
                next();
            } else {
                jimp.read(uploadPath).then((image) => {
                    res.send({
                        originalName: originalName,
                        uploadName: uploadName,
                        width: image.bitmap.width,
                        height: image.bitmap.height
                    });
                    next();
                }).catch((err) => {
                    next(err);
                });
            }
        }
    ], (err) => {
        if (err) {
            log.error(`Failed to read image ${uploadName}`);
            res.status(ERR_INTERNAL_SERVER_ERROR).end();
        } else {
            res.end();
        }
    });
};
/**
 * Process Image for Laser.
 *
 * @param req
 * @param res
 */
export const process = (req, res) => {
    const options = req.body;

    let imageOptions;
    if (options.image) {
        imageOptions = {
            ...options,
            image: `${DataStorage.tmpDir}/${path.parse(options.image).base}`
        };
    } else {
        imageOptions = options;
    }

    imageProcess(imageOptions)
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            res.status(ERR_INTERNAL_SERVER_ERROR).send({
                msg: 'Unable to process image',
                error: String(err)
            });
        });
};

export const stockRemapProcess = (req, res) => {
    const options = req.body;

    let imageOptions;
    if (options.image) {
        imageOptions = {
            ...options,
            image: `${DataStorage.tmpDir}/${path.parse(options.image).base}`
        };
    } else {
        imageOptions = options;
    }

    stockRemap(imageOptions)
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            res.status(ERR_INTERNAL_SERVER_ERROR).send({
                msg: 'Unable to process image',
                error: String(err)
            });
        });
};

export const processTrace = (req, res) => {
    const options = req.body;

    let imageOptions;
    if (options.image) {
        imageOptions = {
            ...options,
            image: `${DataStorage.tmpDir}/${path.parse(options.image).base}`
        };
    } else {
        imageOptions = options;
    }

    /*
    async (imageOptions) => {
        const result = await trace(imageOptions);
        res.send(result);
    };
    */
    trace(imageOptions)
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            res.status(ERR_INTERNAL_SERVER_ERROR).send({
                msg: 'Unable to process image',
                error: String(err)
            });
        });
};

// stitch TODO
export const processStitch = (req, res) => {
    const options = req.body;

    let imageOptions;
    if (options.image) {
        imageOptions = {
            ...options,
            image: `${DataStorage.tmpDir}/${path.parse(options.image).base}`
        };
    } else {
        imageOptions = options;
    }

    stitch(imageOptions)
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            res.status(ERR_INTERNAL_SERVER_ERROR).send({
                msg: 'Unable to process image',
                error: String(err)
            });
        });
};

export const processStitchEach = (req, res) => {
    const options = req.body;

    let imageOptions;
    if (options.image) {
        imageOptions = {
            ...options,
            image: `${DataStorage.tmpDir}/${path.parse(options.image).base}`
        };
    } else {
        imageOptions = options;
    }

    stitchEach(imageOptions)
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            res.status(ERR_INTERNAL_SERVER_ERROR).send({
                msg: 'Unable to process image',
                error: String(err)
            });
        });
};

export const processGetPhoto = (req, res) => {
    const options = req.body;

    getPhoto(options)
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            res.status(ERR_INTERNAL_SERVER_ERROR).send({
                msg: 'Unable to process image',
                error: String(err)
            });
        });
};

export const cameraCalibrationPhoto = (req, res) => {
    const options = req.body;

    calibrationPhoto(options)
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            res.status(ERR_INTERNAL_SERVER_ERROR).send({
                msg: 'Unable to process image',
                error: String(err)
            });
        });
};

export const getCameraCalibrationApi = (req, res) => {
    const options = req.body;

    getCameraCalibration(options)
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            res.status(ERR_INTERNAL_SERVER_ERROR).send({
                msg: 'Unable to process image',
                error: String(err)
            });
        });
};

export const processTakePhoto = (req, res) => {
    const options = req.body;

    takePhoto(options)
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            res.status(ERR_INTERNAL_SERVER_ERROR).send({
                msg: 'Unable to process image',
                error: String(err)
            });
        });
};
export const setCameraCalibrationMatrix = (req, res) => {
    const options = req.body;
    setMatrix(options)
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            res.status(ERR_INTERNAL_SERVER_ERROR).send({
                msg: 'Unable to process image',
                error: String(err)
            });
        });
};
