"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PopupComp = ({ isOpen, onClose, PopupData }) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="notice-dialog">
        <DialogHeader>
          <DialogTitle>{PopupData?.header}</DialogTitle>
          <DialogDescription>{PopupData?.description}</DialogDescription>
        </DialogHeader>
        <ul className="notice-dialog-list">
          {PopupData?.message?.map((message, index) => (
            <li key={index}>{message}</li>
          ))}
        </ul>
        <DialogFooter>
          <Button type="button" onClick={onClose}>Got it</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PopupComp;
