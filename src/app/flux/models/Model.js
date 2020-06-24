import uuid from 'uuid';
import * as THREE from 'three';
// import ThreeUtils from '../../components/three-extensions/ThreeUtils';


// const materialSelected = new THREE.MeshPhongMaterial({ color: 0xf0f0f0, specular: 0xb0b0b0, shininess: 30 });
const materialNormal = new THREE.MeshPhongMaterial({ color: 0xb0b0b0, emissive: 0xffff10, emissiveIntensity: 0.5 });
const materialNormal2 = new THREE.MeshPhongMaterial({ color: 0xb0b0b0, emissive: 0xffff10, emissiveIntensity: 0.3 });
const materialOverstepped = new THREE.MeshPhongMaterial({
    color: 0xff0000,
    shininess: 30,
    transparent: true,
    opacity: 0.6
});

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
class Model {
    constructor(modelInfo) {
        const { originalName, uploadName, mode, geometry, material, center,
            transformation } = modelInfo;

        this.meshObject = new THREE.Mesh(geometry, material);
        // this.meshObject.translate()

        this.modelID = uuid.v4();

        this.originalName = originalName;
        this.uploadName = uploadName;
        this.center = new THREE.Vector3(center.x, center.y, center.z);

        this.mode = mode;

        this.transformation = {
            ...DEFAULT_TRANSFORMATION,
            ...transformation
        };


        this.boundingBox = null;
        this.overstepped = false;
        this.convexGeometry = null;
        this.extruder = '0';
        this.material = materialNormal;
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

    // updateTransformation(transformation) {
    //     const { positionX, positionY, positionZ, rotationX, rotationY, rotationZ, scaleX, scaleY, scaleZ, flip } = transformation;
    //     let { width, height } = transformation;
    //
    //     if (positionX !== undefined) {
    //         this.meshObject.position.x = positionX;
    //         this.transformation.positionX = positionX;
    //     }
    //     if (positionY !== undefined) {
    //         this.meshObject.position.y = positionY;
    //         this.transformation.positionY = positionY;
    //     }
    //     if (positionZ !== undefined) {
    //         this.meshObject.position.z = positionZ;
    //         this.transformation.positionZ = positionZ;
    //     }
    //     if (rotationX !== undefined) {
    //         this.meshObject.rotation.x = rotationX;
    //         this.transformation.rotationX = rotationX;
    //     }
    //     if (rotationY !== undefined) {
    //         this.meshObject.rotation.y = rotationY;
    //         this.transformation.rotationY = rotationY;
    //     }
    //     if (rotationZ !== undefined) {
    //         this.meshObject.rotation.z = rotationZ;
    //         this.transformation.rotationZ = rotationZ;
    //     }
    //     if (scaleX !== undefined) {
    //         this.meshObject.scale.x = scaleX;
    //         this.transformation.scaleX = scaleX;
    //     }
    //     if (scaleY !== undefined) {
    //         this.meshObject.scale.y = scaleY;
    //         this.transformation.scaleY = scaleY;
    //     }
    //     if (scaleZ !== undefined) {
    //         this.meshObject.scale.z = scaleZ;
    //         this.transformation.scaleZ = scaleZ;
    //     }
    //     if (flip !== undefined) {
    //         this.transformation.flip = flip;
    //     }
    //     if (width || height) {
    //         const geometrySize = ThreeUtils.getGeometrySize(this.meshObject.geometry, true);
    //         width = width || height * this.sourceWidth / this.sourceHeight;
    //         height = height || width * this.sourceHeight / this.sourceWidth;
    //
    //         const scaleX_ = width / geometrySize.x;
    //         const scaleY_ = height / geometrySize.y;
    //
    //         this.meshObject.scale.set(scaleX_, scaleY_, 1);
    //         this.transformation.width = width;
    //         this.transformation.height = height;
    //     }
    //     return this.transformation;
    // }


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
        if (this.convexGeometry) {
            const clone = this.convexGeometry.clone();
            this.meshObject.updateMatrix();
            clone.applyMatrix(this.meshObject.matrix);
            clone.computeBoundingBox();
            this.boundingBox = clone.boundingBox;
        } else {
            const clone = this.meshObject.geometry.clone();
            this.meshObject.updateMatrix();
            clone.applyMatrix(this.meshObject.matrix);
            clone.computeBoundingBox();
            this.boundingBox = clone.boundingBox;
        }
    }

    // 3D
    setConvexGeometry(convexGeometry) {
        if (convexGeometry instanceof THREE.BufferGeometry) {
            this.convexGeometry = new THREE.Geometry().fromBufferGeometry(convexGeometry);
            this.convexGeometry.mergeVertices();
        } else {
            this.convexGeometry = convexGeometry;
        }
    }

    stickToPlate() {
        if (!this.isStick) {
            return;
        }
        this.computeBoundingBox();
        this.meshObject.position.y = this.meshObject.position.y - this.boundingBox.min.y;
        this.onTransform();
    }

    // 3D
    setMatrix(matrix) {
        this.meshObject.updateMatrix();
        this.meshObject.applyMatrix(new THREE.Matrix4().getInverse(this.meshObject.matrix));
        this.meshObject.applyMatrix(matrix);
        // attention: do not use Object3D.applyMatrix(matrix : Matrix4)
        // because applyMatrix is accumulated
        // anther way: decompose Matrix and reset position/rotation/scale
        // let position = new THREE.Vector3();
        // let quaternion = new THREE.Quaternion();
        // let scale = new THREE.Vector3();
        // matrix.decompose(position, quaternion, scale);
        // this.position.copy(position);
        // this.quaternion.copy(quaternion);
        // this.scale.copy(scale);
    }

    setOverstepped(overstepped) {
        if (this.overstepped === overstepped) {
            return;
        }
        this.overstepped = overstepped;
        if (this.overstepped) {
            // this.material = materialOverstepped;
            this.meshObject.material = materialOverstepped;
        } else {
            // this.material = (this.selected ? materialSelected : materialNormal);
            this.meshObject.material = this.material;
        }
    }

    setMaterial(type) {
        if (type === '0') {
            this.material = materialNormal;
        } else {
            this.material = materialNormal2;
        }
        if (this.overstepped === false) {
            this.meshObject.material = this.material;
        }
        this.stickToPlate();
    }

    clone() {
        const clone = new Model({
            ...this,
            geometry: this.meshObject.geometry.clone(),
            material: this.meshObject.material.clone()
        });
        clone.modelID = this.modelID;
        // this.updateMatrix();
        // clone.setMatrix(this.mesh.Object.matrix);
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

export default Model;
