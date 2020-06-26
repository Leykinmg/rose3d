import * as THREE from 'three';
import Group from './Group';

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
        this.group = new THREE.Group();
        this.transformation = {
            ...DEFAULT_TRANSFORMATION
        };
        this.lastTransformation = {
            ...DEFAULT_TRANSFORMATION
        };
        this.center = new THREE.Vector3(0, 0, 0);

        this.boundingBox = null;
        this.overstepped = false;
        this.convexGeometry = null;
    }

    calTransformation() {
        // const transformation = {
        //     positionX: 0,
        //     positionY: 0,
        //     positionZ: 0
        // };
        for (const model of this.selecteds) {
            // transformation.positionX += model.transformation.positionX;
            // transformation.positionY += model.transformation.positionY;
            // transformation.positionZ += model.transformation.positionZ;
            this.lastTransformation.positionX = model.transformation.positionX;
            this.lastTransformation.positionY = model.transformation.positionY;
            this.lastTransformation.positionZ = model.transformation.positionZ;
            this.lastTransformation.scaleX = model.transformation.scaleX;
            this.lastTransformation.scaleY = model.transformation.scaleY;
            this.lastTransformation.scaleZ = model.transformation.scaleZ;
            this.lastTransformation.rotationX = model.transformation.rotationX;
            this.lastTransformation.rotationY = model.transformation.rotationY;
            this.lastTransformation.rotationZ = model.transformation.rotationZ;
        }
        // this.transformation.positionX = transformation.positionX / this.selecteds.length;
        // this.transformation.positionY = transformation.positionY / this.selecteds.length;
        // this.transformation.positionZ = transformation.positionZ / this.selecteds.length;
    }

    select(selectedModel) {
        this.selecteds.push(selectedModel);
        this.group.children.push(selectedModel.meshObject);
    }

    unSelect(selectedModel) {
        if (selectedModel) {
            this.selecteds = this.selecteds.filter(model => model !== selectedModel);
            this.group.children = this.group.children.filter(mesh => mesh !== selectedModel.meshObject);
        }
    }

    unSelectAll() {
        this.selecteds = [];
        this.group.children = [];
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
        const scale = {
            x: 1,
            y: 1,
            z: 1
        };
        const rotation = {
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
        if (transformation.scaleX) {
            scale.x = transformation.scaleX / this.lastTransformation.scaleX;
        }
        if (transformation.scaleY) {
            scale.y = transformation.scaleY / this.lastTransformation.scaleY;
        }
        if (transformation.scaleZ) {
            scale.z = transformation.scaleZ / this.lastTransformation.scaleZ;
        }
        if (transformation.rotationX || transformation.rotationX === 0) {
            rotation.x = transformation.rotationX - this.lastTransformation.rotationX;
        }
        if (transformation.rotationY || transformation.rotationY === 0) {
            rotation.y = transformation.rotationY - this.lastTransformation.rotationY;
        }
        if (transformation.rotationZ || transformation.rotationZ === 0) {
            rotation.z = transformation.rotationZ - this.lastTransformation.rotationZ;
        }
        for (const model of this.selecteds) {
            model.updatePosition(position);
            model.updateScale(scale);
            model.updateRotation(rotation);
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
        this.calTransformation();
    }

    changeQuaternion(quaternion) {
        for (const model of this.selecteds) {
            model.meshObject.quaternion.copy(quaternion).multiply(model.quaternionStart).normalize();
        }
        this.calTransformation();
    }

    changeScale(eVec) {
        for (const model of this.selecteds) {
            model.meshObject.scale.copy(model.scaleStart).multiply(eVec);
        }
        this.calTransformation();
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
            model.stickToPlate();
        }
    }

    setExtruder(type) {
        for (const model of this.selecteds) {
            model.setExtruder(type);
        }
    }

    mergeSelected() {
        const offset = new THREE.Vector3(0, 0, 0);
        const group = new Group();
        for (const model of this.selecteds) {
            group.isStick = group.isStick && model.isStick;
            model.isStick = false;
            offset.add(model.center);
        }
        offset.divideScalar(this.selecteds.length);
        for (const model of this.selecteds) {
            model.isStick = false;
            model.meshObject.position.copy(new THREE.Vector3().copy(model.center.clone().sub(offset.clone())));
            group.models.push(model);
            group.meshObject.add(model.meshObject);
        }
        group.computeBoundingBox();
        const offset2 = group.boundingBox.max.clone().add(group.boundingBox.min.clone()).divideScalar(2);
        for (const model of this.selecteds) {
            model.meshObject.position.sub(offset2);
        }
        this.unSelectAll();
        this.select(group);
        group.stickToPlate();
        return group;
    }

    groupSelected() {
        const group = new Group();
        for (const model of this.selecteds) {
            group.isStick = group.isStick && model.isStick;
            model.isStick = false;
            group.models.push(model);
            group.meshObject.add(model.meshObject);
        }
        group.calStick();
        group.computeBoundingBox();
        const offset = group.boundingBox.max.clone().add(group.boundingBox.min.clone()).divideScalar(2);
        group.meshObject.position.copy(offset);
        for (const model of this.selecteds) {
            model.meshObject.position.sub(offset);
        }
        this.unSelectAll();
        this.select(group);
        group.stickToPlate();
        return group;
    }

    unGroupSelected() {
        if (this.selecteds.length !== 1) {
            return;
        }
        if (this.selecteds[0].meshObject.name !== 'g') {
            return;
        }
        const group = this.selecteds[0];
        this.unSelectAll();
        for (const model of group.models) {
            model.meshObject.applyMatrix4(group.meshObject.matrix);
            this.selecteds.push(model);
            model.stickToPlate();
        }
    }
}

export default Selection;
