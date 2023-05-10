import * as THREE from "three";
import CANNON from "cannon";
import "./style.css";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import CannonDebugger from 'cannon-es-debugger';


window.localStorage;
window.focus();

let world, mesh, body, load_properties, mass, radius = 0.2, points, score, highscore;
const scene = new THREE.Scene();

const highscoreElement = document.getElementById("highscore");
const resultsElement = document.getElementById("results");
const instructionsElement = document.getElementById("instructions");
const scoreElement = document.getElementById("score");
const timerElement = document.getElementById("timer");


world = new CANNON.World();
world.gravity.set(0, -10, 0);
world.broadphase = new CANNON.NaiveBroadphase();
world.solver.iterations = 10;

init();
function init(){
  load_properties = false;
  points = [];
  score = 0;

  resultsElement.style.display = "none";

  if (window.localStorage.getItem("highscore") == null) {
    window.localStorage.setItem("highscore", 0);
  }

  highscore = window.localStorage.getItem("highscore");
  highscoreElement.innerText = "Highscore : " + highscore;

  scoreElement.style.display = "none";
  timerElement.style.display = "none";
}

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

function timer(){
  let time = 60;
  let timer = setInterval(function(){
    timerElement.innerText = "Time : " + time;
    time--;
    if(time < 0){
      clearInterval(timer);
      gameOver();
    }
  }, 1000);
}

function start() {

  instructionsElement.style.display = "none";
  setInterval(function() {
    generatePoints(radius, true);
  }, 2000);
}

scoreElement.style.display = "flex";
timerElement.style.display = "flex";

camera.position.z = 4;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

const geometry = new THREE.CylinderGeometry(1, 1, 1, 32);
const material = new THREE.MeshBasicMaterial({
  color: 0xffffff,
});

const platform = new THREE.Mesh(
  new THREE.BoxGeometry(10, 1, 10),
  new THREE.MeshBasicMaterial({ color: 0x22a7f0 })
);
platform.position.y = -0.9;
scene.add(platform);


const bucket = new THREE.Mesh(geometry, material);
bucket.position.y = -0.2;
scene.add(bucket);

const bucketBody = new CANNON.Body({
  mass: 0,
  shape: new CANNON.Cylinder(1, 1, 1, 32),
});
const axis = new CANNON.Vec3(1, 0, 0); 
const angle = Math.PI / 2; 

const q = new CANNON.Quaternion();
q.setFromAxisAngle(axis, angle);

bucketBody.quaternion.copy(q);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.position.set(10, 20, 0);
scene.add(directionalLight);

scene.background = new THREE.Color(0x7870ea);


world.addBody(bucketBody);

window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
}

window.addEventListener("keydown", function (event) {
  if (event.key === "a" || event.key === "A") {
    event.preventDefault();
    if(bucket.position.x < -4.5){
      bucket.position.x = 4.5;

    }
    else{
    bucket.position.x -= 0.4;
    }
   } 
   if (event.key === "d" || event.key === "D") {
    event.preventDefault();
    if(bucket.position.x > 4.5){
      bucket.position.x = -4.5;

    }
    else{
    bucket.position.x += 0.4;
    }
  }
  if (event.key === "w"  || event.key === "W") {
    event.preventDefault();
    if(bucket.position.z < -4.5){
      bucket.position.z = 4.5;

    }
    else{
    bucket.position.z -= 0.4;
  }
  }
  if (event.key === "s"   || event.key === "S") {
    event.preventDefault();
    if(bucket.position.z > 4.5){
      bucket.position.z = -4.5;

    }
    else{
    bucket.position.z += 0.4;
    } 
  }
  if(event.key === "r" || event.key === "R"){
    event.preventDefault();
    init();
  }
  if(event.key == " "){
    event.preventDefault();
    start();
  }
});

function generatePoints(radius, falls) {
  let color;
  color = new THREE.Color(0xFFD700);

  const geometry = new THREE.SphereGeometry(radius, 16, 16);
  const material = new THREE.MeshBasicMaterial({ color });
  mesh = new THREE.Mesh(geometry, material);

  mesh.position.set(0,5,0); // for debugging
  // mesh.position.set(
  //   Math.floor(Math.random() * 4) * (Math.round(Math.random()) ? 1 : -1),   
  //   5,                       
  //   Math.floor(Math.random() * 4) * (Math.round(Math.random()) ? 1 : -1)     
  // );
  scene.add(mesh);

  const shape = new CANNON.Sphere(radius);

  mass = 2; 

  body = new CANNON.Body({ mass, shape });
  body.position.set(mesh.position.x, mesh.position.y, mesh.position.z);
  world.addBody(body);

  body.addEventListener("collide", function(e) {
    if (e.body === bucketBody) {
      scene.remove(mesh);
      world.removeBody(body);
      score++;
      scoreElement.innerText = "Score : " + score;
      if (score > highscore) {
        highscore = score;
        window.localStorage.setItem("highscore", highscore);
        highscoreElement.innerText = "Highscore : " + highscore;
      }
    }
  });

  load_properties = true

  return {
    threejs: mesh,
    cannonjs: body
  };
}

function gameOver() {
  if (score > highscore) {
    window.localStorage.setItem("highscore", score);
  }
  highscore = window.localStorage.getItem("highscore");
  highscoreElement.innerText = "Highscore : " + highscore;

  resultsElement.innerText =
  "Game Over!" +
  "\n" +
  "Your score is " +
  (stack.length - 2) +
  "\n" +
  "Press R to restart";

  resultsElement.style.display = "block";
if (stack.length > highscore) {
  localStorage.setItem("highscore", stack.length);
  console.log(localStorage.getItem("highscore"));
  highscore = stack.length - 2;
  highscoreElement.innerText = "Highscore : " + highscore;
}
}
const cannonDebugger = new CannonDebugger(scene, world, {
  color: 0x00FF00,
})

bucketBody.addEventListener("collision", function (event) {
  if (event.body == body) {
    score++;
    console.log(score);
    scene.remove(mesh);
    world.removeBody(body);
    scoreElement.innerText = score;
}});

function animate() {
  requestAnimationFrame(animate);
  updatePhysics();
  cannonDebugger.update() 
  render();
}



function render() {
  renderer.render(scene, camera);
}

function updatePhysics() {
  world.step(1 / 60);
  if (load_properties) {
    mesh.position.copy(body.position);
    mesh.quaternion.copy(body.quaternion);
    bucketBody.position.copy(bucket.position);
    
    
    if (mesh.position.y < -1) {
      
      scene.remove(mesh);
      world.removeBody(body);
      load_properties = false;
    }
  }
  
  // platform.position.copy(ground.position);
  // platform.quaternion.copy(ground.quaternion);
}
animate();
