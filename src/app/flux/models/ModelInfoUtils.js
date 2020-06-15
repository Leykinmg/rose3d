
const sizeModelByMachineSize = (size, width, height) => {
    let height_ = height;
    let width_ = width;
    if (width_ * size.y >= height_ * size.x && width_ > size.x) {
        height_ = size.x * height_ / width_;
        width_ = size.x;
    }
    if (height_ * size.x >= width_ * size.y && height_ > size.y) {
        width_ = size.y * width_ / height_;
        height_ = size.y;
    }
    return { width: width_, height: height_ };
};

const checkParams = (headerType, sourceType, mode) => {
    if (headerType !== 'laser' && headerType !== 'cnc' && headerType !== '3dp') {
        return false;
    }
    if (!['3d', 'raster', 'svg', 'text'].includes(sourceType)) {
        return false;
    }
    if (!['bw', 'greyscale', 'vector', 'trace'].includes(mode)) {
        return false;
    }
    return true;
};


export {
    sizeModelByMachineSize,
    checkParams
};
