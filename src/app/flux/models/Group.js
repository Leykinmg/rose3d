import uuid from 'uuid';
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

class Group {
    constructor() {
        this.modelID = uuid.v4();
        this.meshObject = new THREE.Group();
        this.models = [];
        this.meshObject.name = 'g';
        this.originalName = 'group';
        this.uploadName = 'group.stl';

        this.mode = '3d';

        this.transformation = {
            ...DEFAULT_TRANSFORMATION
        };


        this.boundingBox = new THREE.Box3();
        this.overstepped = false;
        this.convexGeometry = null;
        this.extruder = '0';
        this.isStick = true;

        this.positionStart = new THREE.Vector3();
        this.quaternionStart = new THREE.Quaternion();
        this.scaleStart = new THREE.Vector3();
    }

    onTransform() {
        const { position, rotation, scale } = this.meshObject;
        const transformation = {
            positionX: position.x,
            positionY: position.y - (this.boundingBox.max.y - this.boundingBox.min.y) / 2,
            positionZ: position.z,
            rotationX: rotation.x,
            rotationY: rotation.y,
            rotationZ: rotation.z,
            scaleX: scale.x,
            scaleY: scale.y,
            scaleZ: scale.z,
            width: this.boundingBox.max.x - this.boundingBox.min.x,
            height: this.boundingBox.max.y - this.boundingBox.min.y
        };
        this.transformation = {
            ...this.transformation,
            ...transformation
        };
        return this.transformation;
    }


    updatePosition(offset) {
        const { x, y, z } = offset;

        if (x !== undefined) {
            this.meshObject.position.x += x;
            this.transformation.positionX += x;
        }
        if (y !== undefined) {
            this.meshObject.position.y += y;
            this.transformation.positionY += y;
        }
        if (z !== undefined) {
            this.meshObject.position.z += z;
            this.transformation.positionZ += z;
        }
    }

    updateConfig(config) {
        this.config = {
            ...this.config,
            ...config
        };
    }

    updateGcodeConfig(gcodeConfig) {
        this.gcodeConfig = {
            ...this.gcodeConfig,
            ...gcodeConfig
        };
    }

    computeBoundingBox() {
        this.boundingBox = this.boundingBox.setFromObject(this.meshObject);
    }

    stickToPlate() {
        if (!this.isStick) {
            return;
        }
        this.computeBoundingBox();
        this.meshObject.position.y = this.meshObject.position.y - this.boundingBox.min.y;
        this.onTransform();
    }

    setMatrix(matrix) {
        this.meshObject.updateMatrix();
        this.meshObject.applyMatrix(new THREE.Matrix4().getInverse(this.meshObject.matrix));
        this.meshObject.applyMatrix(matrix);
    }

    setOverstepped(overstepped) {
        if (this.overstepped === overstepped) {
            return;
        }
        this.overstepped = overstepped;
        for (const model of this.models) {
            model.setOverstepped(overstepped);
        }
    }

    setMaterial(type) {
        for (const model of this.models) {
            model.setMaterial(type);
        }
    }

    clone() {
        const clone = new Group({
            ...this
        });
        clone.modelID = this.modelID;
        this.meshObject.updateMatrix();
        clone.setMatrix(this.meshObject.matrix);
        return clone;
    }

    layFlat() {
        const positionX = this.meshObject.position.x;
        const positionZ = this.meshObject.position.z;
        if (!this.convexGeometry) {
            return;
        }
        let convexGeometryClone = this.convexGeometry.clone();
        // this.updateMatrix();
        this.meshObject.updateMatrix();
        convexGeometryClone.applyMatrix(this.meshObject.matrix);
        let vertices = convexGeometryClone.vertices;

        // find out the following params:
        let minV = vertices[0];
        let dotMin = 1.0;
        let dotV = null;

        for (let i = 0; i < vertices.length; i++) {
            if (vertices[i].y < minV.y) {
                minV = vertices[i];
            }
        }
        for (let i = 0; i < vertices.length; i++) {
            const diff = new THREE.Vector3().subVectors(vertices[i], minV);
            const length = diff.length();
            if (length < 5) {
                continue;
            }
            const dot = diff.y / length;
            if (dotMin > dot) {
                dotMin = dot;
                dotV = diff;
            }
        }
        if (dotV === null) {
            return;
        }
        const angleY = Math.atan2(dotV.z, dotV.x) / 2.0;
        const angleZ = -Math.asin(dotMin) / 2.0;
        const q1 = new THREE.Quaternion(0, Math.sin(angleY), 0, Math.cos(angleY));
        const q2 = new THREE.Quaternion(0, 0, Math.sin(angleZ), Math.cos(angleZ)).multiply(q1).normalize();
        const Matrix2 = new THREE.Matrix4().makeRotationFromQuaternion(q2);
        this.meshObject.applyMatrix(Matrix2);
        this.stickToPlate();
        convexGeometryClone = this.convexGeometry.clone();
        convexGeometryClone.applyMatrix(this.meshObject.matrix);
        vertices = convexGeometryClone.vertices;
        minV = vertices[0];
        for (let i = 0; i < vertices.length; i++) {
            if (vertices[i].y < minV.y) {
                minV = vertices[i];
            }
        }
        dotMin = 1.0;
        dotV = null;
        for (let i = 0; i < vertices.length; i++) {
            const diff = new THREE.Vector3().subVectors(vertices[i], minV);
            const length = Math.sqrt(diff.y * diff.y + diff.z * diff.z);
            if (length < 5) {
                continue;
            }
            const dot = diff.y / length;
            if (dotMin > dot) {
                dotMin = dot;
                dotV = diff;
            }
        }
        if (dotV === null) {
            return;
        }
        let angleX = Math.asin(dotMin) / 2.0;
        if (dotV.z < 0) {
            angleX = -angleX;
        }
        const q3 = new THREE.Quaternion(Math.sin(angleX), 0, 0, Math.cos(angleX));
        const q4 = new THREE.Quaternion(0, Math.sin(-angleY), 0, Math.cos(-angleY)).multiply(q3).normalize();
        const MatrixC = new THREE.Matrix4().makeRotationFromQuaternion(q4);
        this.meshObject.applyMatrix(MatrixC);
        this.stickToPlate();
        this.meshObject.position.x = positionX;
        this.meshObject.position.z = positionZ;
        this.onTransform();
    }

    recordInformation() {
        this.positionStart.copy(this.meshObject.position);
        this.quaternionStart.copy(this.meshObject.quaternion);
        this.scaleStart.copy(this.meshObject.scale);
    }
}

export default Group;
