import * as THREE from "three";
import CANNON from "cannon";
import "./style.css";

let world,
  mesh,
  body,
  load_properties,
  mass,
  radius = 0.2,
  points,
  score,
  highscore,
  restart = false,
  bgSound,
  touchSound,
  endSound,
  gameOn = false,
  pointInterval,
  bombInterval,
  bombMesh,
  bombBody,
  bombs,
  time,
  timerInterval,
  topCameraHeight,
  topCameraWidth;
const scene = new THREE.Scene();

const highscoreElement = document.getElementById("highscore");
const resultsElement = document.getElementById("results");
const instructionsElement = document.getElementById("instructions");
const scoreElement = document.getElementById("score");
const timerElement = document.getElementById("timer");

world = new CANNON.World();
world.gravity.set(0, -5, 0);
world.broadphase = new CANNON.NaiveBroadphase();
world.solver.iterations = 10;

init();
function init() {
  load_properties = false;
  points = [];
  bombs = [];
  score = 0;
  scoreElement.innerText = "Score : " + score;
  topCameraWidth = window.innerWidth / 4;
  topCameraHeight = window.innerHeight / 4;

  resultsElement.style.display = "none";
  gameOn = false;
  if (window.localStorage.getItem("highscore") == null) {
    window.localStorage.setItem("highscore", 0);
  }

  highscore = window.localStorage.getItem("highscore");
  highscoreElement.innerText = "Highscore : " + highscore;

  if (restart == true) {
    bucket.position.set(0, -0.2, 0);
    scoreElement.style.display = "block";
    timerElement.style.display = "block";
    start();
  } else {
    scoreElement.style.display = "none";
    timerElement.style.display = "none";
  }
}

class sound {
  constructor(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    this.sound.volume = 0.5;
    document.body.appendChild(this.sound);
    this.loop = function () {
      this.sound.loop = true;
    };
    this.play = function () {
      this.sound.play();
    };
    this.stop = function () {
      this.sound.pause();
    };
  }
}

bgSound = new sound("./assets/play.wav");

const camera = new THREE.PerspectiveCamera(
  100,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const top_camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.01,
  1000
);

top_camera.position.set(0, 10, 0);
top_camera.lookAt(0, 0, 0);

scene.add(top_camera);

function timer() {
  time = 60;
  timerInterval = setInterval(function () {
    timerElement.innerText = "Time : " + time;
    time--;
    if (time < 0) {
      clearInterval(timerInterval);
      gameOver();
    }
  }, 1000);
}

function start() {
  restart = false;
  gameOn = true;
  bgSound = new sound("./assets/play.wav");
  bgSound.loop();
  bgSound.play();
  bgSound.sound.volume = 0.5;

  instructionsElement.style.display = "none";

  pointInterval = setInterval(function () {
    generatePoints(radius);
  }, 2000);

  bombInterval = setInterval(function () {
    generateBombs(radius * 2);
  }, 5000);

  timer();
  scoreElement.style.display = "block";
  timerElement.style.display = "block";
}

camera.position.z = 7;
camera.position.y = 3;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.CylinderGeometry(1, 1, 1, 32);
const material = new THREE.MeshBasicMaterial({
  color: 0xffffff,
});

const platform = new THREE.Mesh(
  new THREE.BoxGeometry(10, 1, 10),
  new THREE.MeshBasicMaterial({ color: 0xffa69e })
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

scene.background = new THREE.Color(0xa94464);

world.addBody(bucketBody);

window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
}

window.addEventListener("keydown", function (event) {
  if (gameOn) {
    if (event.key === "a" || event.key === "A") {
      event.preventDefault();
      if (bucket.position.x < -4.5) {
          bucket.position.x = 4.5;
      } else {
          bucket.position.x -= 0.4;
      }
    }
    if (event.key === "d" || event.key === "D") {
      event.preventDefault();
      if (bucket.position.x > 4.5) {
          bucket.position.x = -4.5;
      } else {
          bucket.position.x += 0.4;
      }
    }
    if (event.key === "w" || event.key === "W") {
      event.preventDefault();
      if (bucket.position.z < -4.5) {
          bucket.position.z = 4.5;
      } else {
          bucket.position.z -= 0.4;
      }
    }
    if (event.key === "s" || event.key === "S") {
      event.preventDefault();
      if (bucket.position.z > 4.5) {
          bucket.position.z = -4.5;
      } else {
          bucket.position.z += 0.4;
      }
    }
  }
  if (gameOn == false) {
    if (event.key === "r" || event.key === "R") {
      event.preventDefault();
      restart = true;
      init();
    }
    if (restart == false) {
      if (event.key == " ") {
        event.preventDefault();
        start();
      }
    }
  }
});

function generatePoints(radius) {
  let color;
  color = new THREE.Color(0xffd700);

  const geometry = new THREE.SphereGeometry(radius, 16, 16);
  const material = new THREE.MeshBasicMaterial({ color });
  mesh = new THREE.Mesh(geometry, material);

  mesh.position.set(
    Math.floor(Math.random() * 4) * (Math.round(Math.random()) ? 1 : -1),
    5,
    Math.floor(Math.random() * 4) * (Math.round(Math.random()) ? 1 : -1)
  );
  scene.add(mesh);
  points.push(mesh);

  const shape = new CANNON.Sphere(radius);

  mass = 2;

  body = new CANNON.Body({ mass, shape });
  body.position.set(mesh.position.x, mesh.position.y, mesh.position.z);
  world.addBody(body);

  body.addEventListener("collide", function (e) {
    if (e.body === bucketBody) {
      touchSound = new sound("./assets/touch.wav");
      touchSound.play();
      touchSound.sound.volume = 1;
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

  load_properties = true;

  return {
    threejs: mesh,
    cannonjs: body,
  };
}

function stopGeneratingPoints() {
  clearInterval(pointInterval);
  clearInterval(bombInterval);
}

function generateBombs(radius) {
  let color;
  color = new THREE.Color(0x000000);

  const shape = new CANNON.Sphere(radius);
  mass = 2;

  const geometry = new THREE.SphereGeometry(radius, 16, 16);
  const material = new THREE.MeshBasicMaterial({ color });
  bombMesh = new THREE.Mesh(geometry, material);

  bombMesh.position.set(
    Math.floor(Math.random() * 4) * (Math.round(Math.random()) ? 1 : -1),
    5,
    Math.floor(Math.random() * 4) * (Math.round(Math.random()) ? 1 : -1)
  );
  scene.add(bombMesh);
  bombs.push(bombMesh);

  bombBody = new CANNON.Body({ mass, shape });
  bombBody.position.set(
    bombMesh.position.x,
    bombMesh.position.y,
    bombMesh.position.z
  );
  world.addBody(bombBody);

  bombBody.addEventListener("collide", function (e) {
    if (e.body === bucketBody) {
      scene.remove(bombMesh);
      world.removeBody(bombBody);
      gameOver();
    }
  });

  return {
    threejs: bombMesh,
    cannonjs: bombBody,
  };
}

const grid_size = 9.8;
const grid_divisions = 5;

const gridHelper = new THREE.GridHelper(
  grid_size,
  grid_divisions,
  0xa94464,
  0xa94464
);
gridHelper.position.y = -0.35;
scene.add(gridHelper);

function gameOver() {
  if (score > highscore) {
    window.localStorage.setItem("highscore", score);
  }
  gameOn = false;
  highscore = window.localStorage.getItem("highscore");
  highscoreElement.innerText = "Highscore : " + highscore;
  timerElement.style.display = "none";
  scoreElement.style.display = "none";
  resultsElement.style.display = "block";
  endSound = new sound("./assets/win.wav");
  endSound.play();
  bgSound.stop();
  restart = true;
  stopGeneratingPoints();
  clearInterval(timerInterval);

  resultsElement.innerText =
    "Game Over!" +
    "\n" +
    "Your score is " +
    score +
    "\n" +
    "Press R to restart";

  if (score > highscore) {
    localStorage.setItem("highscore", score);
    console.log(localStorage.getItem("highscore"));
    highscore = score;
    highscoreElement.innerText = "Highscore : " + highscore;
  }
}

function animate() {
  requestAnimationFrame(animate);
  updatePhysics();
  render();
}

function render() {
  renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
  renderer.setScissor(0, 0, window.innerWidth, window.innerHeight);
  renderer.setScissorTest(true);
  camera.aspect = window.innerWidth / window.innerHeight;
  renderer.setScissorTest(false);
  renderer.render(scene, camera);

  renderer.setScissor(
    window.innerWidth / 1.3,
    window.innerHeight / 2 - topCameraHeight / 2,
    topCameraWidth,
    topCameraHeight
  );
  renderer.setViewport(
    window.innerWidth / 1.3,
    window.innerHeight / 2 - topCameraHeight / 2,
    topCameraWidth,
    topCameraHeight
  );
  renderer.setScissorTest(true);
  top_camera.aspect = window.innerWidth / window.innerHeight;
  renderer.render(scene, top_camera);
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
  if (bombMesh != undefined) {
    bombMesh.quaternion.copy(bombBody.quaternion);
    bombMesh.position.copy(bombBody.position);
  }
}
animate();
