"use client";

// Provider
import { useModal } from "@/providers/modal-providers";

// UI components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle // Import from the same package as other dialog components
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type Props = {
  heading?: string;
  subheading?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  maxWidth?: string;
};

const CustomModal = ({
  children,
  defaultOpen,
  subheading,
  heading,
  maxWidth,
}: Props) => {
  const { isOpen, setClose } = useModal();
  return (
    <Dialog open={isOpen || defaultOpen} onOpenChange={setClose}>
      <DialogContent
        className={cn(
          "overflow-y-scroll md:max-h-[700px] md:h-fit h-screen bg-card",
          maxWidth
        )}
      >
        <DialogHeader className="pt-8 text-left">
          {/* Always include a DialogTitle for accessibility */}
          <DialogTitle className="text-2xl font-bold">
            {heading || "Details"} {/* Use a default title if heading is not provided */}
          </DialogTitle>
          {subheading && <DialogDescription>{subheading}</DialogDescription>}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default CustomModal;