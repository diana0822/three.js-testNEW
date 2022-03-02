console.clear();
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.127.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.127.0/examples/jsm/loaders/GLTFLoader.js';
//import { FBXLoader } from './FBXLoader.js';

//import { RoomEnvironment } from './RoomEnvironment.js';

import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.127.0/examples/jsm/controls/OrbitControls.js';

import { EffectComposer } from 'https://cdn.jsdelivr.net/npm/three@0.127.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.jsdelivr.net/npm/three@0.127.0/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'https://cdn.jsdelivr.net/npm/three@0.127.0/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'https://cdn.jsdelivr.net/npm/three@0.127.0/examples/jsm/postprocessing/UnrealBloomPass.js';

let model;

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 100);
camera.position.set(7.7, 2.5, 7.2);
let renderer = new THREE.WebGLRenderer();
renderer.setSize(innerWidth, innerHeight);
//renderer.setClearColor(0x404040);
document.body.appendChild(renderer.domElement);

let pmremGenerator = new THREE.PMREMGenerator(renderer);

let controls = new OrbitControls(camera, renderer.domElement);
controls.addEventListener("change", e => { console.log(camera.position) })

scene.background = new THREE.Color(0x000000);
//scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;


let light = new THREE.DirectionalLight(0xffffff, 2);
light.position.setScalar(1);
scene.add(light, new THREE.AmbientLight(0xffffff, 0.5));

let uniforms = {
    globalBloom: { value: 1 }
}

/*const loader = new FBXLoader();
loader.load('TestBox.fbx', function(object) {

    //model = object.scene;
    let emssvTex = new THREE.TextureLoader().load("./mission-01.jpg", function(texture) {
        texture.flipY = false
        texture.encoding = THREE.sRGBEncoding
    })
    object.traverse(function(child) {
        if (child.isMesh) {
            child.material.emissiveMap = emssvTex;
            child.material.onBeforeCompile = shader => {
                shader.uniforms.globalBloom = uniforms.globalBloom;
                shader.fragmentShader = `
            uniform float globalBloom;
          ${shader.fragmentShader}
        `.replace(
                    `#include <dithering_fragment>`,
                    `#include <dithering_fragment>
            if (globalBloom > 0.5){
                gl_FragColor = texture2D( emissiveMap, vUv );
            }
          `
                );
                console.log(shader.fragmentShader);
            }
        }
    });
    object.scale.setScalar(40);
    scene.add(object);

});*/

let model2;
let loader2 = new GLTFLoader();

loader2.load("mix-light.glb", function(gltf) {
    model2 = gltf.scene;
    let emssvTex2 = new THREE.TextureLoader().load("https://raw.githubusercontent.com/diana0822/test-new/gh-pages/020202-01.jpg", function(texture) {
        texture.flipY = true
            //texture.wrapS = THREE.RepeatWrapping;
            //texture.wrapT = THREE.RepeatWrapping;
            //texture.repeat.set(1, 1);
        texture.encoding = THREE.sRGBEncoding
    })
    model2.traverse(function(child) {
        if (child.isMesh) {
            child.material.emissiveMap = emssvTex2;
            child.material.onBeforeCompile = shader => {
                shader.uniforms.globalBloom = uniforms.globalBloom;
                shader.fragmentShader = `
            uniform float globalBloom;
          ${shader.fragmentShader}
        `.replace(
                    `#include <dithering_fragment>`,
                    `#include <dithering_fragment>
            if (globalBloom > 0.5){
                gl_FragColor = texture2D( emissiveMap, vUv );
            }
          `
                );
                console.log(shader.fragmentShader);
            }
        }
    });

    model2.scale.setScalar(10);

    scene.add(model2);

}, undefined, function(error) {

    console.error(error);

});

let loader = new GLTFLoader();
loader.load("mix-nolight.glb", function(gltf) {
    model = gltf.scene;
    let emssvTex = new THREE.TextureLoader().load("https://raw.githubusercontent.com/diana0822/test-new/gh-pages/010101-01.jpg", function(texture) {
        texture.flipY = true
            //texture.wrapS = THREE.RepeatWrapping;
            //texture.wrapT = THREE.RepeatWrapping;
            //texture.repeat.set(1, 1);
        texture.encoding = THREE.sRGBEncoding
    })
    model.traverse(function(child) {
        if (child.isMesh) {
            child.material.emissiveMap = emssvTex;
            child.material.onBeforeCompile = shader => {
                shader.uniforms.globalBloom = uniforms.globalBloom;
                shader.fragmentShader = `
            uniform float globalBloom;
          ${shader.fragmentShader}
        `.replace(
                    `#include <dithering_fragment>`,
                    `#include <dithering_fragment>
            if (globalBloom > 0.5){
                gl_FragColor = texture2D( emissiveMap, vUv );
            }
          `
                );
                console.log(shader.fragmentShader);
            }
        }
    });


    model.scale.setScalar(10);
    scene.add(model);
});

// bloom
const renderScene = new RenderPass(scene, camera);

const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.8, 0, 0);

const bloomComposer = new EffectComposer(renderer);
bloomComposer.renderToScreen = false;
bloomComposer.addPass(renderScene);
bloomComposer.addPass(bloomPass);

const finalPass = new ShaderPass(
    new THREE.ShaderMaterial({
        uniforms: {
            baseTexture: { value: null },
            bloomTexture: { value: bloomComposer.renderTarget2.texture }
        },
        vertexShader: document.getElementById('vertexshader').textContent,
        fragmentShader: document.getElementById('fragmentshader').textContent,
        defines: {}
    }), "baseTexture"
);
finalPass.needsSwap = true;

const finalComposer = new EffectComposer(renderer);
finalComposer.addPass(renderScene);
finalComposer.addPass(finalPass);

window.onresize = function() {

    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(innerWidth, innerHeight);

    bloomComposer.setSize(innerWidth, innerHeight);
    finalComposer.setSize(innerWidth, innerHeight);

};

renderer.setAnimationLoop(_ => {

    renderer.setClearColor(0x000000);
    uniforms.globalBloom.value = 1;

    bloomComposer.render();

    renderer.setClearColor(0x404040);
    uniforms.globalBloom.value = 0;

    finalComposer.render();
    //renderer.render(scene, camera);
})