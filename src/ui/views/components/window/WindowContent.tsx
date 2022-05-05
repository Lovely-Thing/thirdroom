import classNames from "classnames";

import { Content } from "../../../atoms/content/Content";
import "./WindowContent.css";

interface WindowContentProps {
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  aside?: React.ReactNode;
  children: React.ReactNode;
}

export function WindowContent({ className, header, footer, aside, children }: WindowContentProps) {
  const contentClass = classNames("WindowContent flex", className);

  return (
    <div className={contentClass}>
      <Content className="WindowContent__main grow" top={header} bottom={footer}>
        {children}
      </Content>
      {aside && <aside className="WindowContent__aside">{aside}</aside>}
    </div>
  );
}