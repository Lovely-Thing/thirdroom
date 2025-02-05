import { Text } from "../../../atoms/text/Text";

import "./ChatHeader.css";

interface IChatHeader {
  avatar: React.ReactNode;
  title: string;
  options: React.ReactNode;
}

export function ChatHeader({ avatar, title, options }: IChatHeader) {
  return (
    <header className="ChatHeader flex items-center">
      <div className="shrink-0">{avatar}</div>
      <div className="ChatHeader__title grow">
        <Text className="truncate">{title}</Text>
      </div>
      <div className="ChatHeader__options shrink-0 flex">{options}</div>
    </header>
  );
}
