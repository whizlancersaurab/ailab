export const handleModalPopUp = (elemId: string) => {
  const modalElement = document.getElementById(elemId) as HTMLElement;
  if (modalElement) {
    // Use getOrCreateInstance instead of manually checking
    const modalInstance = window.bootstrap.Modal.getOrCreateInstance(modalElement);
    modalInstance.hide();
  }
};
