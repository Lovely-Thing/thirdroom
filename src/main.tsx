import React from 'react'
import ReactDOM from 'react-dom'
import './main.css'

import {
  Platform,
  Navigation,
  createRouter,
} from 'hydrogen-view-sdk';
import assetPaths from './assetPaths';
import { RootViewModel } from './viewModels/RoomViewModel';
import { RootView } from './ui/views/RootView'

function renderRootView(root: HTMLElement, vm: RootViewModel) {
  ReactDOM.render(
    <React.StrictMode>
      <RootView vm={vm} />
    </React.StrictMode>,
    root
  )
}

function allowChilds(parent, child) {
  const { type } = child;

  switch (parent?.type) {
    case undefined:
        return type === 'session' || type === 'login';
    case 'session':
        return type === 'room';
    case 'room':
        return type === 'chat';
    default:
        return false;
}
}

async function getFirstExistingSession(platform) {
  const sessions = await platform.sessionInfoStorage.getAll();
  if (!sessions) return undefined;
  return sessions[0];
}

async function main() {
  const rootId = 'root';
  const root = document.getElementById(rootId);
  if (!root) {
    throw `Can not find root element with id: ${rootId}`;
  }

  const config = {
    defaultHomeserver: 'matrix.org',
  };
  const options = {
    development: import.meta.env.DEV,
  };
  
  const platform = new Platform(root, assetPaths, config, options);
  const navigation = new Navigation(allowChilds);
  platform.setNavigation(navigation);
  const urlRouter = createRouter({
    navigation: navigation,
    history: platform.history
  });

  urlRouter.attach();
  
  const vm = new RootViewModel({
    platform,
    navigation,
    urlRouter,
  });
  vm.load();
  window.rootViewModel = vm;

  renderRootView(root, vm)
}
main();