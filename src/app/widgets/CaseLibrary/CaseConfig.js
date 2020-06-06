
export const CaseConfig150 = [
    {
        tag: '3dp', // 3dp、laser、cnc
        title: '3D Printing Spiral Vase',
        imgSrc: '../../images/user-case/A150/3D-A150.png',
        pathConfig: {
            name: '3DP_test_A150.stl',
            casePath: './A150/'
        },
        material: {
            definitionId: 'Caselibrary.Vase.A150.material', // pla,stl
            // material_diameter: 1.75,
            // material_flow: 100,
            // material_print_temperature: 198,
            // material_print_temperature_layer_0: 200,
            // material_final_print_temperature: 198,
            material_bed_temperature_layer_0: 50
        },
        quality: {
            isRecommand: false,
            definitionId: 'Caselibrary.Vase.A150.quality',
            layer_height: 0.16,

            // layer_height: 0.16,
            speed_wall_0: 40,
            layer_height_0: 0.25,
            magic_spiralize: true
        }
    }
];
