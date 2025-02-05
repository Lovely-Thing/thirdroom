import React from "react";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import classNames from "classnames";

import "./Scroll.css";

interface IScroll {
  className?: string;
  orientation?: "horizontal" | "vertical" | "both";
  type?: "hover" | "scroll" | "always" | "auto";
  onScroll?: (event: React.UIEvent<HTMLDivElement>) => void;
  children: React.ReactNode;
  forwardRef?: React.RefObject<HTMLDivElement>;
}

export function Scroll({
  className,
  orientation = "vertical",
  type = "auto",
  onScroll,
  children,
  forwardRef,
}: IScroll) {
  const scrollClass = classNames("Scroll", className);

  return (
    <ScrollArea.Root className={scrollClass} type={type}>
      <ScrollArea.Viewport className="Scroll__viewport" ref={forwardRef} onScroll={onScroll}>
        {children}
      </ScrollArea.Viewport>
      {(orientation === "horizontal" || orientation === "both") && (
        <ScrollArea.ScrollAreaScrollbar className="Scroll__track" orientation="horizontal">
          <ScrollArea.Thumb className="Scroll__thumb" />
        </ScrollArea.ScrollAreaScrollbar>
      )}
      {(orientation === "vertical" || orientation === "both") && (
        <ScrollArea.ScrollAreaScrollbar className="Scroll__track" orientation="vertical">
          <ScrollArea.Thumb className="Scroll__thumb" />
        </ScrollArea.ScrollAreaScrollbar>
      )}
      <ScrollArea.Corner />
    </ScrollArea.Root>
  );
}
