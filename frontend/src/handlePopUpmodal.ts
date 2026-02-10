export const handleModalPopUp = (elemId: string) => {
  const modalElement = document.getElementById(elemId);
  if (modalElement) {
    // Try to get instance
    let modalInstance = window.bootstrap.Modal.getInstance(modalElement);

    // If instance does not exist, create one
    if (!modalInstance) {
      modalInstance = new window.bootstrap.Modal(modalElement);
    }

    // Hide the modal
    modalInstance.hide();
  }
};
