import { addComponent, addEntity, defineQuery, removeComponent } from "bitecs";
import RAPIER from "@dimforge/rapier3d-compat";

import { ResourceState } from "../resources/ResourceManager";
import {
  addChild,
  addTransformComponent,
  setQuaternionFromEuler,
  Transform,
  updateMatrix,
} from "../component/transform";
import { GameState } from "../GameWorker";
import { addRenderableComponent, setActiveCamera } from "../component/renderable";
import { GLTFEntityDescription, RemoteGLTF } from ".";
import { GLTFLoader } from "./GLTFLoader";
import { loadRemoteResource, RemoteResourceInfo } from "../resources/RemoteResourceManager";
import { SpawnPoint } from "../component/SpawnPoint";
import { LightType, LIGHT_RESOURCE } from "../resources/LightResourceLoader";

function inflateGLTF(state: GameState, entity: GLTFEntityDescription, parentEid?: number) {
  const { world } = state;
  const eid = addEntity(world);

  for (const component of entity.components) {
    switch (component.type) {
      case "transform":
        addTransformComponent(world, eid);
        Transform.position[eid].set(component.position);
        Transform.rotation[eid].set(component.rotation);
        Transform.scale[eid].set(component.scale);
        setQuaternionFromEuler(Transform.quaternion[eid], Transform.rotation[eid]);
        updateMatrix(eid);

        if (parentEid !== undefined) {
          addChild(parentEid, eid);
        }
        break;
      case "renderable":
        addRenderableComponent(state, eid, component.resourceId);
        break;
      case "trimesh": {
        const rigidBodyDesc = RAPIER.RigidBodyDesc.newStatic();
        const rigidBody = state.physicsWorld.createRigidBody(rigidBodyDesc);

        const colliderDesc = RAPIER.ColliderDesc.trimesh(component.vertices, component.indices);
        state.physicsWorld.createCollider(colliderDesc, rigidBody.handle);
        break;
      }
      case "spawn-point":
        addComponent(world, SpawnPoint, eid);
        break;
      case "camera":
        setActiveCamera(state, eid);
        break;
      case "directional-light": {
        const lightResourceId = loadRemoteResource(state.resourceManager, {
          type: LIGHT_RESOURCE,
          lightType: LightType.Directional,
          intensity: 0.5,
        });
        addRenderableComponent(state, eid, lightResourceId);
        break;
      }
    }
  }

  if (entity.children) {
    for (const child of entity.children) {
      inflateGLTF(state, child, eid);
    }
  }

  return eid;
}

export const gltfQuery = defineQuery([GLTFLoader]);

export function GLTFLoaderSystem(state: GameState) {
  const { world, resourceManager } = state;
  const entities = gltfQuery(world);

  for (let i = 0; i < entities.length; i++) {
    const eid = entities[i];
    const resourceId = GLTFLoader.resourceId[eid];
    const resourceInfo = resourceManager.store.get(resourceId) as RemoteResourceInfo<RemoteGLTF>;

    if (resourceInfo.state === ResourceState.Loaded && resourceInfo.remoteResource) {
      inflateGLTF(state, resourceInfo.remoteResource.scene, eid);
      removeComponent(world, GLTFLoader, eid);
    }
  }
}
