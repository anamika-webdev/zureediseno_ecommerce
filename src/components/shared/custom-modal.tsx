"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type CustomModalProps = {
  heading: string;
  subheading?: string;
  children: React.ReactNode;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

export default function CustomModal({
  heading,
  subheading,
  children,
  isOpen,
  setIsOpen,
}: CustomModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{heading}</DialogTitle>
          <DialogDescription>
            {subheading || "Fill out the form to add a new category."}
          </DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}