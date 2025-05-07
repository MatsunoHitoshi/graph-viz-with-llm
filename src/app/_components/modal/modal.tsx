"use client";

import React from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { Button } from "../button/button";
import { CrossLargeIcon } from "../icons";

type ModalProps = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  children: React.ReactNode;
  title: string;
};

export const Modal = ({ isOpen, setIsOpen, children, title }: ModalProps) => {
  return (
    <Dialog
      open={isOpen}
      as="div"
      className="relative z-10 focus:outline-none"
      onClose={() => setIsOpen(false)}
    >
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            transition
            className="data-[closed]:transform-[scale(95%)] flex w-full max-w-md flex-col gap-4 rounded-xl border border-gray-500 bg-black/20 p-6 text-slate-50 backdrop-blur-3xl duration-300 ease-out data-[closed]:opacity-0"
          >
            <div className="flex flex-row items-center justify-between">
              <DialogTitle as="h3" className="font-semibold">
                {title}
              </DialogTitle>
              <Button
                className="!h-8 !w-8 !bg-transparent !p-2 hover:!bg-slate-50/10"
                onClick={() => {
                  setIsOpen(false);
                }}
              >
                <CrossLargeIcon height={16} width={16} color="white" />
              </Button>
            </div>

            <div>{children}</div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};
