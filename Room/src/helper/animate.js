import { gsap } from "gsap";

let originalCamPos = camera.position.clone();
let originalTarget = controls.target.clone();  

export default function animateCameraTo(objectPosition) {
  const newCamPos = objectPosition.clone().add(new THREE.Vector3(2, 2, 2));  

   gsap.to(camera.position, {
    x: newCamPos.x,
    y: newCamPos.y,
    z: newCamPos.z,
    duration: 1.5,
    ease: "power2.inOut"
  });

   gsap.to(controls.target, {
    x: objectPosition.x,
    y: objectPosition.y,
    z: objectPosition.z,
    duration: 1.5,
    ease: "power2.inOut",
    onUpdate: () => controls.update()
  });

   setTimeout(() => {
    gsap.to(camera.position, {
      x: originalCamPos.x,
      y: originalCamPos.y,
      z: originalCamPos.z,
      duration: 1.5,
      ease: "power2.inOut"
    });

    gsap.to(controls.target, {
      x: originalTarget.x,
      y: originalTarget.y,
      z: originalTarget.z,
      duration: 1.5,
      ease: "power2.inOut",
      onUpdate: () => controls.update()
    });
  }, 3000);
}
