import { DialogTitle } from "@headlessui/react";
import { FadersIcon, XIcon } from "@phosphor-icons/react";

interface Props {
  onClose: () => void;
}

export default function AdminModalHeader({ onClose }: Props) {
  return (
    <div className="border-b border-gray-100 bg-white px-6 py-5">
      <div className="flex items-center justify-between gap-x-4">
        <div className="flex items-center gap-x-3">
          <div className="flex-none rounded-lg bg-red-50 p-2 border border-red-100">
            <FadersIcon size={24} weight="bold" className="text-red-600" />
          </div>
          <DialogTitle
            as="h2"
            className="text-xl font-bold leading-6 text-gray-950"
          >
            ระบบบริหารจัดการราคาทองคำ
          </DialogTitle>
        </div>
        <button
          onClick={onClose}
          className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
        >
          <XIcon size={24} weight="bold" />
        </button>
      </div>
    </div>
  );
}
