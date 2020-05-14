import {
    Object3D,
    PlaneGeometry, MeshBasicMaterial, Mesh,
    TextureLoader
} from 'three';
import RectangleHelper from '../../components/three-extensions/RectangleHelper';
// import RectangleGridHelper from '../../components/three-extensions/RectangleGridHelper';


class PrintableCube extends Object3D {
    constructor(size) {
        super();
        this.type = 'PrintCube';
        this.size = size;
        this._setup();
    }

    updateSize(size) {
        this.size = size;
        this.remove(...this.children);
        this._setup();
    }

    update = () => {
        this.dispatchEvent({ type: 'update' });
    };

    _setup() {
        // Faces
        const bottom = new RectangleHelper(this.size.x, this.size.y);
        bottom.position.set(0, 0, 0);
        bottom.rotation.x = Math.PI; // flip to show left bottom point as zero
        this.add(bottom);

        const top = new RectangleHelper(this.size.x, this.size.y);
        top.position.set(0, this.size.z, 0);
        this.add(top);

        const left = new RectangleHelper(this.size.z, this.size.y);
        left.rotateZ(Math.PI / 2);
        left.position.set(-this.size.x / 2, this.size.z / 2, 0);
        this.add(left);

        const right = new RectangleHelper(this.size.z, this.size.y);
        right.rotateZ(Math.PI / 2);
        right.position.set(this.size.x / 2, this.size.z / 2, 0);
        this.add(right);

        const front = new RectangleHelper(this.size.x, this.size.z);
        front.rotateX(Math.PI / 2);
        front.position.set(0, this.size.z / 2, this.size.y / 2);
        this.add(front);

        const back = new RectangleHelper(this.size.x, this.size.z);
        back.rotateX(Math.PI / 2);
        back.position.set(0, this.size.z / 2, -this.size.y / 2);
        this.add(back);


        // Add logo
        const minSideLength = Math.min(this.size.x, this.size.y);

        const geometry2 = new PlaneGeometry(this.size.x, this.size.y);
        const material2 = new MeshBasicMaterial({
            color: '#f0f0f0'
        });
        const mesh2 = new Mesh(geometry2, material2);
        mesh2.rotateX(-Math.PI / 2);
        this.add(mesh2);

        const geometry = new PlaneGeometry(minSideLength / 7, minSideLength / 7);
        const texture = new TextureLoader().load('./images/rose-arrow.png', this.update);
        const material = new MeshBasicMaterial({
            map: texture,
            opacity: 0.9,
            transparent: true
        });
        const mesh = new Mesh(geometry, material);
        mesh.rotateX(-Math.PI / 2);
        mesh.position.set(0, 0.1, this.size.y / 3);
        this.add(mesh);
    }
}

export default PrintableCube;
