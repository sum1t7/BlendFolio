import "./style.scss";
import * as THREE from "three";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import gsap from "gsap";

const clock = new THREE.Clock();
const canvas = document.querySelector("#experience-canvas");
const size = {
  width: window.innerWidth,
  height: window.innerHeight,
};

//Loaders
const textureLoader = new THREE.TextureLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");
const environmentMap = new THREE.CubeTextureLoader()
  .setPath("/textures/envmap/")
  .load(["px.webp", "nx.webp", "py.webp", "ny.webp", "pz.webp", "nz.webp"]);
const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const textureMap = {
  SecondWhites: {
    day: "/textures/room/White.webp",
  },
  FirstWoods: {
    day: "/textures/room/Wood.webp",
  },
  FifthBigOnes: {
    day: "/textures/room/BigOnes.webp",
  },
  FourthColors: {
    day: "/textures/room/Colors.webp",
  },
  ThirdPink: {
    day: "/textures/room/Pink.webp",
  },
};
const loadedTexture = {
  day: {},
};
Object.keys(textureMap).forEach((key) => {
  const dayTexture = textureLoader.load(textureMap[key].day);
  dayTexture.flipY = false;

  dayTexture.colorSpace = THREE.SRGBColorSpace;
  loadedTexture.day[key] = dayTexture;
});
const GlassMaterial = new THREE.MeshPhysicalMaterial({
  transmission: 1,
  roughness: 0,
  metalness: 0,
  ior: 1.5,
  thickness: 0.01,
  opacity: 0.9,
  specularIntensity: 1,
  envMapIntensity: 1,
  envMap: environmentMap,
  lightMapIntensity: 1,
  depthWrite: false,
});

//VARIABLES
const zAxisFans = [];
const yAxisFans = [];
const chairTop = [];
const raycasterobjects = [];
let currentIntersect = [];
let touchHappend = false;
let lastHovered = null;
let plank1 = null;
let plank2 = null;
const about = [];
const contact = [];
const project = [];
const PianoKeys = [];
const HoverObjects = [];
const socialLinks = {
  Github: "https://github.com/sum1t7",
 };
const models = {
  project: document.querySelector(".modal.project"),
  about: document.querySelector(".modal.about"),
  contact: document.querySelector(".modal.contact"),
};

//Screen Video&Photo
const videoElement = document.createElement("video");
videoElement.src = "/textures/video/Back.mp4";
videoElement.loop = true;
videoElement.muted = true;
videoElement.autoplay = true;
videoElement.play();

const videoTexture = new THREE.VideoTexture(videoElement);
videoTexture.center.set(0.5, 0.5);
videoTexture.rotation = -Math.PI / 2;

videoTexture.colorSpace = THREE.SRGBColorSpace;
videoTexture.flipY = false;
const imageElement = document.createElement("img");
imageElement.src = "/textures/video/Photo.webp";
imageElement.crossOrigin = "anonymous";
const imageTexture = new THREE.Texture(imageElement);
imageTexture.needsUpdate = true;
imageTexture.offset.set(0.1, 0);
imageTexture.repeat.set(1.2, 1.2);
imageTexture.colorSpace = THREE.SRGBColorSpace;

//EventListeners
document.querySelectorAll(".modal-exit").forEach((Button) => {
  Button.addEventListener(
    "touchend",
    (event) => {
      touchHappend = true;
      const modal = event.target.closest(".modal");
      hideModal(modal);
    },
    { passive: false }
  );

  Button.addEventListener(
    "click",
    (event) => {
      if (touchHappend) {
        return;
      }
      const modal = event.target.closest(".modal");
      hideModal(modal);
    },
    { passive: false }
  );
});
window.addEventListener(
  "touchstart",
  (e) => {
    // if (isModalOpen) return;
    e.preventDefault();
    pointer.x = (e.touches[0].clientX / size.width) * 2 - 1;
    pointer.y = -(e.touches[0].clientY / size.height) * 2 + 1;
  },
  { passive: false }
);
window.addEventListener(
  "touchend",
  (e) => {
    // if (isModalOpen) return;
    e.preventDefault();
    handleRaycasterInteraction();
  },
  { passive: false }
);
window.addEventListener("click", handleRaycasterInteraction);
window.addEventListener("click", (event) => {
  if (currentIntersect.length > 0) {
    const currentIntersectObject = currentIntersect[0].object;

    Object.entries(socialLinks).forEach(([key, url]) => {
      if (currentIntersectObject.name.includes(key)) {
        const newWindow = window.open();
        newWindow.opener = null;
        newWindow.location = url;
        newWindow.target = "_blank";
        newWindow.rel = "noopener noreferrer";
      }
    });

    if (currentIntersectObject.name.includes("Project")) {
      showModal(models.project);
    } else if (currentIntersectObject.name.includes("About")) {
      showModal(models.about);
    } else if (currentIntersectObject.name.includes("Contact")) {
      showModal(models.contact);
    }
  }
});
window.addEventListener("touchend", (e) => {
  if (currentIntersect.length > 0) {
    const obj = currentIntersect[0].object;
    if (obj.name.includes("PianoKey")) {
      const keyIndex = PianoKeys.indexOf(obj);
      if (keyIndex !== -1) {
        gsap.to(obj.rotation, {
          z: 0.09,
          duration: 0.2,
          ease: "power2.inOut",
          onComplete: () => {
            gsap.to(obj.rotation, {
              z: 0,
              duration: 0.2,
              ease: "power2.inOut",
            });
          },
        });
      }
      const audio = new Audio(`/public/PianoKeys/${keyIndex}.mp3`);
      console.log(keyIndex);
      audio.play();
    }
  }
});
window.addEventListener("click", (e) => {
  if (currentIntersect.length > 0) {
    const obj = currentIntersect[0].object;
    if (obj.name.includes("PianoKey")) {
      const keyIndex = PianoKeys.indexOf(obj);
      if (keyIndex !== -1) {
        gsap.to(obj.rotation, {
          z: 0.09,
          duration: 0.2,
          ease: "power2.inOut",
          onComplete: () => {
            gsap.to(obj.rotation, {
              z: 0,
              duration: 0.2,
              ease: "power2.inOut",
            });
          },
        });
      }
      const audio = new Audio(`/public/PianoKeys/${keyIndex}.mp3`);
      console.log(keyIndex);
      audio.play();
    }
  }
});
window.addEventListener("click", () => {
  if (currentIntersect.length > 0) {
    const obj = currentIntersect[0].object;
    if (obj.name.includes("Fish") || obj.name.includes("Blob")) {
      animateCameraTo(obj.position);
    }
  }
});
window.addEventListener("touchend", () => {
  if (currentIntersect.length > 0) {
    const obj = currentIntersect[0].object;
    if (obj.name.includes("Fish") || obj.name.includes("Blob")) {
      animateCameraTo(obj.position);
    }
  }
});
window.addEventListener("mousemove", (event) => {
  touchHappend = false;
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener("resize", () => {
  size.width = window.innerWidth;
  size.height = window.innerHeight;

  //Upadate Camera
  camera.aspect = size.width / size.height;
  camera.updateProjectionMatrix();

  //Update Renderer
  renderer.setSize(size.width, size.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// MODEL SCENE CAMERA
loader.load("/model/CuteProject12.glb", (glb) => {
  glb.scene.traverse((child) => {
    if (child.isMesh) {
      if (child.name.includes("Glass")) {
        child.material = GlassMaterial;
      } else if (child.name.includes("Water")) {
        child.material = new THREE.MeshPhysicalMaterial({
          color: 0x1a8cff,
          transparent: true,
          opacity: 0.5,
        });
      } else if (child.name.includes("Photo")) {
        child.material = new THREE.MeshBasicMaterial({
          map: imageTexture,
        });
      } else if (child.name.includes("Screen")) {
        child.material = new THREE.MeshBasicMaterial({
          map: videoTexture,
        });
      } else {
        Object.keys(textureMap).forEach((key) => {
          if (child.name.includes(key)) {
            const material = new THREE.MeshBasicMaterial({
              map: loadedTexture.day[key],
            });
            child.material = material;
          }

          if (
            child.name.includes("Fans30") ||
            child.name.includes("Fans23") ||
            child.name.includes("Fans37")
          ) {
            zAxisFans.push(child);
          }
          if (
            child.name.includes("Fans06") ||
            child.name.includes("Fans13") ||
            child.name.includes("Fans20")
          ) {
            yAxisFans.push(child);
          }
          if (child.name.includes("ChairTop")) {
            chairTop.push(child);
          }
          if (child.name.includes("Raycast")) {
            raycasterobjects.push(child);
          }
          if (child.name.includes("PianoKey")) {
            PianoKeys.push(child);
          }
          if (child.name.includes("HorizontalPlank")) {
            plank1 = child;
          }
          if (child.name.includes("VerticalPlank")) {
            plank2 = child;
          }
          if (child.name.includes("About")) {
            about.push(child);
          }
          if (child.name.includes("Contact")) {
            contact.push(child);
          }
          if (child.name.includes("Project")) {
            project.push(child);
          }
          if (child.name.includes("Hover")) {
            HoverObjects.push(child);
          }
        });
      }
    }
  });
  scene.add(glb.scene);
});
const scene = new THREE.Scene();
const focalLength = 50;
const sensorSize = 36;
const fov = 2 * Math.atan(sensorSize / (2 * focalLength)) * (180 / Math.PI);
const camera = new THREE.PerspectiveCamera(
  35,
  size.width / size.height,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(size.width, size.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

camera.position.set(
  -29.805687491307705,
  20.516999020438686,
  31.267064595281692
);
const controls = new OrbitControls(camera, renderer.domElement);

controls.target.set(3.4741997116209347, 15.927475396592332, 3.714915482053487);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minPolarAngle = THREE.MathUtils.degToRad(20);
controls.maxPolarAngle = THREE.MathUtils.degToRad(80);
controls.minAzimuthAngle = THREE.MathUtils.degToRad(-75);
controls.maxAzimuthAngle = THREE.MathUtils.degToRad(-10);
controls.minDistance = 5;
controls.maxDistance = 80;
controls.enablePan = false;

let originalCamPos = camera.position.clone();
let originalTarget = controls.target.clone();

const showModal = (modal) => {
  modal.style.display = "block";
  const tl = gsap.timeline();
  tl.set(modal, { opacity: 1, scale: 0 })
    .to(modal, { opacity: 1, scale: 1.25, duration: 0.3, ease: "power2.inOut" })
    .to(modal, { scale: 0.95, duration: 0.3, ease: "power2.inOut" })
    .to(modal, { opacity: 1, scale: 1, duration: 0.3, ease: "power2.inOut" });
};
const hideModal = (modal) => {
  const tl = gsap.timeline();
  tl.set(modal, { opacity: 1, scale: 1 })
    .to(modal, { opacity: 1, scale: 1.25, duration: 0.2, ease: "power2.inOut" })
    .to(modal, { opacity: 0, scale: 0, duration: 0.2, ease: "power2.inOut" });
};
function animateCameraTo(objectPosition) {
  const newCamPos = objectPosition.clone().add(new THREE.Vector3(2, 0, 2));
  const audio = new Audio("/public/PianoKeys/FishMusic.mp3");
  audio.currentTime = 0;
  audio.play();
  gsap.to(camera.position, {
    x: newCamPos.x,
    y: newCamPos.y,
    z: newCamPos.z,
    duration: 0.6,
    ease: "power2.inOut",
  });

  gsap.to(controls.target, {
    x: objectPosition.x,
    y: objectPosition.y,
    z: objectPosition.z,
    duration: 0.3,
    ease: "power2.inOut",
    onUpdate: () => controls.update(),
  });

  setTimeout(() => {
    gsap.to(camera.position, {
      x: originalCamPos.x,
      y: originalCamPos.y,
      z: originalCamPos.z,
      duration: 1.5,
      ease: "power2.inOut",
    });

    gsap.to(controls.target, {
      x: originalTarget.x,
      y: originalTarget.y,
      z: originalTarget.z,
      duration: 1.5,
      ease: "power2.inOut",
      onUpdate: () => controls.update(),
    });
  }, 4000);

}
function hoverEffect(obj) {
  gsap.to(obj.scale, {
    x: 1.2,
    y: 1.2,
    z: 1.2,
    duration: 0.4,
    ease: "power2.out",
  });
}
function resetObject(obj) {
  gsap.to(obj.scale, {
    x: 1,
    y: 1,
    z: 1,
    duration: 0.3,
    ease: "power2.inOut",
  });
}
function handleRaycasterInteraction() {
  if (currentIntersect.length > 0) {
    const currentIntersectObject = currentIntersect[0].object;

    Object.entries(socialLinks).forEach(([key, url]) => {
      if (currentIntersectObject.name.includes(key)) {
        const newWindow = window.open();
        newWindow.opener = null;
        newWindow.location = url;
        newWindow.target = "_blank";
        newWindow.rel = "noopener noreferrer";
      }
    });

    if (currentIntersectObject.name.includes("Project")) {
      showModal(models.project);
    } else if (currentIntersectObject.name.includes("About")) {
      showModal(models.about);
    } else if (currentIntersectObject.name.includes("Contact")) {
      showModal(models.contact);
    }
  }
}
function introAnimation() {
  const t1 = gsap.timeline({ defaults: { duration: 1, ease: "power2.inOut" } });
}

function animate() {
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(HoverObjects, true); // raycast only against hoverable objects

  if (intersects.length > 0) {
    const obj = intersects[0].object;
    const keyIndex = HoverObjects.indexOf(obj);

    if (keyIndex !== -1) {
      if (lastHovered !== keyIndex) {
        if (lastHovered !== null && HoverObjects[lastHovered]) {
          resetObject(HoverObjects[lastHovered]);
        }
        hoverEffect(obj);
        lastHovered = keyIndex;
      }
    }
  } else {
    if (lastHovered !== null && HoverObjects[lastHovered]) {
      resetObject(HoverObjects[lastHovered]);
      lastHovered = null;
    }
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();

const render = () => {
  zAxisFans.forEach((fan) => {
    fan.rotation.z += 0.01;
  });

  yAxisFans.forEach((fan) => {
    fan.rotation.x += 0.03;
  });
  chairTop.forEach((chair) => {
    chair.rotation.y += Math.sin(clock.getElapsedTime()) * 0.0004;
  });

  //Raycasting
  raycaster.setFromCamera(pointer, camera);
  currentIntersect = raycaster.intersectObjects(raycasterobjects);
  for (let i = 0; i < currentIntersect.length; i++) {}
  if (currentIntersect.length > 0) {
    const currentIntersectObject = currentIntersect[0].object;
    if (currentIntersectObject.name.includes("Pointer")) {
      document.body.style.cursor = "pointer";
    } else {
      document.body.style.cursor = "default";
    }
  } else {
    document.body.style.cursor = "default";
  }

  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(render);
};
render();
