import * as THREE from 'three';

const DEFAULT_TRANSFORMATION = {
    positionX: 0,
    positionY: 0,
    positionZ: 0,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    scaleX: 1,
    scaleY: 1,
    scaleZ: 1,
    flip: 0
};

// class Model extends THREE.Mesh {
class Selection {
    constructor() {
        this.selecteds = [];
        this.transformation = {
            ...DEFAULT_TRANSFORMATION
        };
        this.lastTransformation = {
            ...DEFAULT_TRANSFORMATION
        };
        this.center = new THREE.Vector3(0, 0, 0);
        this.estimatedTime = 0;

        this.boundingBox = null;
        this.overstepped = false;
        this.convexGeometry = null;
    }

    calTransformation() {
        const transformation = {
            positionX: 0,
            positionY: 0,
            positionZ: 0
        };
        for (const model of this.selecteds) {
            transformation.positionX += model.transformation.positionX;
            transformation.positionY += model.transformation.positionY;
            transformation.positionZ += model.transformation.positionZ;
            this.lastTransformation.positionX = model.transformation.positionX;
            this.lastTransformation.positionY = model.transformation.positionY;
            this.lastTransformation.positionZ = model.transformation.positionZ;
        }
        this.transformation.positionX = transformation.positionX / this.selecteds.length;
        this.transformation.positionY = transformation.positionY / this.selecteds.length;
        this.transformation.positionZ = transformation.positionZ / this.selecteds.length;
    }

    select(selectedModel) {
        this.selecteds.push(selectedModel);
    }

    unSelect(selectedModel) {
        if (selectedModel) {
            this.selecteds = this.selecteds.filter(model => model !== selectedModel);
        }
    }

    unSelectAll() {
        this.selecteds = [];
    }

    check(model) {
        return !!this.selecteds.find(d => d === model);
    }

    updateTransformation(transformation) {
        const position = {
            x: 0,
            y: 0,
            z: 0
        };
        if (transformation.positionX || transformation.positionX === 0) {
            position.x = transformation.positionX - this.lastTransformation.positionX;
        }
        if (transformation.positionY || transformation.positionY === 0) {
            position.y = transformation.positionY - this.lastTransformation.positionY;
        }
        if (transformation.positionZ || transformation.positionZ === 0) {
            position.z = transformation.positionZ - this.lastTransformation.positionZ;
        }
        for (const model of this.selecteds) {
            model.updatePosition(position);
        }
        this.calTransformation();
        return this.lastTransformation;
    }

    addPosition(offset) {
        for (const model of this.selecteds) {
            model.updatePosition(offset);
        }
        this.calTransformation();
        return this.lastTransformation;
    }

    recordInformation() {
        for (const model of this.selecteds) {
            model.recordInformation();
        }
    }

    changePosition(offset) {
        for (const model of this.selecteds) {
            model.meshObject.position.copy(model.positionStart).add(offset);
        }
    }

    changeQuaternion(quaternion) {
        for (const model of this.selecteds) {
            model.meshObject.quaternion.copy(quaternion).multiply(model.quaternionStart).normalize();
        }
    }

    changeScale(eVec) {
        for (const model of this.selecteds) {
            model.meshObject.scale.copy(model.scaleStart).multiply(eVec);
        }
    }

    stickToPlate() {
        for (const model of this.selecteds) {
            model.stickToPlate();
        }
    }

    getIsStick() {
        let isStick = false;
        for (const model of this.selecteds) {
            isStick = isStick || model.isStick;
        }
        return isStick;
    }

    setStick(isStick) {
        for (const model of this.selecteds) {
            model.isStick = isStick;
        }
    }

    mergeSelected() {
        // const bufferGeometry = new THREE.Geometry();
        // const material = new THREE.MeshPhongMaterial({ color: 0xb0b0b0, emissive: 0xffff10, emissiveIntensity: 0.5 });
        const offset = new THREE.Vector3(0, 0, 0);
        const group = new THREE.Group();
        for (const model of this.selecteds) {
            offset.add(model.center);
        }
        offset.divideScalar(this.selecteds.length);
        for (const model of this.selecteds) {
            model.isStick = false;
            model.meshObject.position.copy(new THREE.Vector3().copy(model.center.clone().sub(offset.clone())));
            group.add(model.meshObject);
        }
        return group;
        // return new THREE.Mesh(new THREE.BufferGeometry().fromGeometry(bufferGeometry), material);
    }
}

export default Selection;
