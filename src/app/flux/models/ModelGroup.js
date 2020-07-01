// import { Euler, Vector3, Box3, Object3D } from 'three';
import { Vector3, Group } from 'three';
// import { EPSILON } from '../../constants';
import Model from './Model';
import Selection from './Selection';

const EVENTS = {
    UPDATE: { type: 'update' }
};

// class ModelGroup extends Object3D {
class ModelGroup {
    constructor() {
        // this.object = new Object3D();
        this.object = new Group();

        this.models = [];
        this.selection = new Selection();
        this.object.userData.selection = this.selection;

        this.selectedModel = null;
        this.candidatePoints = null;
        this.onSelectedModelTransformChanged = null;

        this._bbox = null;

        this._emptyState = {
            mode: '',
            hasModel: this._hasModel(),
            isAnyModelOverstepped: this._checkAnyModelOverstepped(),
            selectedModelID: null,
            transformation: {}
        };
        this.primeEnable = false;
    }

    onModelUpdate = () => {
        this.object.dispatchEvent(EVENTS.UPDATE);
    };

    _getState(model) {
        const { mode, modelID, transformation, boundingBox, originalName, extruder } = model;
        return {
            originalName: originalName,
            mode: mode,
            selectedModelID: modelID,
            modelID: modelID,
            transformation: { ...transformation },
            boundingBox, // only used in 3dp
            hasModel: this._hasModel(),
            isAnyModelOverstepped: this._checkAnyModelOverstepped(),
            extruder: extruder,
            isStick: this.selection.getIsStick(),
            selectedCount: this.selection.selecteds.length
        };
    }

    addModel(model) {
        if (model) {
            // this.selectedModel = model;
            model.computeBoundingBox();
            model.meshObject.position.x = 0;
            model.meshObject.position.y = 0;
            model.meshObject.position.z = 0;
            model.stickToPlate();
            const xz = this._computeAvailableXZ(model);
            model.meshObject.position.x = xz.x;
            model.meshObject.position.z = xz.z;

            this.models.push(model);
            this.object.add(model.meshObject);
        }
    }

    getModel(modelID) {
        return this.models.find(d => d.modelID === modelID);
    }

    removeSelectedModel() {
        this.selectedModel = null;
        for (const model of this.selection.selecteds) {
            if (model) {
                model.meshObject.removeEventListener('update', this.onModelUpdate);
                this.models = this.models.filter(m => m !== model);
                this.selection.unSelect(model);
                this.object.remove(model.meshObject);
            }
        }
        return this._emptyState;
    }

    setConvexGeometry(uploadName, convexGeometry) {
        const model = this.models.find(m => m.uploadName === uploadName);
        model && model.setConvexGeometry(convexGeometry);
    }

    updateBoundingBox(bbox) {
        this._bbox = bbox;
    }

    removeAllModels() {
        if (this._hasModel()) {
            this.unselectAllModels();
            const models = this.getModels();
            for (const model of models) {
                this.object.remove(model.meshObject);
            }
            this.models.splice(0);
            return this._emptyState;
        }
        return this._emptyState;
    }

    undoRedo(models) {
        this.unselectAllModels();
        this.selection.unSelectAll();
        for (const model of this.models) {
            model.meshObject.removeEventListener('update', this.onModelUpdate);
            this.object.remove(model.meshObject);
        }
        this.models.splice(0);
        for (const model of models) {
            const newModel = model.clone();
            newModel.meshObject.addEventListener('update', this.onModelUpdate);
            newModel.computeBoundingBox();
            this.models.push(newModel);
            this.object.add(newModel.meshObject);
        }
        return this._emptyState;
    }

    getModels() {
        const models = [];
        for (const model of this.models) {
            models.push(model);
        }
        return models;
    }

    getModelState(modelID) {
        const model = this.getModel(modelID);
        if (model) {
            return this._getState(model);
        }
        return null;
    }

    selectModel(modelMeshObject, shiftDown) {
        if (modelMeshObject) {
            const model = this.models.find(d => d.meshObject === modelMeshObject);
            if (shiftDown) {
                if (this.selection.check(model)) {
                    this.selection.unSelect(model);
                    if (this.selection.selecteds.length !== 0) {
                        this.selectedModel = this.selection.selecteds[this.selection.selecteds.length - 1];
                    } else {
                        this.selectedModel = null;
                        return this._emptyState;
                    }
                } else {
                    this.selectedModel = model;
                    this.selection.select(model);
                }
            } else {
                this.selectedModel = model;
                this.selection.unSelectAll();
                this.selection.select(model);
            }
            this.selection.calTransformation();
            model.computeBoundingBox();
            model.onTransform();
            return this._getState(this.selectedModel);
        }
        return null;
    }

    unselectAllModels() {
        this.selection.unSelectAll();
        this.selectedModel = null;
        return this._emptyState;
    }

    arrangeAllModels() {
        const models = this.getModels();
        // this.remove(...models);
        for (const model of models) {
            this.object.remove(model.meshObject);
        }
        this.models.splice(0);

        for (const model of models) {
            model.stickToPlate();
            model.meshObject.position.x = 0;
            model.meshObject.position.y = 0;
            model.meshObject.position.z = 0;
            const xz = this._computeAvailableXZ(model);
            model.meshObject.position.x = xz.x;
            model.meshObject.position.z = xz.z;
            // this.add(model);
            this.models.push(model);
            this.object.add(model.meshObject);
        }
        return this.selectedModel ? this._getState(this.selectedModel) : this._emptyState;
    }

    multiplySelectedModel(count) {
        if (count > 0) {
            for (const model of this.selection.selecteds) {
                for (let i = 0; i < count; i++) {
                    const clone = model.clone();
                    clone.stickToPlate();
                    clone.meshObject.position.x = 0;
                    clone.meshObject.position.z = 0;
                    const xz = this._computeAvailableXZ(clone);
                    clone.meshObject.position.x = xz.x;
                    clone.meshObject.position.z = xz.z;
                    // this.add(model);
                    this.models.push(clone);
                    this.object.add(clone.meshObject);
                    clone.convexGeometry = model.convexGeometry.clone();
                }
            }
            return {
                hasModel: this._hasModel(),
                isAnyModelOverstepped: this._checkAnyModelOverstepped()
            };
        }
        return null;
    }

    getSelectedModelState() {
        return this._getState(this.selectedModel);
    }

    getSelectedModel() {
        return this.selectedModel;
    }

    generateModel(modelInfo) {
        const model = new Model(modelInfo);
        model.meshObject.addEventListener('update', this.onModelUpdate);
        this.addModel(model);
        return this._getState(model);
    }


    layFlatSelectedModel() {
        const selected = this.getSelectedModel();
        if (!selected) {
            return null;
        }

        selected.layFlat();
        selected.computeBoundingBox();
        return this._getState(selected);
    }

    onModelTransform() {
        this.selectedModel.onTransform();
        const { mode, modelID, transformation, boundingBox, originalName } = this.selectedModel;
        return {
            originalName: originalName,
            mode: mode,
            selectedModelID: modelID,
            modelID: modelID,
            transformation: { ...transformation },
            boundingBox, // only used in 3dp
            hasModel: this._hasModel()
        };
    }

    updateSelectedModelTransformation(transformation) {
        if (this.selection.selecteds.length) {
            this.selection.updateTransformation(transformation);
            return this._getState(this.selectedModel);
        }
        // if (this.selectedModel) {
        //     this.selectedModel.updateTransformation(transformation);
        //     return this._getState(this.selectedModel);
        // }
        return null;
    }

    onModelAfterTransform() {
        const selected = this.getSelectedModel();
        if (!selected) {
            return null;
        }

        this.selection.stickToPlate();

        selected.computeBoundingBox();
        return this._getState(selected);
    }

    _computeAvailableXZ(model) {
        if (this.getModels().length === 0) {
            return { x: 0, z: 0 };
        }
        model.computeBoundingBox();
        const modelBox3 = model.boundingBox;
        const box3Arr = [];
        for (const m of this.getModels()) {
            m.computeBoundingBox();
            box3Arr.push(m.boundingBox);
        }

        const length = 65;
        const step = 5; // min distance of models &
        const y = 1;
        for (let stepCount = 1; stepCount < length / step; stepCount++) {
            // check the 4 positions on x&z axis first
            const positionsOnAxis = [
                new Vector3(0, y, stepCount * step),
                new Vector3(0, y, -stepCount * step),
                new Vector3(stepCount * step, y, 0),
                new Vector3(-stepCount * step, y, 0)
            ];
            // clock direction
            const p1 = new Vector3(stepCount * step, y, stepCount * step);
            const p2 = new Vector3(stepCount * step, y, -stepCount * step);
            const p3 = new Vector3(-stepCount * step, y, -stepCount * step);
            const p4 = new Vector3(-stepCount * step, y, stepCount * step);
            const positionsOnSquare = this._getCheckPositions(p1, p2, p3, p4, step);
            const checkPositions = [].concat(positionsOnAxis);
            // no duplicates
            for (const item of positionsOnSquare) {
                if (!(item.x === 0 || item.z === 0)) {
                    checkPositions.push(item);
                }
            }

            // {
            //     const geometry = new Geometry();
            //     for (const vector3 of checkPositions) {
            //         geometry.vertices.push(vector3);
            //     }
            //     const material = new PointsMaterial({ color: 0xff0000 });
            //     const points = new Points(geometry, material);
            //     points.position.y = -1;
            //     this.add(points);
            // }

            for (const position of checkPositions) {
                const modelBox3Clone = modelBox3.clone();
                modelBox3Clone.translate(new Vector3(position.x, 0, position.z));
                if (modelBox3Clone.min.x < this._bbox.min.x
                    || modelBox3Clone.max.x > this._bbox.max.x
                    || modelBox3Clone.min.z < this._bbox.min.z
                    || modelBox3Clone.max.z > this._bbox.max.z) {
                    continue;
                }
                if (!this._isBox3IntersectOthers(modelBox3Clone, box3Arr)) {
                    return { x: position.x, z: position.z };
                }
            }
        }
        return { x: 0, z: 0 };
    }

    getAllBoundingBox() {
        const boundingBox = { max: { x: null, y: null, z: null }, min: { x: null, y: null, z: null } };
        for (const model of this.models) {
            const modelBoundingBox = model.boundingBox;
            boundingBox.max.x = boundingBox.max.x ? Math.max(boundingBox.max.x, modelBoundingBox.max.x) : modelBoundingBox.max.x;
            boundingBox.max.y = boundingBox.max.y ? Math.max(boundingBox.max.y, modelBoundingBox.max.y) : modelBoundingBox.max.y;
            boundingBox.max.z = boundingBox.max.z ? Math.max(boundingBox.max.z, modelBoundingBox.max.z) : modelBoundingBox.max.z;
            boundingBox.min.x = boundingBox.min.x ? Math.min(boundingBox.min.x, modelBoundingBox.min.x) : modelBoundingBox.min.x;
            boundingBox.min.y = boundingBox.min.y ? Math.min(boundingBox.min.y, modelBoundingBox.min.y) : modelBoundingBox.min.y;
            boundingBox.min.z = boundingBox.min.z ? Math.min(boundingBox.min.z, modelBoundingBox.min.z) : modelBoundingBox.min.z;
        }
        return boundingBox;
    }

    _checkAnyModelOverstepped() {
        let isAnyModelOverstepped = false;
        for (const model of this.getModels()) {
            const overstepped = this._checkOverstepped(model);
            model.setOverstepped(overstepped);
            isAnyModelOverstepped = (isAnyModelOverstepped || overstepped);
        }
        return isAnyModelOverstepped;
    }

    _checkOverstepped(model) {
        model.computeBoundingBox();
        if (this.primeEnable) {
            const clone = this.object.userData.primeTower.geometry.clone();
            this.object.userData.primeTower.updateMatrix();
            clone.applyMatrix4(this.object.userData.primeTower.matrix);
            clone.computeBoundingBox();
            const boundingBox = clone.boundingBox;
            if (model.meshObject.name === 'g') {
                if (model.checkOverstepped(boundingBox)) {
                    return true;
                }
            } else {
                model.computeBoundingBox();
                if (model.boundingBox.intersectsBox(boundingBox)) {
                    return true;
                }
            }
        }
        return !this._bbox.containsBox(model.boundingBox);
    }

    _hasModel() {
        return this.getModels().length > 0;
    }

    // not include p1, p2
    _getPositionBetween(p1, p2, step) {
        const positions = [];
        if (p1.x !== p2.x) {
            const z = p1.z;
            const minX = Math.min(p1.x, p2.x) + step;
            const maxX = Math.max(p1.x, p2.x);
            for (let x = minX; x < maxX; x += step) {
                positions.push(new Vector3(x, 1, z));
            }
        } else if (p1.z !== p2.z) {
            const x = p1.x;
            const minZ = Math.min(p1.z, p2.z) + step;
            const maxZ = Math.max(p1.z, p2.z);
            for (let z = minZ; z < maxZ; z += step) {
                positions.push(new Vector3(x, 1, z));
            }
        }
        return positions;
    }

    _getCheckPositions(p1, p2, p3, p4, step) {
        const arr1 = this._getPositionBetween(p1, p2, step);
        const arr2 = this._getPositionBetween(p2, p3, step);
        const arr3 = this._getPositionBetween(p3, p4, step);
        const arr4 = this._getPositionBetween(p4, p1, step);
        return [p1].concat(arr1, [p2], arr2, [p3], arr3, arr4, [p4]);
    }

    _isBox3IntersectOthers(box3, box3Arr) {
        // check intersect with other box3
        for (const otherBox3 of box3Arr) {
            if (box3.intersectsBox(otherBox3)) {
                return true;
            }
        }
        return false;
    }

    cloneModels() {
        return this.models.map(d => d.clone());
    }


    mergeSelected() {
        this.models = this.models.filter(model => !this.selection.selecteds.includes(model));
        const group = this.selection.mergeSelected();
        this.object.add(group.meshObject);
        this.models.push(group);
        this.selectedModel = group;
        return this._getState(group);
    }

    groupSelected() {
        this.models = this.models.filter(model => !this.selection.selecteds.includes(model));
        const group = this.selection.groupSelected();
        this.object.add(group.meshObject);
        this.models.push(group);
        this.selectedModel = group;
        return this._getState(group);
    }

    unGroupSelected() {
        this.models = this.models.filter(model => !this.selection.selecteds.includes(model));
        this.object.remove(this.selection.selecteds[0].meshObject);
        this.selection.unGroupSelected();
        for (const model of this.selection.selecteds) {
            this.object.add(model.meshObject);
            this.models.push(model);
            this.selectedModel = model;
        }
        return this._getState(this.selectedModel);
    }

    getSliceModel() {
        const object = new Group();
        const models = [];
        for (const model of this.models) {
            models.push(model);
        }
        for (const group of models) {
            if (group.meshObject.name === 'g') {
                for (const model of group.models) {
                    const modelClone = model.clone();
                    modelClone.meshObject.applyMatrix4(group.meshObject.matrix);
                    if (modelClone.meshObject.name === 'g') {
                        models.push(modelClone);
                    } else {
                        object.add(modelClone.meshObject);
                    }
                }
            } else {
                object.add(group.meshObject.clone());
            }
        }
        return object;
    }

    getSliceLeftModel() {
        const object = new Group();
        const models = [];
        for (const model of this.models) {
            models.push(model);
        }
        for (const group of models) {
            if (group.meshObject.name === 'g') {
                for (const model of group.models) {
                    const modelClone = model.clone();
                    modelClone.meshObject.applyMatrix4(group.meshObject.matrix);
                    if (modelClone.meshObject.name === 'g') {
                        models.push(modelClone);
                    } else {
                        if (model.extruder === '0') {
                            object.add(modelClone.meshObject);
                        }
                    }
                }
            } else {
                if (group.extruder === '0') {
                    object.add(group.meshObject.clone());
                }
            }
        }
        return object;
    }

    getSliceRightModel() {
        const object = new Group();
        const models = [];
        for (const model of this.models) {
            models.push(model);
        }
        for (const group of models) {
            if (group.meshObject.name === 'g') {
                for (const model of group.models) {
                    const modelClone = model.clone();
                    modelClone.meshObject.applyMatrix4(group.meshObject.matrix);
                    if (modelClone.meshObject.name === 'g') {
                        models.push(modelClone);
                    } else {
                        if (model.extruder === '1') {
                            object.add(modelClone.meshObject);
                        }
                    }
                }
            } else {
                if (group.extruder === '1') {
                    object.add(group.meshObject.clone());
                }
            }
        }
        return object;
    }
}


export default ModelGroup;
