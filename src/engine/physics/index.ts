import {
  defineComponent,
  defineQuery,
  addComponent,
  removeComponent,
  enterQuery,
  hasComponent,
  exitQuery,
} from "bitecs";
import RAPIER, { RigidBody as RapierRigidBody } from "@dimforge/rapier3d-compat";
import { Quaternion, Vector3 } from "three";

import { GameState, World } from "../GameWorker";
import { setQuaternionFromEuler, Transform } from "../component/transform";
import { defineMapComponent } from "../ecs/MapComponent";
import { Networked, Owned } from "../network";
import { playAudioFromWorker } from "../audio";

const RigidBodySoA = defineComponent({});
export const RigidBody = defineMapComponent<RapierRigidBody, typeof RigidBodySoA>(RigidBodySoA);

export const physicsQuery = defineQuery([RigidBody]);
export const enteredPhysicsQuery = enterQuery(physicsQuery);
export const exitedPhysicsQuery = exitQuery(physicsQuery);

export const applyTransformToRigidBody = (body: RapierRigidBody, eid: number) => {
  const position = Transform.position[eid];
  const quaternion = Transform.quaternion[eid];
  body.setTranslation(new Vector3().fromArray(position), true);
  body.setRotation(new Quaternion().fromArray(quaternion), true);
};

const applyRigidBodyToTransform = (body: RapierRigidBody, eid: number) => {
  const rigidPos = body.translation();
  const rigidRot = body.rotation();
  const position = Transform.position[eid];
  const quaternion = Transform.quaternion[eid];

  position[0] = rigidPos.x;
  position[1] = rigidPos.y;
  position[2] = rigidPos.z;

  quaternion[0] = rigidRot.x;
  quaternion[1] = rigidRot.y;
  quaternion[2] = rigidRot.z;
  quaternion[3] = rigidRot.w;
};

// todo: put on physicsstate
const handleMap = new Map<number, number>();
export const PhysicsSystem = ({ world, physicsWorld, time }: GameState) => {
  // remove rigidbody from physics world
  const exited = exitedPhysicsQuery(world);
  for (let i = 0; i < exited.length; i++) {
    const eid = exited[i];
    const body = RigidBody.store.get(eid);
    if (body) {
      handleMap.delete(body.handle);
      physicsWorld.removeRigidBody(body);
    }
  }

  // apply transform to rigidbody for new physics entities
  const entered = enteredPhysicsQuery(world);
  for (let i = 0; i < entered.length; i++) {
    const eid = entered[i];

    const rotation = Transform.rotation[eid];
    const quaternion = Transform.quaternion[eid];
    setQuaternionFromEuler(quaternion, rotation);

    const body = RigidBody.store.get(eid);
    if (body) {
      applyTransformToRigidBody(body, eid);
      handleMap.set(body.handle, eid);
    }
  }

  // apply rigidbody to transform for regular physics entities
  const physicsEntities = physicsQuery(world);
  for (let i = 0; i < physicsEntities.length; i++) {
    const eid = physicsEntities[i];
    const body = RigidBody.store.get(eid);
    if (body) {
      if (hasComponent(world, Networked, eid) && !hasComponent(world, Owned, eid)) {
        applyTransformToRigidBody(body, eid);
      } else {
        applyRigidBodyToTransform(body, eid);
      }
    }
  }

  // todo: put on physicsstate
  const eventQueue = new RAPIER.EventQueue(true);

  physicsWorld.timestep = time.dt;
  physicsWorld.step(eventQueue);

  eventQueue.drainContactEvents((handle1: RAPIER.RigidBodyHandle, handle2: RAPIER.RigidBodyHandle) => {
    playAudioFromWorker("/audio/hit.wav", handleMap.get(handle2));
  });
};

export function addRigidBody(world: World, eid: number, rigidBody: RapierRigidBody) {
  addComponent(world, RigidBody, eid);
  RigidBody.store.set(eid, rigidBody);
}

export function removeRigidBody(world: World, eid: number, rigidBody: RapierRigidBody) {
  removeComponent(world, RigidBody, eid);
  RigidBody.store.delete(eid);
}
