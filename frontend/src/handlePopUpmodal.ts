import { Modal } from "bootstrap";

export const handleModalPopUp = (elemId: string) => {
  const modalElement = document.getElementById(elemId);
  if (!modalElement) return;

  const modalInstance = Modal.getOrCreateInstance(modalElement);
  console.log(modalInstance)
  modalInstance.hide();
};
