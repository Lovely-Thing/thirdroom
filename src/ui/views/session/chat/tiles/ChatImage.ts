import { ImageTile, Builder } from "@thirdroom/hydrogen-view-sdk";

import { ChatBaseMessage } from "./ChatBaseMessage";

import "./ChatImage.css";

export class ChatImage extends ChatBaseMessage {
  constructor(vm: ImageTile) {
    super(vm);
  }

  renderBody(t: Builder<ImageTile>, vm: ImageTile): Element {
    const { height } = vm;
    return t.div(
      { className: "ChatImage__body flex" },
      t.img({ src: vm.thumbnailUrl, style: `width: 340px; height: ${height}px;` })
    );
  }
  onClick() {}
}
